import {
  CompositeDFSFileHandler,
  getPackageLogger,
  type IDFSFileHandler,
  IoCContainer,
  MemoryDFSFileHandler,
} from "./.deps.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import {
  EaCVirtualCompositeDistributedFileSystemDetails,
  isEaCVirtualCompositeDistributedFileSystemDetails,
} from "../_/EaCVirtualCompositeDistributedFileSystemDetails.ts";
import {
  DFSHandlerResolver,
  DFSHandlerResolverOptions,
} from "./DFSHandlerResolver.ts";
import { loadDFSFileHandler } from "../utils/loadFileHandler.ts";

/**
 * Resolver for Virtual Composite Distributed File Systems (DFS).
 * Returns base CompositeDFSFileHandler from @fathym/dfs with a virtual layer
 * (MemoryDFS or custom) as the first handler in the composite.
 */
export const EaCVirtualCompositeDFSHandlerResolver: DFSHandlerResolver = {
  async Resolve(
    ioc: IoCContainer,
    dfsLookup: string,
    dfs: EaCDistributedFileSystemDetails,
    options?: DFSHandlerResolverOptions,
  ): Promise<IDFSFileHandler | undefined> {
    const logger = await getPackageLogger(import.meta);

    logger.debug(`[dfs-virtual-composite] resolving lookup=${dfsLookup}`);

    if (!isEaCVirtualCompositeDistributedFileSystemDetails(dfs)) {
      logger.error(
        `[dfs-virtual-composite] invalid type lookup=${dfsLookup} type=${dfs?.Type}`,
      );
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCVirtualCompositeDFSHandlerResolver.",
      );
    }

    const virtual = dfs as EaCVirtualCompositeDistributedFileSystemDetails;

    const baseLookups = virtual.BaseDFSLookups ?? [];

    if (!baseLookups.length) {
      logger.error(
        `[dfs-virtual-composite] missing BaseDFSLookups lookup=${dfsLookup}`,
      );
      throw new Error(
        `Virtual composite DFS '${dfsLookup}' must specify at least one base DFS lookup.`,
      );
    }

    const resolverOptions = options;

    if (!resolverOptions?.EaC?.DFSs) {
      logger.error(
        `[dfs-virtual-composite] missing EaC.DFSs in options lookup=${dfsLookup}`,
      );
      throw new Error(
        `Missing DFS definitions while configuring virtual composite DFS '${dfsLookup}'.`,
      );
    }

    // Resolve or create the virtual layer handler
    let virtualHandler: IDFSFileHandler;

    if (virtual.VirtualDFSLookup) {
      logger.debug(
        `[dfs-virtual-composite] loading virtual layer from lookup=${virtual.VirtualDFSLookup}`,
      );

      const resolved = await loadDFSFileHandler(
        ioc,
        resolverOptions.EaC.DFSs,
        resolverOptions,
        virtual.VirtualDFSLookup,
      );

      if (!resolved) {
        logger.error(
          `[dfs-virtual-composite] failed to resolve virtual layer lookup=${virtual.VirtualDFSLookup}`,
        );
        throw new Error(
          `Failed to resolve DFS handler for virtual layer lookup '${virtual.VirtualDFSLookup}' while configuring virtual composite DFS '${dfsLookup}'.`,
        );
      }

      virtualHandler = resolved;
    } else {
      logger.debug(
        `[dfs-virtual-composite] creating inline MemoryDFS for virtual layer`,
      );

      virtualHandler = new MemoryDFSFileHandler({
        Root: "/",
        DefaultFile: virtual.DefaultFile,
        Extensions: virtual.Extensions,
        UseCascading: virtual.UseCascading,
      });
    }

    // Load base handlers
    const allHandlers: IDFSFileHandler[] = [virtualHandler];

    for (const baseLookup of baseLookups) {
      logger.debug(
        `[dfs-virtual-composite] loading base lookup=${baseLookup}`,
      );

      const handler = await loadDFSFileHandler(
        ioc,
        resolverOptions.EaC.DFSs,
        resolverOptions,
        baseLookup,
      );

      if (!handler) {
        logger.error(
          `[dfs-virtual-composite] failed to resolve base lookup=${baseLookup}`,
        );
        throw new Error(
          `Failed to resolve DFS handler for base lookup '${baseLookup}' while configuring virtual composite DFS '${dfsLookup}'.`,
        );
      }

      allHandlers.push(handler);
    }

    logger.debug(
      `[dfs-virtual-composite] creating handler lookup=${dfsLookup} virtualLookup=${
        virtual.VirtualDFSLookup ?? "inline-memory"
      } baseCount=${baseLookups.length}`,
    );

    return new CompositeDFSFileHandler(
      {
        DefaultFile: virtual.DefaultFile,
        Extensions: virtual.Extensions,
        UseCascading: virtual.UseCascading,
      },
      allHandlers,
    );
  },
};
