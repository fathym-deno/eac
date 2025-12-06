import { isEaCESMDistributedFileSystemDetails } from "../_/EaCESMDistributedFileSystemDetails.ts";
import {
  type ESBuild,
  ESMFetchDFSFileHandler,
  type IDFSFileHandler,
} from "./.deps.ts";
import { DFSHandlerResolver } from "./DFSHandlerResolver.ts";

/**
 * Resolver for ESM-based Distributed File Systems (DFS).
 * Returns base ESMFetchDFSFileHandler from @fathym/dfs.
 */
export const EaCESMDFSHandlerResolver: DFSHandlerResolver = {
  async Resolve(ioc, _dfsLookup, dfs): Promise<IDFSFileHandler | undefined> {
    if (!isEaCESMDistributedFileSystemDetails(dfs)) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCESMDFSHandlerResolver.",
      );
    }

    if (!dfs.Root) {
      throw new Error("Root must be provided for ESM DFS resolution.");
    }

    // Get ESBuild from IoC container (optional - may not be registered)
    const esbuild = await ioc.Resolve<ESBuild>(
      ioc.Symbol("ESBuild"),
    ).catch(() => undefined);

    return new ESMFetchDFSFileHandler({
      Root: dfs.Root,
      EntryPoints: dfs.EntryPoints,
      DefaultFile: dfs.DefaultFile,
      Extensions: dfs.Extensions,
      UseCascading: dfs.UseCascading,
      ESBuild: esbuild,
    });
  },
};
