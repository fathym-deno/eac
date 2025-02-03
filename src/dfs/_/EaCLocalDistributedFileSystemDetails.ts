import {
  EaCDistributedFileSystemDetails,
  isEaCDistributedFileSystemDetails,
} from "./EaCDistributedFileSystemDetails.ts";

export type EaCLocalDistributedFileSystemDetails = {
  FileRoot: string;
} & EaCDistributedFileSystemDetails<"Local">;

export function isEaCLocalDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCLocalDistributedFileSystemDetails {
  const x = dfs as EaCLocalDistributedFileSystemDetails;

  return (
    isEaCDistributedFileSystemDetails("Local", x) &&
    x.FileRoot !== undefined &&
    typeof x.FileRoot === "string"
  );
}
