// deno-lint-ignore-file no-explicit-any
import {
  callEaCActuatorCheck,
  EaCActuatorCheckRequest,
  EaCActuatorErrorResponse,
  EaCStatus,
  EaCStatusProcessingTypes,
  enqueueAtomicOperation,
  EverythingAsCode,
  listenQueueAtomic,
  Logger,
  markEaCProcessed,
  merge,
} from "./.deps.ts";
import { EaCCommitCheckRequest } from "./reqres/EaCCommitCheckRequest.ts";
import { EaCCommitRequest } from "./reqres/EaCCommitRequest.ts";

export async function handleEaCCommitCheckRequest(
  logger: Logger,
  eacKv: Deno.Kv,
  commitKv: Deno.Kv,
  commitCheckReq: EaCCommitCheckRequest,
) {
  logger.debug(`Processing EaC commit check for ${commitCheckReq.CommitID}`);

  const { EnterpriseLookup, ParentEnterpriseLookup, Actuators, Details } =
    commitCheckReq.EaC;

  const statusKey = [
    "EaC",
    "Status",
    EnterpriseLookup!,
    "ID",
    commitCheckReq.CommitID,
  ];

  const status = await eacKv.get<EaCStatus>(statusKey);

  const errors: EaCActuatorErrorResponse[] = [];

  const allChecks: EaCActuatorCheckRequest[] = [];

  delete status.value!.Messages.Queued;

  let checkResponses = await Promise.all(
    commitCheckReq.Checks.map(async (check) => {
      const checkResp = await callEaCActuatorCheck(
        async (entLookup) => {
          const eac = await eacKv.get<EverythingAsCode>([
            "EaC",
            "Current",
            entLookup,
          ]);

          return eac.value!;
        },
        Actuators!,
        commitCheckReq.JWT,
        check,
      );

      status.value!.Messages = merge(
        status.value!.Messages,
        checkResp.Messages,
      );

      await eacKv.set(statusKey, status.value!);

      if (checkResp.HasError) {
        errors.push({
          HasError: true,
          Messages: checkResp.Messages,
        });
      }

      if (!checkResp.Complete) {
        allChecks.push(check);
      }

      return checkResp;
    }),
  );

  if (errors.length > 0) {
    status.value!.Processing = EaCStatusProcessingTypes.ERROR;

    for (const error of errors) {
      status.value!.Messages = merge(status.value!.Messages, error.Messages);
    }

    status.value!.EndTime = new Date();
  } else if (allChecks.length > 0) {
    status.value!.Processing = EaCStatusProcessingTypes.PROCESSING;
  } else {
    status.value!.Processing = EaCStatusProcessingTypes.COMPLETE;

    status.value!.EndTime = new Date();
  }

  await listenQueueAtomic(
    commitKv,
    commitCheckReq,
    (op) => {
      op = op
        .set(
          [
            "EaC",
            "Status",
            commitCheckReq.EaC.EnterpriseLookup!,
            "ID",
            commitCheckReq.CommitID,
          ],
          status.value,
        )
        .set(
          ["EaC", "Status", commitCheckReq.EaC.EnterpriseLookup!, "EaC"],
          status.value,
        );

      if (allChecks.length > 0) {
        const newCommitCheckReq: EaCCommitCheckRequest = {
          ...commitCheckReq,
          Checks: allChecks,
          nonce: undefined,
          versionstamp: undefined,
        };

        op = enqueueAtomicOperation(op, newCommitCheckReq, 1000 * 10);

        logger.debug(`Requeuing EaC commit ${commitCheckReq.CommitID} checks`);
      } else if (errors.length > 0) {
        op = markEaCProcessed(EnterpriseLookup!, op);

        logger.error(
          `Processed EaC commit ${commitCheckReq.CommitID}, from checks, with errors`,
          errors,
        );
      } else {
        let saveEaC = { ...commitCheckReq.EaC } as EverythingAsCode;

        const toProcessEaC: EverythingAsCode = {
          EnterpriseLookup,
        };

        if (commitCheckReq.ToProcessKeys.length > 0) {
          commitCheckReq.ToProcessKeys.forEach((tpk) => {
            (toProcessEaC as any)[tpk] = saveEaC[tpk as keyof typeof saveEaC];

            delete saveEaC[tpk as keyof typeof saveEaC];
          });

          saveEaC = merge(commitCheckReq.OriginalEaC, saveEaC);

          const commitReq: EaCCommitRequest = {
            CommitID: commitCheckReq.CommitID,
            EaC: toProcessEaC,
            JWT: commitCheckReq.JWT,
            ProcessingSeconds: commitCheckReq.ProcessingSeconds,
            Username: commitCheckReq.Username,
          };

          op = enqueueAtomicOperation(op, commitReq);

          logger.debug(
            `Completed processing checks for commit ${commitCheckReq.CommitID}, requeued with keys ${
              commitCheckReq.ToProcessKeys.join(",")
            } `,
          );
        } else {
          op = markEaCProcessed(EnterpriseLookup!, op);

          logger.debug(`Processed EaC commit ${commitCheckReq.CommitID}`);
        }

        op = op.set(["EaC", "Current", EnterpriseLookup!], saveEaC);
      }

      return op;
    },
    eacKv,
  );
}
