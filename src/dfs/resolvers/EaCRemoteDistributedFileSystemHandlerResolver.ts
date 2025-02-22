import {
  DFSFileHandler,
  DFSFileHandlerResolver,
  FetchDFSFileHandler,
  isEaCRemoteDistributedFileSystemDetails,
} from "./.deps.ts";

/**
 * Resolver for Remote Distributed File Systems (DFS).
 */
export const EaCRemoteDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(_ioc, dfsLookup, dfs): Promise<DFSFileHandler | undefined> {
      if (!isEaCRemoteDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCRemoteDistributedFileSystemHandlerResolver.",
        );
      }

      if (!dfs.RemoteRoot) {
        throw new Error(
          "RemoteRoot must be provided for remote DFS resolution.",
        );
      }

      return new FetchDFSFileHandler(dfsLookup, dfs);
    },
  };
