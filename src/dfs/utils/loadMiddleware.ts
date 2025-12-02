import { type IDFSFileHandler, TelemetryLogger } from "./.deps.ts";
import { EaCRuntimeHandlerSet } from "../../runtime/pipelines/EaCRuntimeHandlerSet.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { loadEaCRuntimeHandlers } from "./loadEaCRuntimeHandlers.ts";

/**
 * Loads middleware handlers from a `_middleware.ts` file in the DFS.
 *
 * Middleware files are special TypeScript modules that export handlers to be
 * executed before route handlers. They apply to all routes within their
 * directory subtree.
 *
 * ## Middleware File Convention
 *
 * Middleware files must be named `_middleware.ts` and placed in the directory
 * where they should apply:
 * ```
 * ./api/
 *   _middleware.ts    → Applies to all /api/* routes
 *   users/
 *     _middleware.ts  → Applies to all /api/users/* routes
 *     index.ts
 * ```
 *
 * @param logger - Telemetry logger for debug output
 * @param fileHandler - DFS file handler for reading the module
 * @param filePath - Path to the middleware file (e.g., `./api/_middleware.ts`)
 * @param dfs - DFS configuration details
 * @param dfsLookup - Lookup key identifying this DFS
 * @returns Tuple of [rootPath, handlers] if middleware loaded, undefined otherwise.
 *          The rootPath is the directory containing the middleware.
 *
 * @example
 * ```ts
 * const middleware = await loadMiddleware(
 *   logger,
 *   fileHandler,
 *   "./api/users/_middleware.ts",
 *   dfsDetails,
 *   "api-dfs",
 * );
 *
 * if (middleware) {
 *   const [root, handlers] = middleware;
 *   // root = "./api/users/"
 *   // handlers = middleware handler functions
 * }
 * ```
 */
export async function loadMiddleware(
  logger: TelemetryLogger,
  fileHandler: IDFSFileHandler,
  filePath: string,
  dfs: EaCDistributedFileSystemDetails,
  dfsLookup: string,
): Promise<[string, EaCRuntimeHandlerSet] | undefined> {
  logger.debug(`[dfs-utils] Loading middleware from: ${filePath}`);

  const handler = await loadEaCRuntimeHandlers(
    logger,
    fileHandler,
    filePath,
    dfs,
    dfsLookup,
  );

  if (handler) {
    // Extract the directory path by removing the middleware filename
    const root = filePath.replace("_middleware.ts", "");

    logger.debug(
      `[dfs-utils] Middleware loaded for root: ${root}`,
    );

    return [root, handler];
  } else {
    logger.debug(
      `[dfs-utils] No middleware handlers found in ${filePath}`,
    );
    return undefined;
  }
}
