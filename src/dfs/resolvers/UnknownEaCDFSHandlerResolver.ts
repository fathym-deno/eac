import { type IDFSFileHandler, LocalDFSFileHandler } from "./.deps.ts";
import { DFSHandlerResolver } from "./DFSHandlerResolver.ts";

/**
 * Fallback resolver for unknown DFS types.
 * Returns a base LocalDFSFileHandler with current directory as root.
 */
export const UnknownEaCDFSHandlerResolver: DFSHandlerResolver = {
  Resolve(_ioc, _dfsLookup, _dfs): Promise<IDFSFileHandler | undefined> {
    return Promise.resolve(
      new LocalDFSFileHandler({
        FileRoot: ".",
      }),
    );
  },
};
