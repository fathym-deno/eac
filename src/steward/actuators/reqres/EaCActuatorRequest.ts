import { EaCMetadataBase, EverythingAsCode } from "../.deps.ts";

export type EaCActuatorRequest = {
  CommitID: string;

  EaC: EverythingAsCode;

  Lookup: string;

  Model: EaCMetadataBase;

  ParentEaC?: EverythingAsCode;
};

export function isEaCActuatorRequest(req: unknown): req is EaCActuatorRequest {
  const x = req as EaCActuatorRequest;

  return (
    x.EaC !== undefined &&
    typeof x.EaC.EnterpriseLookup === "string" &&
    x.Lookup !== undefined &&
    typeof x.Lookup === "string" &&
    x.Model !== undefined
  );
}
