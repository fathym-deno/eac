import { isEaCLocalDistributedFileSystemDetails } from "../_/EaCLocalDistributedFileSystemDetails.ts";
import {
  type ESBuild,
  getPackageLogger,
  type IDFSFileHandler,
  LocalDFSFileHandler,
} from "./.deps.ts";
import { DFSHandlerResolver } from "./DFSHandlerResolver.ts";

/**
 * Resolver for Local Distributed File Systems (DFS).
 * Returns base LocalDFSFileHandler from @fathym/dfs.
 */
export const EaCLocalDFSHandlerResolver: DFSHandlerResolver = {
  async Resolve(
    ioc,
    dfsLookup,
    dfs,
  ): Promise<IDFSFileHandler | undefined> {
    const logger = await getPackageLogger(import.meta);

    logger.debug(`[dfs-local] resolving lookup=${dfsLookup}`);

    if (!isEaCLocalDistributedFileSystemDetails(dfs)) {
      logger.error(
        `[dfs-local] invalid type lookup=${dfsLookup} type=${dfs?.Type}`,
      );
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCLocalDFSHandlerResolver.",
      );
    }

    if (!dfs.FileRoot) {
      logger.error(`[dfs-local] missing FileRoot lookup=${dfsLookup}`);
      throw new Error("FileRoot must be provided for Local DFS resolution.");
    }

    // Get ESBuild from IoC container (optional - may not be registered)
    const esbuild = await ioc.Resolve<ESBuild>(
      ioc.Symbol("ESBuild"),
    ).catch(() => undefined);

    logger.debug(
      `[dfs-local] creating handler lookup=${dfsLookup} root=${dfs.FileRoot} extensions=${
        dfs.Extensions?.join(",")
      } esbuild=${esbuild ? "available" : "not available"}`,
    );

    return new LocalDFSFileHandler({
      FileRoot: dfs.FileRoot,
      DefaultFile: dfs.DefaultFile,
      Extensions: dfs.Extensions,
      UseCascading: dfs.UseCascading,
      ESBuild: esbuild,
    });
  },
};
