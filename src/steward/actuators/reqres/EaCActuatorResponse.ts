import { EaCMetadataBase } from "../../../eac/EaCMetadataBase.ts";
import { EaCActuatorCheckRequest } from "./EaCActuatorCheckRequest.ts";

export type EaCActuatorResponse = {
  Checks: EaCActuatorCheckRequest[];

  Lookup: string;

  Messages: Record<string, unknown>;

  Model: EaCMetadataBase;
};

export function isEaCActuatorResponse(
  res: unknown,
): res is EaCActuatorResponse {
  const x = res as EaCActuatorResponse;

  return (
    x.Checks !== undefined &&
    Array.isArray(x.Checks) &&
    x.Lookup !== undefined &&
    typeof x.Lookup === "string" &&
    x.Messages !== undefined &&
    x.Model !== undefined
  );
}
