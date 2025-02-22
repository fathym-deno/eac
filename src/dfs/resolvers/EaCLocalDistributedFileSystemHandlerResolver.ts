import {
  DFSFileHandler,
  DFSFileHandlerResolver,
  isEaCLocalDistributedFileSystemDetails,
  LocalDFSFileHandler,
} from "./.deps.ts";

/**
 * Resolver for Local Distributed File Systems (DFS).
 */
export const EaCLocalDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(_ioc, dfsLookup, dfs): Promise<DFSFileHandler | undefined> {
      if (!isEaCLocalDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCLocalDistributedFileSystemHandlerResolver.",
        );
      }

      if (!dfs.FileRoot) {
        throw new Error("FileRoot must be provided for Local DFS resolution.");
      }

      return new LocalDFSFileHandler(dfsLookup, dfs);
    },
  };
