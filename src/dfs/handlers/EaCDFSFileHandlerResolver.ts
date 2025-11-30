import { IoCContainer } from "./.deps.ts";
import { DistributedFileSystemOptions } from "../_/DistributedFileSystemOptions.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { EverythingAsCodeDFS } from "../_/EverythingAsCodeDFS.ts";
import { IEaCDFSFileHandler } from "./IEaCDFSFileHandler.ts";

export type EaCDFSFileHandlerResolverOptions = DistributedFileSystemOptions & {
  EaC: EverythingAsCodeDFS;
};

export type EaCDFSFileHandlerResolver = {
  Resolve: (
    ioc: IoCContainer,
    dfsLookup: string,
    dfs: EaCDistributedFileSystemDetails,
    options?: EaCDFSFileHandlerResolverOptions,
  ) => Promise<IEaCDFSFileHandler | undefined>;
};
