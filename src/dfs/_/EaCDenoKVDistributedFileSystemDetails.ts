import {
  EaCDistributedFileSystemDetails,
  isEaCDistributedFileSystemDetails,
} from "./EaCDistributedFileSystemDetails.ts";

export type EaCDenoKVDistributedFileSystemDetails = {
  DatabaseLookup: string;

  FileRoot: string;

  SegmentPath?: string;

  RootKey: Deno.KvKey;
} & EaCDistributedFileSystemDetails<"DenoKV">;

export function isEaCDenoKVDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCDenoKVDistributedFileSystemDetails {
  const x = dfs as EaCDenoKVDistributedFileSystemDetails;

  return (
    isEaCDistributedFileSystemDetails("DenoKV", x) &&
    x.DatabaseLookup !== undefined &&
    typeof x.DatabaseLookup === "string" &&
    x.FileRoot !== undefined &&
    typeof x.FileRoot === "string" &&
    x.RootKey !== undefined &&
    Array.isArray(x.RootKey)
  );
}
