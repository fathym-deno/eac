import {
  DFSFileHandler,
  DFSFileHandlerResolver,
  isEaCNPMDistributedFileSystemDetails,
  NPMFetchDFSFileHandler,
} from "./.deps.ts";

/**
 * Resolver for NPM Distributed File Systems (DFS) using Skypack CDN.
 */
export const EaCNPMDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(_ioc, dfs): Promise<DFSFileHandler | undefined> {
      if (!isEaCNPMDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCNPMDistributedFileSystemHandlerResolver.",
        );
      }

      if (!dfs.Package) {
        throw new Error(
          "Package name must be provided for NPM DFS resolution.",
        );
      }

      return new NPMFetchDFSFileHandler(dfs.Package);
    },
  };
