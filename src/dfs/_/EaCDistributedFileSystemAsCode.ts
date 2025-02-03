import { EaCDetails } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  isEaCDistributedFileSystemDetails,
} from "./EaCDistributedFileSystemDetails.ts";

export type EaCDistributedFileSystemAsCode = EaCDetails<
  EaCDistributedFileSystemDetails
>;

export function isEaCDistributedFileSystemAsCode(
  eac: unknown,
): eac is EaCDistributedFileSystemAsCode {
  const db = eac as EaCDistributedFileSystemAsCode;

  return db && isEaCDistributedFileSystemDetails(undefined, db.Details);
}
