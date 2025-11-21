import { EaCMetadataBase } from "../../../eac/EaCMetadataBase.ts";
import { EverythingAsCode } from "../../../eac/EverythingAsCode.ts";

export type EaCActuatorCheckRequest =
  & {
    CommitID: string;

    CorelationID: string;

    EaC?: EverythingAsCode;

    ParentEaC?: EverythingAsCode;

    Type?: string;
  }
  & EaCMetadataBase;
