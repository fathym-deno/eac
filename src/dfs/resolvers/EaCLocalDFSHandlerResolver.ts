import { isEaCLocalDistributedFileSystemDetails } from "../_/EaCLocalDistributedFileSystemDetails.ts";
import { type IDFSFileHandler, LocalDFSFileHandler } from "./.deps.ts";
import { DFSHandlerResolver } from "./DFSHandlerResolver.ts";

/**
 * Resolver for Local Distributed File Systems (DFS).
 * Returns base LocalDFSFileHandler from @fathym/dfs.
 */
export const EaCLocalDFSHandlerResolver: DFSHandlerResolver = {
  async Resolve(_ioc, _dfsLookup, dfs): Promise<IDFSFileHandler | undefined> {
    if (!isEaCLocalDistributedFileSystemDetails(dfs)) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCLocalDFSHandlerResolver.",
      );
    }

    if (!dfs.FileRoot) {
      throw new Error("FileRoot must be provided for Local DFS resolution.");
    }

    return new LocalDFSFileHandler({
      FileRoot: dfs.FileRoot,
      DefaultFile: dfs.DefaultFile,
      Extensions: dfs.Extensions,
      UseCascading: dfs.UseCascading,
    });
  },
};
