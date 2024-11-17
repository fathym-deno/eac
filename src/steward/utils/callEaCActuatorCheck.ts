import {
  EaCActuatorCheckRequest,
  EaCActuatorCheckResponse,
  EaCModuleActuators,
  EverythingAsCode,
} from "./.deps.ts";

/**
 * Executes a handler check for a specific EaC handler.
 *
 * @param loadEaC Function to load an `EverythingAsCode` instance by enterprise lookup.
 * @param actuators The available EaC module actuators.
 * @param jwt Authentication token.
 * @param req The handler check request.
 * @returns The response from the handler check.
 */
export async function callEaCActuatorCheck(
  loadEaC: (entLookup: string) => Promise<EverythingAsCode>,
  actuators: EaCModuleActuators,
  jwt: string,
  req: EaCActuatorCheckRequest,
): Promise<EaCActuatorCheckResponse> {
  const handler = actuators[req.Type!]!;
  req.ParentEaC = req.EaC?.ParentEnterpriseLookup
    ? await loadEaC(req.EaC.ParentEnterpriseLookup)
    : undefined;

  const result = await fetch(`${handler.APIPath}/check`, {
    method: "post",
    body: JSON.stringify(req),
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  try {
    return (await result.json()) as EaCActuatorCheckResponse;
  } catch {
    return { Complete: true } as EaCActuatorCheckResponse;
  }
}
