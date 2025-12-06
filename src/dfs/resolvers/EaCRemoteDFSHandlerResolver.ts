import { isEaCRemoteDistributedFileSystemDetails } from "../_/EaCRemoteDistributedFileSystemDetails.ts";
import {
  type ESBuild,
  type IDFSFileHandler,
  RemoteFetchDFSFileHandler,
} from "./.deps.ts";
import { DFSHandlerResolver } from "./DFSHandlerResolver.ts";

/**
 * Resolver for Remote Distributed File Systems (DFS).
 * Returns base RemoteFetchDFSFileHandler from @fathym/dfs.
 */
export const EaCRemoteDFSHandlerResolver: DFSHandlerResolver = {
  async Resolve(ioc, _dfsLookup, dfs): Promise<IDFSFileHandler | undefined> {
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

    // Get ESBuild from IoC container (optional - may not be registered)
    const esbuild = await ioc.Resolve<ESBuild>(
      ioc.Symbol("ESBuild"),
    ).catch(() => undefined);

    return new RemoteFetchDFSFileHandler({
      RemoteRoot: dfs.RemoteRoot,
      DefaultFile: dfs.DefaultFile,
      Extensions: dfs.Extensions,
      UseCascading: dfs.UseCascading,
      ESBuild: esbuild,
    });
  },
};
