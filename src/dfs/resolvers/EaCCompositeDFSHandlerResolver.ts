import {
  EaCCompositeDistributedFileSystemDetails,
  isEaCCompositeDistributedFileSystemDetails,
} from "../_/EaCCompositeDistributedFileSystemDetails.ts";
import {
  CompositeDFSFileHandler,
  type ESBuild,
  getPackageLogger,
  type IDFSFileHandler,
  IoCContainer,
} from "./.deps.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import {
  DFSHandlerResolver,
  DFSHandlerResolverOptions,
} from "./DFSHandlerResolver.ts";
import { loadDFSFileHandler } from "../utils/loadFileHandler.ts";

/**
 * Resolver for Composite Distributed File Systems (DFS).
 * Returns base CompositeDFSFileHandler from @fathym/dfs.
 */
export const EaCCompositeDFSHandlerResolver: DFSHandlerResolver = {
  async Resolve(
    ioc: IoCContainer,
    dfsLookup: string,
    dfs: EaCDistributedFileSystemDetails,
    options?: DFSHandlerResolverOptions,
  ): Promise<IDFSFileHandler | undefined> {
    const logger = await getPackageLogger(import.meta);

    logger.debug(`[dfs-composite] resolving lookup=${dfsLookup}`);

    if (!isEaCCompositeDistributedFileSystemDetails(dfs)) {
      logger.error(
        `[dfs-composite] invalid type lookup=${dfsLookup} type=${dfs?.Type}`,
      );
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCCompositeDFSHandlerResolver.",
      );
    }

    const composite = dfs as EaCCompositeDistributedFileSystemDetails;

    const dfsLookups = composite.DFSLookups ?? [];

    if (!dfsLookups.length) {
      logger.error(
        `[dfs-composite] missing DFSLookups lookup=${dfsLookup}`,
      );
      throw new Error(
        `Composite DFS '${dfsLookup}' must specify at least one DFS lookup.`,
      );
    }

    const resolverOptions = options;

    if (!resolverOptions?.EaC?.DFSs) {
      logger.error(
        `[dfs-composite] missing EaC.DFSs in options lookup=${dfsLookup}`,
      );
      throw new Error(
        `Missing DFS definitions while configuring composite DFS '${dfsLookup}'.`,
      );
    }

    logger.debug(
      `[dfs-composite] loading ${dfsLookups.length} child handlers for lookup=${dfsLookup}`,
    );

    const childHandlers: IDFSFileHandler[] = [];

    for (const childLookup of dfsLookups) {
      logger.debug(
        `[dfs-composite] loading child lookup=${childLookup}`,
      );

      const handler = await loadDFSFileHandler(
        ioc,
        resolverOptions.EaC.DFSs,
        resolverOptions,
        childLookup,
      );

      if (!handler) {
        logger.error(
          `[dfs-composite] failed to resolve child lookup=${childLookup}`,
        );
        throw new Error(
          `Failed to resolve DFS handler for child lookup '${childLookup}' while configuring composite DFS '${dfsLookup}'.`,
        );
      }

      childHandlers.push(handler);
    }

    // Get ESBuild from IoC container (optional - may not be registered)
    const esbuild = await ioc.Resolve<ESBuild>(
      ioc.Symbol("ESBuild"),
    ).catch(() => undefined);

    logger.debug(
      `[dfs-composite] creating handler lookup=${dfsLookup} childCount=${childHandlers.length} esbuild=${
        esbuild ? "available" : "not available"
      }`,
    );

    return new CompositeDFSFileHandler(
      {
        DefaultFile: composite.DefaultFile,
        Extensions: composite.Extensions,
        UseCascading: composite.UseCascading,
        ESBuild: esbuild,
      },
      childHandlers,
    );
  },
};
