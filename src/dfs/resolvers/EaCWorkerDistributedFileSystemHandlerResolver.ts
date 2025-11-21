import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";
import { DFSFileHandlerResolver } from "../handlers/DFSFileHandlerResolver.ts";
import { WorkerDFSFileHandler } from "../handlers/WorkerDFSFileHandler.ts";

/**
 * Resolver for Worker-based Distributed File Systems (DFS).
 */
export const EaCWorkerDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(_ioc, dfsLookup, dfs): Promise<DFSFileHandler | undefined> {
      if (!dfs.WorkerPath) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCWorkerDistributedFileSystemHandlerResolver.",
        );
      }

      return new WorkerDFSFileHandler(dfsLookup, dfs);
    },
  };
