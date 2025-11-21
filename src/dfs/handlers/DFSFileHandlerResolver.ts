import { IoCContainer } from "./.deps.ts";
import { DistributedFileSystemOptions } from "../_/DistributedFileSystemOptions.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { EverythingAsCodeDFS } from "../_/EverythingAsCodeDFS.ts";
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
