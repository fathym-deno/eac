import {
  EaCActuatorCheckRequest,
  EaCActuatorErrorResponse,
  EaCActuatorRequest,
  EaCActuatorResponse,
  EaCCommitRequest,
  EaCMetadataBase,
  EaCModuleActuator,
  EverythingAsCode,
  isEaCActuatorErrorResponse,
  isEaCActuatorResponse,
  merge,
} from "./.deps.ts";

/**
 * Executes an EaC module actuator with the provided parameters and processes the results.
 *
 * @param loadEac Function to load an `EverythingAsCode` instance by enterprise lookup.
 * @param handler The EaC module actuator to call.
 * @param commitReq The commit request containing authentication and commit ID.
 * @param key The key identifying the current EaC data.
 * @param currentEaC The current `EverythingAsCode` state.
 * @param diff The differences to be applied to the current EaC state.
 * @returns An object containing checks, errors, and the updated result.
 */
export async function callEaCHandler<T extends EaCMetadataBase>(
  loadEac: (entLookup: string) => Promise<EverythingAsCode>,
  handler: EaCModuleActuator,
  commitReq: EaCCommitRequest,
  key: string,
  currentEaC: EverythingAsCode,
  diff: T,
): Promise<{
  Checks: EaCActuatorCheckRequest[];
  Errors: EaCActuatorErrorResponse[];
  Result: T;
}> {
  const current = (currentEaC[key] || {}) as T;

  const parentEaC = currentEaC?.ParentEnterpriseLookup
    ? await loadEac(currentEaC.ParentEnterpriseLookup)
    : undefined;

  if (handler != null) {
    const toExecute = Object.keys(diff || {}).map(async (diffLookup) => {
      const result = await fetch(handler.APIPath, {
        method: "post",
        body: JSON.stringify({
          CommitID: commitReq.CommitID,
          EaC: currentEaC,
          Lookup: diffLookup,
          Model: diff![diffLookup],
          ParentEaC: parentEaC,
        } as EaCActuatorRequest),
        headers: {
          Authorization: `Bearer ${commitReq.JWT}`,
        },
      });

      const resultStr = await result.text();

      try {
        return {
          Lookup: diffLookup,
          Response: JSON.parse(resultStr) as
            | EaCActuatorResponse
            | EaCActuatorErrorResponse,
        };
      } catch {
        return {
          Lookup: diffLookup,
          Response: {
            Lookup: diffLookup,
            Model: diff![diffLookup],
          } as EaCActuatorResponse,
        };
      }
    });

    const handledResponses = await Promise.all(toExecute);

    const errors: EaCActuatorErrorResponse[] = [];
    const checks: EaCActuatorCheckRequest[] = [];

    if (current) {
      for (const handled of handledResponses) {
        const handledResponse = handled.Response;

        if (isEaCActuatorResponse(handledResponse)) {
          if (handled.Lookup !== handledResponse.Lookup) {
            current[handledResponse.Lookup] = current[handled.Lookup];
            delete current[handled.Lookup];
          }

          current[handledResponse.Lookup] = merge(
            current[handledResponse.Lookup] as object,
            handledResponse.Model as object,
          );

          handledResponse.Checks?.forEach((check) => {
            check.EaC = currentEaC;
            check.Type = key;
          });

          checks.push(...(handledResponse.Checks || []));
        } else if (isEaCActuatorErrorResponse(handledResponse)) {
          errors.push(handledResponse);
        }
      }
    }

    return {
      Checks: checks,
      Errors: errors,
      Result: current,
    };
  } else {
    return {
      Checks: [],
      Errors: [],
      Result: current,
    };
  }
}
