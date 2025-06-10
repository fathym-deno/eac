import {
  DistributedFileSystemOptions,
  EaCDistributedFileSystemDetails,
  IoCContainer,
} from "../handlers/.deps.ts";
import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";

export type DFSFileHandlerResolver = {
  Resolve: (
    ioc: IoCContainer,
    dfsLookup: string,
    dfs: EaCDistributedFileSystemDetails,
    options?: DistributedFileSystemOptions,
  ) => Promise<DFSFileHandler | undefined>;
};
