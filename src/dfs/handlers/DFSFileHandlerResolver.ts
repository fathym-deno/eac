import { EverythingAsCodeDFS } from "../_/EverythingAsCodeDFS.ts";
import {
  DistributedFileSystemOptions,
  EaCDistributedFileSystemDetails,
  EverythingAsCode,
  IoCContainer,
} from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";

export type DFSFileHandlerResolverOptions = DistributedFileSystemOptions & {
  EaC: EverythingAsCodeDFS;
};

export type DFSFileHandlerResolver = {
  Resolve: (
    ioc: IoCContainer,
    dfsLookup: string,
    dfs: EaCDistributedFileSystemDetails,
    options?: DFSFileHandlerResolverOptions,
  ) => Promise<DFSFileHandler | undefined>;
};
