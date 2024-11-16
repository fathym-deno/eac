import { EaCMetadataBase, EverythingAsCode } from "../.deps.ts";

export type EaCActuatorConnectionsRequest = {
  Current: EaCMetadataBase;

  EaC: EverythingAsCode;

  Lookup: string;

  Model: EaCMetadataBase;

  ParentEaC?: EverythingAsCode;
};

export function isEaCActuatorConnectionsRequest(
  req: unknown,
): req is EaCActuatorConnectionsRequest {
  const x = req as EaCActuatorConnectionsRequest;

  return (
    x.Current !== undefined && x.EaC !== undefined && x.Model !== undefined
  );
}
