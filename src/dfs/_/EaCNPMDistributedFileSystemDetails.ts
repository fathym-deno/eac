import {
  EaCDistributedFileSystemDetails,
  isEaCDistributedFileSystemDetails,
} from "./EaCDistributedFileSystemDetails.ts";

export type EaCNPMDistributedFileSystemDetails = {
  Package: string;

  Version: string;
} & EaCDistributedFileSystemDetails<"NPM">;

export function isEaCNPMDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCNPMDistributedFileSystemDetails {
  const x = dfs as EaCNPMDistributedFileSystemDetails;

  return (
    isEaCDistributedFileSystemDetails("NPM", x) &&
    x.Package !== undefined &&
    typeof x.Package === "string" &&
    x.Version !== undefined &&
    typeof x.Version === "string"
  );
}
