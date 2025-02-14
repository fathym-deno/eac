import { DistributedFileSystemOptions } from "./DistributedFileSystemOptions.ts";
import { EaCDistributedFileSystemAsCode } from "./EaCDistributedFileSystemAsCode.ts";

export type EverythingAsCodeDFS = {
  DFSs?:
    & DistributedFileSystemOptions
    & Record<string, EaCDistributedFileSystemAsCode>;
};

export function isEverythingAsCodeDFS(
  eac: unknown,
): eac is EverythingAsCodeDFS {
  const x = eac as EverythingAsCodeDFS;

  return !!x;
}
