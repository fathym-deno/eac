import { type IDFSFileHandler, TelemetryLogger } from "./.deps.ts";
import { EaCRuntimeHandlerSet } from "../../runtime/pipelines/EaCRuntimeHandlerSet.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { importDFSTypescriptModule } from "./importDFSTypescriptModule.ts";

/**
 * Loads EaC runtime handlers from a TypeScript module in the DFS.
 *
 * This function imports a TypeScript file from the distributed file system and
 * extracts the request handlers. It looks for either a named `handler` export
 * or a `default` export.
 *
 * ## Handler Export Patterns
 *
 * Modules can export handlers in two ways:
 * ```ts
 * // Named export (preferred)
 * export const handler: EaCRuntimeHandler = (req, ctx) => { ... };
 *
 * // Default export
 * export default function(req, ctx) { ... };
 * ```
 *
 * @param logger - Telemetry logger for debug and error output
 * @param fileHandler - DFS file handler for reading the module
 * @param filePath - Path to the TypeScript file in the DFS
 * @param dfs - DFS configuration details
 * @param dfsLookup - Lookup key identifying this DFS
 * @returns The handler set if found, undefined otherwise
 *
 * @example
 * ```ts
 * const handlers = await loadEaCRuntimeHandlers(
 *   logger,
 *   fileHandler,
 *   "./api/users/index.ts",
 *   dfsDetails,
 *   "api-dfs",
 * );
 *
 * if (handlers) {
 *   pipeline.Append(...handlers);
 * }
 * ```
 */
export async function loadEaCRuntimeHandlers(
  logger: TelemetryLogger,
  fileHandler: IDFSFileHandler,
  filePath: string,
  dfs: EaCDistributedFileSystemDetails,
  dfsLookup: string,
): Promise<EaCRuntimeHandlerSet | undefined> {
  logger.debug(`[dfs-utils] Loading runtime handlers from: ${filePath}`);

  const apiModule = await importDFSTypescriptModule(
    logger,
    fileHandler,
    filePath,
    dfs,
    dfsLookup,
    "ts",
  );

  if (apiModule) {
    // Look for named 'handler' export first, then fall back to default export
    const handlers = apiModule.module.handler as EaCRuntimeHandlerSet;
    const defaultHandlers = apiModule.module.default as EaCRuntimeHandlerSet;

    const result = handlers || defaultHandlers;

    if (result) {
      const exportType = handlers ? "handler" : "default";
      logger.debug(
        `[dfs-utils] Found ${exportType} export in ${filePath}`,
      );
    } else {
      logger.warn(
        `[dfs-utils] Module ${filePath} loaded but has no handler or default export`,
      );
    }

    return result;
  } else {
    logger.debug(`[dfs-utils] No module loaded for ${filePath}`);
    return undefined;
  }
}
