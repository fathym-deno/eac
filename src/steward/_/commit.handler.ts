import {
  AtomicOperationHandler,
  callEaCActuator,
  EaCActuatorCheckRequest,
  EaCActuatorErrorResponse,
  EaCMetadataBase,
  EaCModuleActuator,
  EaCStatus,
  EaCStatusProcessingTypes,
  EaCUserRecord,
  enqueueAtomicOperation,
  EverythingAsCode,
  listenQueueAtomic,
  Logger,
  markEaCProcessed,
  merge,
  waitOnEaCProcessing,
} from "./.deps.ts";
import { EaCCommitCheckRequest } from "./reqres/EaCCommitCheckRequest.ts";
import { EaCCommitRequest } from "./reqres/EaCCommitRequest.ts";

// ---------- helpers ----------
function t0() {
  return Date.now();
}
function dt(ms0: number) {
  return Date.now() - ms0;
}
function safeErr(e: unknown) {
  if (e instanceof Error) {
    return { name: e.name, message: e.message, stack: e.stack };
  }
  try {
    return { message: JSON.stringify(e) };
  } catch {
    return { message: String(e) };
  }
}
function summarizeErrors(errors: EaCActuatorErrorResponse[]): string {
  if (!errors?.length) return "none";
  const first = errors[0];
  const msg =
    typeof first?.Messages?.Error === "string" && first.Messages.Error !== "{}"
      ? first.Messages.Error
      : Object.keys(first?.Messages ?? {}).join(", ") || "unknown";
  return `${errors.length} error(s); first="${msg}"`;
}
function summarizeChecks(checks: EaCActuatorCheckRequest[]): string {
  return `${checks?.length ?? 0} check(s)`;
}
// --------------------------------

export async function handleEaCCommitRequest(
  logger: Logger,
  eacKv: Deno.Kv,
  commitKv: Deno.Kv,
  commitReq: EaCCommitRequest,
) {
  const commitId = commitReq.CommitID;
  const start = t0();

  logger.info(`[commit ${commitId}] start`);

  if (!commitReq.EaC.EnterpriseLookup) {
    logger.error(`[commit ${commitId}] missing EnterpriseLookup`);
    throw new Error("The enterprise lookup must be provided.");
  }

  if (commitReq.EaC.Details && !commitReq.EaC.Details!.Description) {
    commitReq.EaC.Details.Description = commitReq.EaC.Details.Name;
  }

  const { EnterpriseLookup, ParentEnterpriseLookup, Details, ...eacDiff } =
    commitReq.EaC;

  const statusKey = [
    "EaC",
    "Status",
    EnterpriseLookup,
    "ID",
    commitReq.CommitID,
  ];

  let status = await eacKv.get<EaCStatus>(statusKey);

  if (!status?.value) {
    logger.warn(
      `[commit ${commitId}] status not found at key ${
        JSON.stringify(
          statusKey,
        )
      }`,
    );
  } else {
    logger.debug(
      `[commit ${commitId}] status found processing=${status.value.Processing}`,
    );
  }

  await waitOnEaCProcessing(
    eacKv,
    status.value!.EnterpriseLookup,
    status.value!.ID,
    commitReq,
    () => {
      logger.debug(
        `[commit ${commitId}] detected concurrent processing → retrying`,
      );
      return handleEaCCommitRequest(logger, eacKv, commitKv, commitReq);
    },
    commitReq.ProcessingSeconds,
  );

  const existingEaC = await eacKv.get<EverythingAsCode>([
    "EaC",
    "Current",
    EnterpriseLookup,
  ]);

  let saveEaC: EverythingAsCode = existingEaC?.value! || {
    EnterpriseLookup,
    ParentEnterpriseLookup,
  };

  const diffKeys = Object.keys(eacDiff);
  logger.info(
    `[commit ${commitId}] diff keys: ${
      diffKeys.length ? diffKeys.join(", ") : "∅"
    }`,
  );

  if (Details) {
    saveEaC.Details = Details;
  }

  const errors: EaCActuatorErrorResponse[] = [];
  const allChecks: EaCActuatorCheckRequest[] = [];

  // Pre-merge so actuators see a consolidated view
  saveEaC = merge(saveEaC, eacDiff);
  saveEaC.Actuators = saveEaC.Actuators ?? {};
  delete saveEaC.Actuators!.$Force;

  const diffCalls: Record<number, (() => Promise<void>)[]> = {};
  let toProcess = { keys: [...diffKeys] };

  diffKeys.forEach(
    processDiffKey(
      logger,
      eacKv,
      eacDiff,
      saveEaC,
      commitReq,
      toProcess,
      allChecks,
      errors,
      diffCalls,
    ),
  );

  const orders = Object.keys(diffCalls)
    .map((k) => Number(k))
    .sort((a, b) => a - b);
  logger.info(
    `[commit ${commitId}] scheduled ${
      orders.reduce(
        (n, o) => n + (diffCalls[o]?.length || 0),
        0,
      )
    } diff call(s) across orders [${orders.join(", ")}]`,
  );

  await processDiffCalls(logger, diffCalls, allChecks, errors, status.value!);

  if (errors.length === 0 && allChecks.length === 0) {
    status.value!.Processing = EaCStatusProcessingTypes.COMPLETE;
    status.value!.EndTime = new Date();
    delete status.value!.Messages.Queued;
  }

  logger.info(
    `[commit ${commitId}] result checks=${allChecks.length} errors=${errors.length} durationMs=${
      dt(start)
    }`,
  );

  await listenQueueAtomic(
    commitKv,
    commitReq,
    configureListenQueueOp(
      logger,
      existingEaC,
      status,
      EnterpriseLookup,
      commitReq,
      allChecks,
      errors,
      saveEaC,
      toProcess,
    ),
    eacKv,
  );

  logger.debug(`[commit ${commitId}] listenQueueAtomic scheduled`);
}

