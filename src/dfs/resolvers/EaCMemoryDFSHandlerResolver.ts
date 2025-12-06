import { isEaCMemoryDistributedFileSystemDetails } from "../_/EaCMemoryDistributedFileSystemDetails.ts";
import {
  getPackageLogger,
  type IDFSFileHandler,
  MemoryDFSFileHandler,
} from "./.deps.ts";
import { DFSHandlerResolver } from "./DFSHandlerResolver.ts";

/**
 * Resolver for Memory Distributed File Systems (DFS).
 * Returns base MemoryDFSFileHandler from @fathym/dfs.
 */
export const EaCMemoryDFSHandlerResolver: DFSHandlerResolver = {
  async Resolve(
    _ioc,
    dfsLookup,
    dfs,
  ): Promise<IDFSFileHandler | undefined> {
    const logger = await getPackageLogger(import.meta);

    logger.debug(`[dfs-memory] resolving lookup=${dfsLookup}`);

    if (!isEaCMemoryDistributedFileSystemDetails(dfs)) {
      logger.error(
        `[dfs-memory] invalid type lookup=${dfsLookup} type=${dfs?.Type}`,
      );
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCMemoryDFSHandlerResolver.",
      );
    }

    logger.debug(
      `[dfs-memory] creating handler lookup=${dfsLookup} extensions=${
        dfs.Extensions?.join(",")
      }`,
    );

    return new MemoryDFSFileHandler({
      Root: "/",
      DefaultFile: dfs.DefaultFile,
      Extensions: dfs.Extensions,
      UseCascading: dfs.UseCascading,
    });
  },
};
