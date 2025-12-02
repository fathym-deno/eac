import { type IDFSFileHandler, type TelemetryLogger } from "./.deps.ts";
import { IS_BUILDING } from "../../runtime/config/constants.ts";
import { EaCRuntimeHandlerPipeline } from "../../runtime/pipelines/EaCRuntimeHandlerPipeline.ts";
import { EaCRuntimeHandlerSet } from "../../runtime/pipelines/EaCRuntimeHandlerSet.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { PathMatch } from "./PathMatch.ts";
import { convertFilePathToMatch } from "./convertFilePathToMatch.ts";

/**
 * Loads all request path patterns from a DFS and creates sorted PathMatch entries.
 *
 * This is the main entry point for building a routing table from DFS files.
 * It discovers all files, filters out non-route files (middleware, layouts),
 * converts them to URL patterns, and sorts them by priority.
 *
 * ## Process Flow
 *
 * 1. Load all file paths from the DFS
 * 2. Filter out `_middleware.ts` and `_layout.tsx` files
 * 3. Convert each file path to PathMatch(es) via `convertFilePathToMatch`
 * 4. Sort patterns by priority (higher first)
 * 5. Move catch-all patterns (`*`) to the end
 *
 * ## Build Mode Behavior
 *
 * When `IS_BUILDING` is true (during `deno task build`), this function returns
 * an empty array to skip route loading during static site generation.
 *
 * ## Sorting Algorithm
 *
 * Patterns are sorted to ensure correct matching order:
 * 1. Primary sort: By priority (descending) - static routes before dynamic
 * 2. Secondary sort: Catch-all patterns moved last
 *
 * @typeParam TSetup - Type of setup context returned by the setup function
 *
 * @param fileHandler - DFS file handler for listing files
 * @param dfs - DFS configuration details
 * @param setup - Async function to create setup context from file list
 * @param loadHandlers - Function to load handlers from each file
 * @param configurePipeline - Function to configure each handler pipeline
 * @param logger - Optional telemetry logger for debug output
 * @returns Sorted array of PathMatch entries ready for request routing
 *
 * @example
 * ```ts
 * const patterns = await loadRequestPathPatterns(
 *   fileHandler,
 *   dfsDetails,
 *   async (paths) => ({ middleware: loadMiddlewareFromPaths(paths) }),
 *   async (path, setup) => loadEaCRuntimeHandlers(logger, fileHandler, path, dfs, lookup),
 *   (path, pipeline, setup) => applyMiddleware(pipeline, setup.middleware),
 *   logger,
 * );
 *
 * // patterns is now sorted by priority with catch-alls last
 * ```
 *
 * @remarks
 * TODO: Re-implement revision/caching support using withDFSCache() pattern
 */
export async function loadRequestPathPatterns<TSetup>(
  fileHandler: IDFSFileHandler,
  dfs: EaCDistributedFileSystemDetails,
  setup: (allPaths: string[]) => Promise<TSetup>,
  loadHandlers: (
    filePath: string,
    details: TSetup,
  ) => Promise<EaCRuntimeHandlerSet | undefined>,
  configurePipeline: (
    filePath: string,
    pipeline: EaCRuntimeHandlerPipeline,
    details: TSetup,
  ) => void,
  logger?: TelemetryLogger,
): Promise<PathMatch[]> {
  logger?.debug("[dfs-utils] Loading request path patterns from DFS");

  const allPaths = await fileHandler.LoadAllPaths();

  logger?.debug(`[dfs-utils] DFS returned ${allPaths.length} total paths`);

  if (!IS_BUILDING) {
    const details = await setup(allPaths);

    // Filter out middleware and layout files - they're handled separately
    const routePaths = allPaths.filter(
      (p) => !p.endsWith("_middleware.ts") && !p.endsWith("_layout.tsx"),
    );

    logger?.debug(
      `[dfs-utils] Processing ${routePaths.length} route files (excluded ${
        allPaths.length - routePaths.length
      } middleware/layout files)`,
    );

    const apiPathPatternCalls = routePaths.map((p) => {
      return convertFilePathToMatch<TSetup>(
        p,
        dfs,
        loadHandlers,
        configurePipeline,
        details,
        logger,
      );
    });

    const patterns = await Promise.all(apiPathPatternCalls);

    // Flatten (files with optional segments produce multiple patterns)
    // Then sort by priority and move catch-alls to end
    const sortedPatterns = patterns
      .flatMap((p) => p)
      .sort((a, b) => b.Priority - a.Priority)
      .sort((a, b) => {
        // Ensure catch-all patterns are matched last
        const aCatch = a.PatternText.endsWith("*") ? -1 : 1;
        const bCatch = b.PatternText.endsWith("*") ? -1 : 1;

        return bCatch - aCatch;
      });

    logger?.info(
      `[dfs-utils] Built routing table with ${sortedPatterns.length} patterns`,
    );

    if (logger) {
      // Log the final pattern order for debugging
      sortedPatterns.forEach((p, i) => {
        logger.debug(
          `[dfs-utils]   [${i}] ${p.PatternText} (priority: ${p.Priority})`,
        );
      });
    }

    return sortedPatterns;
  } else {
    logger?.debug(
      "[dfs-utils] Skipping pattern loading (IS_BUILDING=true)",
    );
    return [];
  }
}