function configureListenQueueOp(
  logger: Logger,
  existingEaC: Deno.KvEntryMaybe<EverythingAsCode>,
  status: Deno.KvEntryMaybe<EaCStatus>,
  entLookup: string,
  commitReq: EaCCommitRequest,
  allChecks: EaCActuatorCheckRequest[],
  errors: EaCActuatorErrorResponse[],
  saveEaC: EverythingAsCode,
  toProcess: { keys: string[] },
): AtomicOperationHandler {
  const commitId = commitReq.CommitID;

  return (op) => {
    op = op
      .check(existingEaC)
      .check(status)
      .set(
        ["EaC", "Status", entLookup, "ID", commitReq.CommitID],
        status.value,
      );

    if (commitReq.Username) {
      const eacUserRecord: EaCUserRecord = {
        EnterpriseLookup: entLookup,
        EnterpriseName: saveEaC.Details!.Name!,
        Owner: true,
        ParentEnterpriseLookup: saveEaC.ParentEnterpriseLookup!,
        Username: commitReq.Username,
      };

      op = op
        .set(["User", commitReq.Username, "EaC", entLookup], eacUserRecord)
        .set(["EaC", "Users", entLookup, commitReq.Username], eacUserRecord);
    }

    if (allChecks.length > 0) {
      const commitCheckReq: EaCCommitCheckRequest = {
        ...commitReq,
        Checks: allChecks,
        EaC: saveEaC,
        OriginalEaC: existingEaC?.value!,
        ToProcessKeys: toProcess.keys,
        nonce: undefined,
        versionstamp: undefined,
      };

      op = enqueueAtomicOperation(op, commitCheckReq, 1000 * 5);

      logger.info(
        `[commit ${commitId}] queued ${
          summarizeChecks(
            allChecks,
          )
        } for follow-up`,
      );
      logger.debug(
        () =>
          `[commit ${commitId}] checks detail: ${
            JSON.stringify(
              allChecks.map((c) => ({ key: c.Key, type: c.Type })),
            )
          }`,
      );
    } else if (errors.length > 0) {
      op = markEaCProcessed(entLookup, op);

      logger.error(
        `[commit ${commitId}] processed with errors: ${
          summarizeErrors(errors)
        }`,
      );
      logger.debug(
        () => `[commit ${commitId}] errors detail: ${JSON.stringify(errors)}`,
      );
    } else {
      op = markEaCProcessed(entLookup, op).set(
        ["EaC", "Current", entLookup],
        saveEaC,
      );

      logger.info(`[commit ${commitId}] processed successfully`);
    }

    return op;
  };
}

async function processDiffCalls(
  logger: Logger,
  diffCalls: Record<number, (() => Promise<void>)[]>,
  allChecks: EaCActuatorCheckRequest[],
  errors: EaCActuatorErrorResponse[],
  status: EaCStatus,
): Promise<void> {
  const commitId = status.ID;

  const ordered = Object.keys(diffCalls)
    .map((k) => Number.parseInt(k))
    .sort((a, b) => a - b);

  for (const order of ordered) {
    const calls = diffCalls[order] ?? [];
    logger.debug(
      `[commit ${commitId}] processing order ${order} (${calls.length} call(s))`,
    );
    const start = t0();

    // Execute each call with isolation so one failure doesn't hide others
    for (let i = 0; i < calls.length; i++) {
      try {
        await calls[i]();
      } catch (err) {
        const safe = safeErr(err);
        errors.push({
          HasError: true,
          Messages: {
            Error: safe.message ?? "Unknown error",
            Name: safe.name,
            Stack: safe.stack,
            Order: order,
          },
        });
        logger.error(
          `[commit ${commitId}] actuator call failed at order=${order} idx=${i}`,
          safe,
        );
      }
    }

    logger.debug(`[commit ${commitId}] order ${order} done in ${dt(start)}ms`);

    if (errors.length > 0) {
      status.Processing = EaCStatusProcessingTypes.ERROR;
      for (const error of errors) {
        status.Messages = merge(status.Messages, error.Messages);
      }
      status.EndTime = new Date();
      delete status.Messages.Queued;

      logger.error(
        `[commit ${commitId}] halting after order ${order}; ${
          summarizeErrors(
            errors,
          )
        }`,
      );
      break;
    } else if (allChecks.length > 0) {
      status.Processing = EaCStatusProcessingTypes.PROCESSING;
      status.Messages.Queued = "Processing";
      logger.info(
        `[commit ${commitId}] checks required → halting diff execution (queued follow-up)`,
      );
      break;
    }
  }
}

