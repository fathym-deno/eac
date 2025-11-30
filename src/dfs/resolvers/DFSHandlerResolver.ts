import { type IDFSFileHandler, IoCContainer } from "./.deps.ts";
import { DistributedFileSystemOptions } from "../_/DistributedFileSystemOptions.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { EverythingAsCodeDFS } from "../_/EverythingAsCodeDFS.ts";

/**
 * Options for DFS handler resolution.
 */
export type DFSHandlerResolverOptions = DistributedFileSystemOptions & {
  EaC: EverythingAsCodeDFS;
};

/**
 * Interface for resolving DFS handlers.
 * Returns base IDFSFileHandler from @fathym/dfs.
 */
export type DFSHandlerResolver = {
  Resolve: (
    ioc: IoCContainer,
    dfsLookup: string,
    dfs: EaCDistributedFileSystemDetails,
    options?: DFSHandlerResolverOptions,
  ) => Promise<IDFSFileHandler | undefined>;
};
