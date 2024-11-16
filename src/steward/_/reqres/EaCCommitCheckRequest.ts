import { EverythingAsCode } from "../.deps.ts";
import { EaCActuatorCheckRequest } from "../../actuators/reqres/EaCActuatorCheckRequest.ts";
import { EaCCommitRequest } from "./EaCCommitRequest.ts";

export type EaCCommitCheckRequest = {
  Checks: EaCActuatorCheckRequest[];

  OriginalEaC: EverythingAsCode;

  ToProcessKeys: string[];
} & EaCCommitRequest;

export function isEaCCommitCheckRequest(
  req: unknown,
): req is EaCCommitCheckRequest {
  const commitRequest = req as EaCCommitCheckRequest;

  return (
    commitRequest.Checks !== undefined &&
    Array.isArray(commitRequest.Checks) &&
    commitRequest.OriginalEaC !== undefined &&
    commitRequest.ToProcessKeys !== undefined &&
    Array.isArray(commitRequest.ToProcessKeys)
  );
}