function processDiffKey(
  logger: Logger,
  denoKv: Deno.Kv,
  eacDiff: EverythingAsCode,
  saveEaC: EverythingAsCode,
  commitReq: EaCCommitRequest,
  toProcess: { keys: string[] },
  allChecks: EaCActuatorCheckRequest[],
  errors: EaCActuatorErrorResponse[],
  diffCalls: Record<number, (() => Promise<void>)[]>,
): (key: string) => void {
  const commitId = commitReq.CommitID;

  return (key) => {
    logger.debug(`[commit ${commitId}] plan key=${key}`);

    const diff = (eacDiff as Record<string, unknown>)[key];

    if (diff === undefined) {
      logger.debug(`[commit ${commitId}] key=${key} has undefined diff → skip`);
      return;
    }

    const actuator = saveEaC.Actuators![key];

    if (actuator) {
      const process = processEaCActuator(
        logger,
        denoKv,
        diff,
        actuator,
        commitReq,
        key,
        saveEaC,
        toProcess,
        allChecks,
        errors,
      );

      diffCalls[actuator.Order] = [
        ...(diffCalls[actuator.Order] || []),
        process,
      ];
      logger.debug(
        `[commit ${commitId}] scheduled key=${key} at order=${actuator.Order}`,
      );
    } else {
      // No actuator for this key; it was already merged into saveEaC above
      logger.info(
        `[commit ${commitId}] no actuator for key=${key} → using merged diff only`,
      );
    }
  };
}

function processEaCActuator(
  logger: Logger,
  denoKv: Deno.Kv,
  diff: unknown,
  actuator: EaCModuleActuator,
  commitReq: EaCCommitRequest,
  key: string,
  saveEaC: Record<string, unknown>,
  toProcess: { keys: string[] },
  allChecks: EaCActuatorCheckRequest[],
  errors: EaCActuatorErrorResponse[],
): () => Promise<void> {
  const commitId = commitReq.CommitID;

  return async () => {
    const start = t0();
    logger.debug(
      `[commit ${commitId}] run actuator key=${key} order=${actuator.Order}`,
    );

    try {
      if (
        !commitReq.SkipActuators &&
        !Array.isArray(diff) &&
        typeof diff === "object" &&
        diff !== null
      ) {
        const handled = await callEaCActuator(
          async (entLookup) => {
            const eac = await denoKv.get<EverythingAsCode>([
              "EaC",
              "Current",
              entLookup,
            ]);
            return eac.value!;
          },
          actuator,
          commitReq,
          key,
          saveEaC,
          diff as EaCMetadataBase,
        );

        toProcess.keys = toProcess.keys.filter((k) => k !== key);

        if (handled.Checks?.length) {
          allChecks.push(...handled.Checks);
          logger.info(
            `[commit ${commitId}] key=${key} produced ${handled.Checks.length} check(s)`,
          );
        }

        if (handled.Errors?.length) {
          errors.push(...handled.Errors);
          logger.error(
            `[commit ${commitId}] key=${key} returned ${
              summarizeErrors(
                handled.Errors,
              )
            }`,
          );
          logger.debug(
            () =>
              `[commit ${commitId}] key=${key} error detail: ${
                JSON.stringify(
                  handled.Errors,
                )
              }`,
          );
        }

        if (handled.Result) {
          saveEaC[key] = merge(saveEaC[key] || {}, handled.Result as object);
          logger.debug(`[commit ${commitId}] key=${key} merged result`);
        }
      } else if (diff !== undefined) {
        saveEaC[key] = merge(saveEaC[key] || {}, diff || {});
        logger.debug(
          `[commit ${commitId}] key=${key} merged raw diff (no actuator)`,
        );
      }
    } catch (err) {
      const safe = safeErr(err);
      errors.push({
        HasError: true,
        Messages: {
          Error: safe.message ?? "Unknown error",
          Name: safe.name,
          Stack: safe.stack,
          Key: key,
          Order: actuator.Order,
        },
      });
      logger.error(`[commit ${commitId}] key=${key} actuator threw`, safe);
    } finally {
      logger.debug(`[commit ${commitId}] key=${key} done in ${dt(start)}ms`);
    }
  };
}
