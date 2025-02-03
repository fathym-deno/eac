import {
  EaCDistributedFileSystemDetails,
  isEaCDistributedFileSystemDetails,
} from "./EaCDistributedFileSystemDetails.ts";

export type EaCRemoteDistributedFileSystemDetails = {
  RemoteRoot: string;
} & EaCDistributedFileSystemDetails<"Remote">;

export function isEaCRemoteDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCRemoteDistributedFileSystemDetails {
  const x = dfs as EaCRemoteDistributedFileSystemDetails;

  return (
    isEaCDistributedFileSystemDetails("Remote", x) &&
    x.RemoteRoot !== undefined &&
    typeof x.RemoteRoot === "string"
  );
}
