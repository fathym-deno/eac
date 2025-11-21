import { EaCMetadataBase } from "../../../eac/EaCMetadataBase.ts";

export type EaCActuatorConnectionsResponse = {
  Model: EaCMetadataBase;
};

export function isEaCActuatorConnectionsResponse(
  res: unknown,
): res is EaCActuatorConnectionsResponse {
  const x = res as EaCActuatorConnectionsResponse;

  return x?.Model !== undefined;
}
