import { isEaCNPMDistributedFileSystemDetails } from "../_/EaCNPMDistributedFileSystemDetails.ts";
import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";
import { DFSFileHandlerResolver } from "../handlers/DFSFileHandlerResolver.ts";
import { NPMFetchDFSFileHandler } from "../handlers/NPMFetchDFSFileHandler.ts";

/**
 * Resolver for NPM Distributed File Systems (DFS) using Skypack CDN.
 */
export const EaCNPMDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(_ioc, dfsLookup, dfs): Promise<DFSFileHandler | undefined> {
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

      return new NPMFetchDFSFileHandler(dfsLookup, dfs);
    },
  };
