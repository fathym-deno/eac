import {
  EaCDistributedFileSystemDetails,
  isEaCDistributedFileSystemDetails,
} from "./EaCDistributedFileSystemDetails.ts";

export type EaCESMDistributedFileSystemDetails = {
  EntryPoints: string[];

  IncludeDependencies?: boolean;

  Root: string;
} & EaCDistributedFileSystemDetails<"ESM">;

export function isEaCESMDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCESMDistributedFileSystemDetails {
  const x = dfs as EaCESMDistributedFileSystemDetails;

  return (
    isEaCDistributedFileSystemDetails("ESM", x) &&
    Array.isArray(x.EntryPoints) &&
    x.Root !== undefined &&
    typeof x.Root === "string"
  );
}
