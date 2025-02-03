import { FathymWorkerMessageTypes } from "./.deps.ts";

export const EaCDistributedFileSystemWorkerMessageTypes = {
  ...FathymWorkerMessageTypes,
  GetFileInfo: "get-file-info",
  LoadAllPaths: "load-all-paths",
  RemoveFile: "remove-file",
  WriteFile: "write-file",
};

export type EaCDistributedFileSystemWorkerMessageTypes =
  (typeof EaCDistributedFileSystemWorkerMessageTypes)[
    keyof typeof EaCDistributedFileSystemWorkerMessageTypes
  ];
