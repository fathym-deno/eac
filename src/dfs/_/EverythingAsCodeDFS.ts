import { EaCDistributedFileSystemAsCode } from "./EaCDistributedFileSystemAsCode.ts";

export type EverythingAsCodeDFS = {
  DFSs?: Record<string, EaCDistributedFileSystemAsCode>;
};

export function isEverythingAsCodeDFS(
  eac: unknown,
): eac is EverythingAsCodeDFS {
  const x = eac as EverythingAsCodeDFS;

  return !!x;
}
