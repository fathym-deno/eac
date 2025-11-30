import { isEaCNPMDistributedFileSystemDetails } from "../_/EaCNPMDistributedFileSystemDetails.ts";
import { IEaCDFSFileHandler } from "../handlers/IEaCDFSFileHandler.ts";
import { EaCDFSFileHandlerResolver } from "../handlers/EaCDFSFileHandlerResolver.ts";
import { EaCNPMFetchDFSFileHandler } from "../handlers/EaCNPMFetchDFSFileHandler.ts";

/**
 * Resolver for NPM Distributed File Systems (DFS) using Skypack CDN.
 */
export const EaCNPMDFSHandlerResolver: EaCDFSFileHandlerResolver = {
  async Resolve(_ioc, dfsLookup, dfs): Promise<IEaCDFSFileHandler | undefined> {
    if (!isEaCNPMDistributedFileSystemDetails(dfs)) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCNPMDFSHandlerResolver.",
      );
    }

    if (!dfs.Package) {
      throw new Error(
        "Package name must be provided for NPM DFS resolution.",
      );
    }

    return new EaCNPMFetchDFSFileHandler(dfsLookup, dfs);
  },
};
