import { DenoKVNonce, NullableArrayOrObject } from "../.deps.ts";
import { EverythingAsCode } from "../../../eac/EverythingAsCode.ts";

export type EaCDeleteRequest<TEaC = EverythingAsCode> = {
  Archive: boolean;

  CommitID: string;

  EaC: NullableArrayOrObject<TEaC>;

  JWT: string;

  ProcessingSeconds: number;

  Username: string;
} & DenoKVNonce;

export function isEaCDeleteRequest(req: unknown): req is EaCDeleteRequest {
  const deleteRequest = req as EaCDeleteRequest;

  return (
    deleteRequest.EaC !== undefined &&
    deleteRequest.EaC.EnterpriseLookup !== undefined &&
    typeof deleteRequest.EaC.EnterpriseLookup === "string" &&
    typeof deleteRequest.Archive === "boolean" &&
    deleteRequest.CommitID !== undefined &&
    typeof deleteRequest.CommitID === "string"
  );
}
