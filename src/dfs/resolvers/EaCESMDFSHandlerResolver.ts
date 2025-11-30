import { isEaCESMDistributedFileSystemDetails } from "../_/EaCESMDistributedFileSystemDetails.ts";
import { IEaCDFSFileHandler } from "../handlers/IEaCDFSFileHandler.ts";
import { EaCDFSFileHandlerResolver } from "../handlers/EaCDFSFileHandlerResolver.ts";
import { EaCESMFetchDFSFileHandler } from "../handlers/EaCESMFetchDFSFileHandler.ts";

/**
 * Resolver for ESM-based Distributed File Systems (DFS).
 */
export const EaCESMDFSHandlerResolver: EaCDFSFileHandlerResolver = {
  async Resolve(_ioc, dfsLookup, dfs): Promise<IEaCDFSFileHandler | undefined> {
    if (!isEaCESMDistributedFileSystemDetails(dfs)) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCESMDFSHandlerResolver.",
      );
    }

    return new EaCESMFetchDFSFileHandler(dfsLookup, dfs);
  },
};
