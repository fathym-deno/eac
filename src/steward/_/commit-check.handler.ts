// deno-lint-ignore-file no-explicit-any
import { callEaCActuatorCheck, EaCActuatorCheckRequest, EaCActuatorErrorResponse, EaCStatus, EaCStatusProcessingTypes, enqueueAtomicOperation, EverythingAsCode, listenQueueAtomic, Logger, markEaCProcessed, merge } from "./.deps.ts";
import { EaCCommitCheckRequest } from "./reqres/EaCCommitCheckRequest.ts";
import { EaCCommitRequest } from "./reqres/EaCCommitRequest.ts";

// ---------- helpers ----------
const now = () => Date.now();
const ms = (t0: number) => Date.now() - t0;
const safeJson = (v: unknown) => {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};
const summarizeMsgs = (m: Record<string, unknown> | undefined) =>
  m
    ? Object.keys(m).slice(0, 5).join(", ") +
      (Object.keys(m).length > 5 ? ", …" : "")
    : "∅";
const summarizeErrors = (errs: EaCActuatorErrorResponse[]) => {
  if (!errs?.length) return "none";
  const first = errs[0];
  const firstMsg = typeof first?.Messages?.Error === "string" && first.Messages.Error !== "{}" ? first.Messages.Error : summarizeMsgs(first?.Messages);
  return `${errs.length} error(s); first=${firstMsg}`;
};
// --------------------------------

export async function handleEaCCommitCheckRequest(
  logger: Logger,
  eacKv: Deno.Kv,
  commitKv: Deno.Kv,
  commitCheckReq: EaCCommitCheckRequest,
) {
  const t0 = now();
  const commitId = commitCheckReq.CommitID;
  logger.info(
    `[check ${commitId}] start checks=${commitCheckReq.Checks.length}`,
  );

  const { EnterpriseLookup, ParentEnterpriseLookup, Actuators, Details } = commitCheckReq.EaC;

  const statusKey = ["EaC", "Status", EnterpriseLookup!, "ID", commitId];

  const status = await eacKv.get<EaCStatus>(statusKey);

  if (!status?.value) {
    logger.error(
      `[check ${commitId}] status not found at key ${safeJson(statusKey)}`,
    );
    throw new Error(`Status not found for commit ${commitId}`);
  }

  const errors: EaCActuatorErrorResponse[] = [];
  const allChecks: EaCActuatorCheckRequest[] = [];

  // Remove queued marker before processing
  delete status.value!.Messages.Queued;

  // Process each check with concise logging
  const checkResponses = await Promise.all(
    commitCheckReq.Checks.map(async (check, idx) => {
      const label = `${check?.Key ?? "unknown"}:${check?.Type ?? "?"}`;
      logger.debug(`[check ${commitId}] (#${idx}) run ${label}`);

      const checkResp = await callEaCActuatorCheck(
        logger,
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

      // Merge messages into status and persist incrementally
      status.value!.Messages = merge(
        status.value!.Messages,
        checkResp.Messages,
      );
      await eacKv.set(statusKey, status.value!);

      const msgSummary = summarizeMsgs(checkResp.Messages);
      logger.debug(
        `[check ${commitId}] (#${idx}) ${label} -> complete=${checkResp.Complete} hasError=${!!checkResp
          .HasError} msgs=[${msgSummary}]`,
      );

      if (checkResp.HasError) {
        errors.push({ HasError: true, Messages: checkResp.Messages });
        logger.error(
          `[check ${commitId}] (#${idx}) ${label} ERROR: ${typeof checkResp.Messages?.Error === "string" ? checkResp.Messages.Error : msgSummary}`,
        );
      }

      if (!checkResp.Complete) {
        allChecks.push(check);
        logger.info(
          `[check ${commitId}] (#${idx}) ${label} not complete → requeue`,
        );
      }

      return checkResp;
    }),
  );

  // Update overall status based on results
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

  logger.info(
    `[check ${commitId}] result processing=${EaCStatusProcessingTypes[status.value!.Processing]} ` +
      `pendingChecks=${allChecks.length} errors=${errors.length} durationMs=${ms(t0)}`,
  );
  logger.debug(
    () =>
      `[check ${commitId}] messages keys=[${
        summarizeMsgs(
          status.value!.Messages,
        )
      }]`,
  );

  await listenQueueAtomic(
    commitKv,
    commitCheckReq,
    (op) => {
      op = op
        .set(["EaC", "Status", EnterpriseLookup!, "ID", commitId], status.value)
        .set(["EaC", "Status", EnterpriseLookup!, "EaC"], status.value);

      if (allChecks.length > 0) {
        const newCommitCheckReq: EaCCommitCheckRequest = {
          ...commitCheckReq,
          Checks: allChecks,
          nonce: undefined,
          versionstamp: undefined,
        };

        op = enqueueAtomicOperation(op, newCommitCheckReq, 1000 * 10);

        logger.info(
          `[check ${commitId}] requeued ${allChecks.length} check(s) for 10s delay`,
        );
        logger.debug(
          () =>
            `[check ${commitId}] requeue detail: ${
              safeJson(
                allChecks.map((c) => ({
                  key: (c as any).Key,
                  type: (c as any).Type,
                })),
              )
            }`,
        );
      } else if (errors.length > 0) {
        op = markEaCProcessed(EnterpriseLookup!, op);

        logger.error(
          `[check ${commitId}] processed with errors: ${
            summarizeErrors(
              errors,
            )
          }`,
        );
        logger.debug(
          () => `[check ${commitId}] errors detail: ${safeJson(errors)}`,
        );
      } else {
        let saveEaC = { ...commitCheckReq.EaC } as EverythingAsCode;

        const toProcessEaC: EverythingAsCode = { EnterpriseLookup };

        if (commitCheckReq.ToProcessKeys.length > 0) {
          // move remaining keys into a new commit
          commitCheckReq.ToProcessKeys.forEach((tpk) => {
            (toProcessEaC as any)[tpk] = saveEaC[tpk as keyof typeof saveEaC];
            delete saveEaC[tpk as keyof typeof saveEaC];
          });

          saveEaC = merge(commitCheckReq.OriginalEaC, saveEaC);

          const commitReq: EaCCommitRequest = {
            CommitID: commitId,
            EaC: toProcessEaC,
            JWT: commitCheckReq.JWT,
            ProcessingSeconds: commitCheckReq.ProcessingSeconds,
            Username: commitCheckReq.Username,
          };

          op = enqueueAtomicOperation(op, commitReq);

          logger.info(
            `[check ${commitId}] checks complete → requeued commit for keys ` +
              commitCheckReq.ToProcessKeys.join(","),
          );
        } else {
          op = markEaCProcessed(EnterpriseLookup!, op);
          logger.info(`[check ${commitId}] processed successfully`);
        }

        op = op.set(["EaC", "Current", EnterpriseLookup!], saveEaC);
      }

      return op;
    },
    eacKv,
  );
}
