import {
  EaCDistributedFileSystemDetails,
  isEaCDistributedFileSystemDetails,
} from "./EaCDistributedFileSystemDetails.ts";

export type EaCJSRDistributedFileSystemDetails = {
  FileRoot?: string;

  Package: string;

  Version?: string;
} & EaCDistributedFileSystemDetails<"JSR">;

export function isEaCJSRDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCJSRDistributedFileSystemDetails {
  const x = dfs as EaCJSRDistributedFileSystemDetails;

  return (
    isEaCDistributedFileSystemDetails("JSR", x) &&
    x.Package !== undefined &&
    typeof x.Package === "string"
  );
}
