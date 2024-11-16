import {
  EaCActuatorConnectionsRequest,
  EaCActuatorConnectionsResponse,
  EaCModuleActuator,
  EverythingAsCode,
} from "./.deps.ts";

/**
 * Executes a connection request for a specific EaC handler.
 *
 * @param loadEaC Function to load an `EverythingAsCode` instance by enterprise lookup.
 * @param handler The EaC module actuator to call.
 * @param jwt Authentication token.
 * @param req The handler connections request.
 * @returns The response from the handler connections request.
 */
export async function callEaCHandlerConnections(
  loadEaC: (entLookup: string) => Promise<EverythingAsCode>,
  handler: EaCModuleActuator,
  jwt: string,
  req: EaCActuatorConnectionsRequest,
): Promise<EaCActuatorConnectionsResponse> {
  req.ParentEaC = req.EaC?.ParentEnterpriseLookup
    ? await loadEaC(req.EaC.ParentEnterpriseLookup)
    : undefined;

  const result = await fetch(`${handler.APIPath}/connections`, {
    method: "post",
    body: JSON.stringify(req),
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const text = await result.text();

  try {
    return JSON.parse(text) as EaCActuatorConnectionsResponse;
  } catch {
    return { Model: {} } as EaCActuatorConnectionsResponse;
  }
}
