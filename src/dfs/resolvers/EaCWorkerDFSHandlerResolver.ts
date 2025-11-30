import { IEaCDFSFileHandler } from "../handlers/IEaCDFSFileHandler.ts";
import { EaCDFSFileHandlerResolver } from "../handlers/EaCDFSFileHandlerResolver.ts";
import { EaCWorkerDFSFileHandler } from "../handlers/EaCWorkerDFSFileHandler.ts";

/**
 * Resolver for Worker-based Distributed File Systems (DFS).
 */
export const EaCWorkerDFSHandlerResolver: EaCDFSFileHandlerResolver = {
  async Resolve(_ioc, dfsLookup, dfs): Promise<IEaCDFSFileHandler | undefined> {
    if (!dfs.WorkerPath) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCWorkerDFSHandlerResolver.",
      );
    }

    return new EaCWorkerDFSFileHandler(dfsLookup, dfs);
  },
};
