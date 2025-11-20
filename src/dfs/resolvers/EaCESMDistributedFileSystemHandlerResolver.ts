import { DFSFileHandler, DFSFileHandlerResolver, ESMFetchDFSFileHandler, isEaCESMDistributedFileSystemDetails } from "./.deps.ts";

/**
 * Resolver for ESM-based Distributed File Systems (DFS).
 */
export const EaCESMDistributedFileSystemHandlerResolver: DFSFileHandlerResolver = {
  async Resolve(_ioc, dfsLookup, dfs): Promise<DFSFileHandler | undefined> {
    if (!isEaCESMDistributedFileSystemDetails(dfs)) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCESMDistributedFileSystemHandlerResolver.",
      );
    }

    return new ESMFetchDFSFileHandler(dfsLookup, dfs);
  },
};
