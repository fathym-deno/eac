import {
  DistributedFileSystemOptions,
  EaCDistributedFileSystemDetails,
  IoCContainer,
} from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";

export type DFSFileHandlerResolver = {
  Resolve: (
    ioc: IoCContainer,
    dfsLookup: string,
    dfs: EaCDistributedFileSystemDetails,
    options?: DistributedFileSystemOptions,
  ) => Promise<DFSFileHandler | undefined>;
};
