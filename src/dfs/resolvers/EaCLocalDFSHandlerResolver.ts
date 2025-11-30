import { isEaCLocalDistributedFileSystemDetails } from "../_/EaCLocalDistributedFileSystemDetails.ts";
import { IEaCDFSFileHandler } from "../handlers/IEaCDFSFileHandler.ts";
import { EaCDFSFileHandlerResolver } from "../handlers/EaCDFSFileHandlerResolver.ts";
import { EaCLocalDFSFileHandler } from "../handlers/EaCLocalDFSFileHandler.ts";

/**
 * Resolver for Local Distributed File Systems (DFS).
 */
export const EaCLocalDFSHandlerResolver: EaCDFSFileHandlerResolver = {
  async Resolve(_ioc, dfsLookup, dfs): Promise<IEaCDFSFileHandler | undefined> {
    if (!isEaCLocalDistributedFileSystemDetails(dfs)) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCLocalDFSHandlerResolver.",
      );
    }

    if (!dfs.FileRoot) {
      throw new Error("FileRoot must be provided for Local DFS resolution.");
    }

    return new EaCLocalDFSFileHandler(dfsLookup, dfs);
  },
};
