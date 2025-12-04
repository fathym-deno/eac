// deno-lint-ignore-file no-explicit-any
import { listenQueueAtomic, TelemetryLogger } from "./.deps.ts";
import { EaCUserRecord } from "../../eac/EaCUserRecord.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { EaCStatus } from "../status/EaCStatus.ts";
import { EaCStatusProcessingTypes } from "../status/EaCStatusProcessingTypes.ts";
import { markEaCProcessed } from "../utils/markEaCProcessed.ts";
import { waitOnEaCProcessing } from "../utils/waitOnEaCProcessing.ts";
import { EaCDeleteRequest } from "./reqres/EaCDeleteRequest.ts";
import { EaCActuatorErrorResponse } from "../actuators/reqres/EaCActuatorErrorResponse.ts";
import { callEaCActuatorDelete } from "../utils/callEaCActuatorDelete.ts";

export async function handleEaCDeleteRequest(
  logger: TelemetryLogger,
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

  const deleteErrors: EaCActuatorErrorResponse[] = [];
  const {
    EnterpriseLookup: _ent,
    ParentEnterpriseLookup: _parent,
    ...deleteEaCDiff
  } = deleteReq.EaC;
  const diffKeys = Object.keys(deleteEaCDiff);

  logger.debug(
    `[delete ${deleteReq.CommitID}] diff keys: ${
      diffKeys.length ? diffKeys.join(", ") : "none"
    }`,
  );

  const currentEaC = eac.value!;
  const loadEaC = async (entLookup: string) => {
    const existing = await eacKv.get<EverythingAsCode>([
      "EaC",
      "Current",
      entLookup,
    ]);

    return existing.value!;
  };

  for (const deleteKey of diffKeys) {
    const deleteEaCDef = deleteEaCDiff[
      deleteKey as keyof typeof deleteEaCDiff
    ];

    const actuator = currentEaC.Actuators?.[deleteKey];

    let moduleDelete: Record<string, unknown> | undefined;

    if (
      deleteReq.Archive ||
      deleteEaCDef === null ||
      deleteEaCDef === undefined
    ) {
      const currentSegment = currentEaC[
        deleteKey as keyof typeof currentEaC
      ];

      if (
        currentSegment &&
        typeof currentSegment === "object" &&
        !Array.isArray(currentSegment)
      ) {
        moduleDelete = currentSegment as Record<string, unknown>;
      }
    } else if (
      typeof deleteEaCDef === "object" &&
      deleteEaCDef !== null &&
      !Array.isArray(deleteEaCDef)
    ) {
      moduleDelete = deleteEaCDef as Record<string, unknown>;
    }

    if (
      actuator &&
      moduleDelete &&
      Object.keys(moduleDelete).length > 0
    ) {
      const errors = await callEaCActuatorDelete(
        logger,
        loadEaC,
        actuator,
        deleteReq,
        deleteKey,
        currentEaC,
        moduleDelete,
      );

      if (errors.length > 0) {
        deleteErrors.push(...errors);
      }
    }

    if (deleteReq.Archive) {
      continue;
    }

    if (
      deleteEaCDef !== null &&
      typeof deleteEaCDef === "object" &&
      !Array.isArray(deleteEaCDef) &&
      currentEaC[deleteKey as keyof typeof currentEaC]
    ) {
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

      deleteFromEaC(
        deleteEaCDef as Record<string, any>,
        currentEaC[deleteKey as keyof typeof currentEaC],
      );
    } else if (deleteEaCDef === null) {
      delete currentEaC[deleteKey as keyof typeof currentEaC];
    }
  }

  const hadErrors = deleteErrors.length > 0;

  status.value!.Messages = status.value!.Messages || {};
  status.value!.Processing = hadErrors
    ? EaCStatusProcessingTypes.ERROR
    : EaCStatusProcessingTypes.COMPLETE;

  if (hadErrors) {
    for (const err of deleteErrors) {
      status.value!.Messages = {
        ...status.value!.Messages,
        ...err.Messages,
      };
    }

    logger.error(
      `[delete ${deleteReq.CommitID}] actuator delete errors=${deleteErrors.length}`,
    );
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

      if (!hadErrors) {
        if (deleteReq.Archive) {
          op = op
            .set(
              ["EaC", "Archive", deleteReq.EaC.EnterpriseLookup!],
              currentEaC,
            )
            .delete([
              "EaC",
              "Current",
              deleteReq.EaC.EnterpriseLookup!,
            ]);

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
              );

            if (eacUserRecord.Owner) {
              op = op.set(
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
            currentEaC,
          );
        }
      }

      return op;
    },
    eacKv,
  );
}
