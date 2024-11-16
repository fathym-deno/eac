import { EaCMetadataBase, EverythingAsCode } from "../.deps.ts";

export type EaCActuatorCheckRequest =
  & {
    CommitID: string;

    CorelationID: string;

    EaC?: EverythingAsCode;

    ParentEaC?: EverythingAsCode;

    Type?: string;
  }
  & EaCMetadataBase;
