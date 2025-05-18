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
} from './.deps.ts';
import { EaCCommitCheckRequest } from './reqres/EaCCommitCheckRequest.ts';
import { EaCCommitRequest } from './reqres/EaCCommitRequest.ts';

export async function handleEaCCommitRequest(
  logger: Logger,
  eacKv: Deno.Kv,
  commitKv: Deno.Kv,
  commitReq: EaCCommitRequest
) {
  logger.debug(`Processing EaC commit for ${commitReq.CommitID}`);

  if (!commitReq.EaC.EnterpriseLookup) {
    throw new Error('The enterprise lookup must be provided.');
  }

  if (commitReq.EaC.Details && !commitReq.EaC.Details!.Description) {
    commitReq.EaC.Details.Description = commitReq.EaC.Details.Name;
  }

  const { EnterpriseLookup, ParentEnterpriseLookup, Details, ...eacDiff } =
    commitReq.EaC;

  const statusKey = [
    'EaC',
    'Status',
    EnterpriseLookup,
    'ID',
    commitReq.CommitID,
  ];

  let status = await eacKv.get<EaCStatus>(statusKey);

  await waitOnEaCProcessing(
    eacKv,
    status.value!.EnterpriseLookup,
    status.value!.ID,
    commitReq,
    () => {
      return handleEaCCommitRequest(logger, eacKv, commitKv, commitReq);
    },
    commitReq.ProcessingSeconds
  );

  const existingEaC = await eacKv.get<EverythingAsCode>([
    'EaC',
    'Current',
    EnterpriseLookup,
  ]);

  let saveEaC: EverythingAsCode = existingEaC?.value! || {
    EnterpriseLookup,
    ParentEnterpriseLookup,
  };

  const diffKeys = Object.keys(eacDiff);

  if (Details) {
    saveEaC.Details = Details;
  }

  const errors: EaCActuatorErrorResponse[] = [];

  const allChecks: EaCActuatorCheckRequest[] = [];

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
      diffCalls
    )
  );

  await processDiffCalls(logger, diffCalls, allChecks, errors, status.value!);

  if (errors.length === 0 && allChecks.length === 0) {
    status.value!.Processing = EaCStatusProcessingTypes.COMPLETE;

    status.value!.EndTime = new Date();

    delete status.value!.Messages.Queued;
  }

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
      toProcess
    ),
    eacKv
  );
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
  toProcess: { keys: string[] }
): AtomicOperationHandler {
  return (op) => {
    op = op
      .check(existingEaC)
      .check(status)
      .set(
        ['EaC', 'Status', entLookup, 'ID', commitReq.CommitID],
        status.value
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
        .set(['User', commitReq.Username, 'EaC', entLookup], eacUserRecord)
        .set(['EaC', 'Users', entLookup, commitReq.Username], eacUserRecord);
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

      logger.debug(`Queuing EaC commit ${commitReq.CommitID} checks`);
    } else if (errors.length > 0) {
      op = markEaCProcessed(entLookup, op);

      logger.error(`Processed EaC commit ${commitReq.CommitID} with errors`);
      logger.error(errors);
    } else {
      op = markEaCProcessed(entLookup, op).set(
        ['EaC', 'Current', entLookup],
        saveEaC
      );

      logger.debug(`Processed EaC commit ${commitReq.CommitID}`);
    }

    return op;
  };
}

async function processDiffCalls(
  logger: Logger,
  diffCalls: Record<number, (() => Promise<void>)[]>,
  allChecks: EaCActuatorCheckRequest[],
  errors: EaCActuatorErrorResponse[],
  status: EaCStatus
): Promise<void> {
  const ordered = Object.keys(diffCalls)
    .map((k) => Number.parseInt(k))
    .sort((a, b) => {
      return a < b ? -1 : a > b ? 1 : 0;
    });

  for (const order of ordered) {
    logger.debug(
      `Processing EaC commit ${status.ID} diff calls (${
        diffCalls[order]?.length || 0
      }) for order '${order}'`
    );

    await Promise.all(diffCalls[order].map((dc) => dc()));

    if (errors.length > 0) {
      status.Processing = EaCStatusProcessingTypes.ERROR;

      for (const error of errors) {
        status.Messages = merge(status.Messages, error.Messages);
      }

      status.EndTime = new Date();

      delete status.Messages.Queued;

      break;
    } else if (allChecks.length > 0) {
      status.Processing = EaCStatusProcessingTypes.PROCESSING;

      status.Messages.Queued = 'Processing';

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
  diffCalls: Record<number, (() => Promise<void>)[]>
): (key: string) => void {
  return (key) => {
    logger.debug(
      `Preparing EaC commit ${commitReq.CommitID} to process key ${key}`
    );

    const diff = (eacDiff as Record<string, unknown>)[key];

    if (diff) {
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
          errors
        );

        diffCalls[actuator.Order] = [
          ...(diffCalls[actuator.Order] || []),
          process,
        ];
      }
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
  errors: EaCActuatorErrorResponse[]
): () => Promise<void> {
  return async () => {
    logger.debug(`Processing EaC commit ${commitReq.CommitID} for key ${key}`);

    if (
      !commitReq.SkipActuators &&
      !Array.isArray(diff) &&
      typeof diff === 'object' &&
      diff !== null &&
      diff !== undefined
    ) {
      const handled = await callEaCActuator(
        async (entLookup) => {
          const eac = await denoKv.get<EverythingAsCode>([
            'EaC',
            'Current',
            entLookup,
          ]);

          return eac.value!;
        },
        actuator,
        commitReq,
        key,
        saveEaC,
        diff as EaCMetadataBase
      );

      toProcess.keys = toProcess.keys.filter((k) => k !== key);

      allChecks.push(...(handled.Checks || []));

      saveEaC[key] = merge(saveEaC[key] || {}, handled.Result as object);

      errors.push(...handled.Errors);
    } else if (diff !== undefined) {
      saveEaC[key] = merge(saveEaC[key] || {}, diff || {});
    }
  };
}
