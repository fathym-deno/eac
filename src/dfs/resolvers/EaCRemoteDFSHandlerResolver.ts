import { isEaCRemoteDistributedFileSystemDetails } from "../_/EaCRemoteDistributedFileSystemDetails.ts";
import { IEaCDFSFileHandler } from "../handlers/IEaCDFSFileHandler.ts";
import { EaCDFSFileHandlerResolver } from "../handlers/EaCDFSFileHandlerResolver.ts";
import { EaCRemoteFetchDFSFileHandler } from "../handlers/EaCRemoteFetchDFSFileHandler.ts";

/**
 * Resolver for Remote Distributed File Systems (DFS).
 */
export const EaCRemoteDFSHandlerResolver: EaCDFSFileHandlerResolver = {
  async Resolve(_ioc, dfsLookup, dfs): Promise<IEaCDFSFileHandler | undefined> {
    if (!isEaCRemoteDistributedFileSystemDetails(dfs)) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCRemoteDFSHandlerResolver.",
      );
    }

    if (!dfs.RemoteRoot) {
      throw new Error(
        "RemoteRoot must be provided for remote DFS resolution.",
      );
    }

    return new EaCRemoteFetchDFSFileHandler(dfsLookup, dfs);
  },
};
