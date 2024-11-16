// deno-lint-ignore-file no-explicit-any

import {
  EaCStatus,
  EaCStatusProcessingTypes,
  EaCUserRecord,
  EverythingAsCode,
  listenQueueAtomic,
  Logger,
  markEaCProcessed,
  waitOnEaCProcessing,
} from "./.deps.ts";
import { EaCDeleteRequest } from "./reqres/EaCDeleteRequest.ts";

export async function handleEaCDeleteRequest(
  logger: Logger,
  eacKv: Deno.Kv,
  commitKv: Deno.Kv,
  deleteReq: EaCDeleteRequest,
) {
  logger.debug(`Processing EaC delete for ${deleteReq.CommitID}`);

  const status = await eacKv.get<EaCStatus>([
    "EaC",
    "Status",
    deleteReq.EaC.EnterpriseLookup!,
    "ID",
    deleteReq.CommitID,
  ]);

  await waitOnEaCProcessing<EaCDeleteRequest>(
    eacKv,
    status.value!.EnterpriseLookup,
    status.value!.ID,
    deleteReq,
    () => {
      return handleEaCDeleteRequest(logger, eacKv, commitKv, deleteReq);
    },
    deleteReq.ProcessingSeconds,
  );

  const eac = await eacKv.get<EverythingAsCode>([
    "EaC",
    "Current",
    deleteReq.EaC.EnterpriseLookup!,
  ]);

  const userEaCResults = await eacKv.list<EaCUserRecord>({
    prefix: ["EaC", "Users", deleteReq.EaC.EnterpriseLookup!],
  });

  const eacUserRecords: EaCUserRecord[] = [];

  for await (const eacUserRecord of userEaCResults) {
    eacUserRecords.push(eacUserRecord.value);
  }

  delete status.value!.Messages.Queued;

  if (deleteReq.Archive) {
    status.value!.Processing = EaCStatusProcessingTypes.COMPLETE;
  } else {
    const { EnterpriseLookup, ParentEnterpriseLookup, ...deleteEaCDiff } =
      deleteReq.EaC;

    for (const deleteKey in deleteEaCDiff) {
      const deleteEaCDef = deleteEaCDiff[deleteKey] as Record<string, unknown>;

      const deleteFromEaC = (
        deleteRef: Record<string, any>,
        deleteFrom: any,
      ) => {
        for (const toDelete in deleteRef) {
          if (Array.isArray(deleteRef[toDelete])) {
            deleteFrom[toDelete] = (deleteFrom[toDelete] as []).filter(
              (x) => !(deleteRef[toDelete] as []).includes(x),
            );
          } else if (deleteRef[toDelete] === null) {
            delete deleteFrom[toDelete];
          } else if (deleteRef[toDelete] !== undefined) {
            if (deleteFrom[toDelete]) {
              deleteFromEaC(deleteRef[toDelete], deleteFrom[toDelete]);
            }
          }
        }
      };

      if (eac.value?.[deleteKey]) {
        deleteFromEaC(deleteEaCDef, eac.value![deleteKey]);
      }
    }

    status.value!.Processing = EaCStatusProcessingTypes.COMPLETE;
  }

  status.value!.EndTime = new Date();

  logger.debug(
    `Processed EaC delete for ${deleteReq.CommitID}:`,
    status.value!,
  );

  await listenQueueAtomic(
    commitKv,
    deleteReq,
    (op) => {
      op = markEaCProcessed(deleteReq.EaC.EnterpriseLookup!, op)
        .check(eac)
        .check(status)
        .set(
          [
            "EaC",
            "Status",
            deleteReq.EaC.EnterpriseLookup!,
            "ID",
            deleteReq.CommitID,
          ],
          status.value,
        );

      if (deleteReq.Archive) {
        op = op
          .set(["EaC", "Archive", deleteReq.EaC.EnterpriseLookup!], eac.value)
          .delete(["EaC", "Current", deleteReq.EaC.EnterpriseLookup!]);

        // TODO(ttrichar): Delete all licenses as well

        for (const eacUserRecord of eacUserRecords) {
          op = op
            .delete([
              "EaC",
              "Users",
              deleteReq.EaC.EnterpriseLookup!,
              eacUserRecord.Username,
            ])
            .delete([
              "User",
              eacUserRecord.Username,
              "EaC",
              deleteReq.EaC.EnterpriseLookup!,
            ]);

          if (eacUserRecord.Owner) {
            op = op
              .set(
                [
                  "EaC",
                  "Archive",
                  "Users",
                  deleteReq.EaC.EnterpriseLookup!,
                  eacUserRecord.Username,
                ],
                eacUserRecord,
              )
              .set(
                [
                  "User",
                  eacUserRecord.Username,
                  "Archive",
                  "EaC",
                  deleteReq.EaC.EnterpriseLookup!,
                ],
                eacUserRecord,
              );
          }
        }
      } else {
        op = op.set(
          ["EaC", "Current", deleteReq.EaC.EnterpriseLookup!],
          eac.value,
        );
      }

      return op;
    },
    eacKv,
  );
}
