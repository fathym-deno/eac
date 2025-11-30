import { isEaCNPMDistributedFileSystemDetails } from "../_/EaCNPMDistributedFileSystemDetails.ts";
import { type IDFSFileHandler, NPMFetchDFSFileHandler } from "./.deps.ts";
import { DFSHandlerResolver } from "./DFSHandlerResolver.ts";

/**
 * Resolver for NPM Distributed File Systems (DFS) using Skypack CDN.
 * Returns base NPMFetchDFSFileHandler from @fathym/dfs.
 */
export const EaCNPMDFSHandlerResolver: DFSHandlerResolver = {
  async Resolve(_ioc, _dfsLookup, dfs): Promise<IDFSFileHandler | undefined> {
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

    return new NPMFetchDFSFileHandler({
      Package: dfs.Package,
      Version: dfs.Version,
      DefaultFile: dfs.DefaultFile,
      Extensions: dfs.Extensions,
      UseCascading: dfs.UseCascading,
    });
  },
};
