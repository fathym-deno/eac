import { type IDFSFileHandler } from "./.deps.ts";
import { DFSHandlerResolver } from "./DFSHandlerResolver.ts";

/**
 * Resolver for Worker-based Distributed File Systems (DFS).
 *
 * NOTE: Worker-based DFS handler has been removed in this version.
 * If you need worker-based DFS handling, implement it as a consumer-side wrapper.
 */
export const EaCWorkerDFSHandlerResolver: DFSHandlerResolver = {
  async Resolve(_ioc, _dfsLookup, dfs): Promise<IDFSFileHandler | undefined> {
    if (!dfs.WorkerPath) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCWorkerDFSHandlerResolver.",
      );
    }

    throw new Deno.errors.NotSupported(
      "Worker-based DFS handlers have been removed. " +
        "Please use a different DFS type or implement worker handling at the consumer level.",
    );
  },
};
