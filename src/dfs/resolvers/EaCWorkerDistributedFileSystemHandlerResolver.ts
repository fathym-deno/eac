import {
  DFSFileHandler,
  DFSFileHandlerResolver,
  WorkerDFSFileHandler,
} from "./.deps.ts";

/**
 * Resolver for Worker-based Distributed File Systems (DFS).
 */
export const EaCWorkerDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(_ioc, dfs): Promise<DFSFileHandler | undefined> {
      if (!dfs.WorkerPath) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCWorkerDistributedFileSystemHandlerResolver.",
        );
      }

      return new WorkerDFSFileHandler(dfs.WorkerPath);
    },
  };
