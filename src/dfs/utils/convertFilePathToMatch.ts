import type { TelemetryLogger } from "./.deps.ts";
import { EaCRuntimeHandlerPipeline } from "../../runtime/pipelines/EaCRuntimeHandlerPipeline.ts";
import { EaCRuntimeHandlerSet } from "../../runtime/pipelines/EaCRuntimeHandlerSet.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { PathMatch } from "./PathMatch.ts";
import { convertFilePathToPattern } from "./convertFilePathToPattern.ts";

/**
 * Converts a file path to a complete PathMatch with handler pipeline.
 *
 * This function bridges the gap between raw file paths and fully configured
 * route handlers. It transforms a file path into one or more PathMatch objects,
 * each containing a compiled URLPattern and an executable handler pipeline.
 *
 * ## Process Flow
 *
 * 1. Convert file path to URL pattern(s) via `convertFilePathToPattern`
 * 2. For each pattern, load handlers from the file
 * 3. Create and configure the handler pipeline
 * 4. Compile the URLPattern for request matching
 *
 * @typeParam TSetup - Type of setup/context details passed to handlers
 *
 * @param filePath - The DFS file path to convert (e.g., `./users/[id].ts`)
 * @param dfs - DFS configuration containing DefaultFile setting
 * @param loadHandlers - Async function to load handlers from a file path
 * @param configurePipeline - Function to configure the pipeline after handler loading
 * @param details - Setup details passed to loadHandlers and configurePipeline
 * @param logger - Optional telemetry logger for debug output
 * @returns Array of PathMatch objects ready for request routing
 *
 * @example
 * ```ts
 * const matches = await convertFilePathToMatch(
 *   "./api/users/[id].ts",
 *   dfsDetails,
 *   async (path, setup) => await import(path),
 *   (path, pipeline, setup) => pipeline.Append(errorHandler),
 *   setupContext,
 *   logger,
 * );
 * // Returns PathMatch with pattern "/api/users/:id"
 * ```
 */
export async function convertFilePathToMatch<TSetup>(
  filePath: string,
  dfs: EaCDistributedFileSystemDetails,
  loadHandlers: (
    filePath: string,
    details: TSetup,
  ) => Promise<EaCRuntimeHandlerSet | undefined>,
  configurePipeline: (
    filePath: string,
    pipeline: EaCRuntimeHandlerPipeline,
    details: TSetup,
  ) => void,
  details: TSetup,
  logger?: TelemetryLogger,
): Promise<PathMatch[]> {
  logger?.debug(`[dfs-utils] Converting file path to match: ${filePath}`);

  // Generate URL pattern(s) from file path
  const patternResults = convertFilePathToPattern(filePath, dfs.DefaultFile);

  logger?.debug(
    `[dfs-utils] Generated ${patternResults.length} pattern(s) for ${filePath}`,
  );

  const pathMatchCalls = patternResults.map(
    async ({ patternText, priority }) => {
      logger?.debug(
        `[dfs-utils] Processing pattern: ${patternText} (priority: ${priority})`,
      );

      // Load handlers from the file
      const handler = await loadHandlers(filePath, details);

      // Create handler pipeline
      const pipeline = new EaCRuntimeHandlerPipeline();

      if (handler) {
        pipeline.Append(...(Array.isArray(handler) ? handler : [handler]));
        logger?.debug(
          `[dfs-utils] Loaded handler(s) for ${filePath} → ${patternText}`,
        );
      } else {
        logger?.debug(
          `[dfs-utils] No handlers loaded for ${filePath} → ${patternText}`,
        );
      }

      // Allow caller to configure the pipeline (e.g., add middleware)
      configurePipeline(filePath, pipeline, details);

      return {
        Handlers: pipeline,
        Path: filePath,
        Pattern: new URLPattern({
          pathname: patternText,
        }),
        PatternText: patternText,
        Priority: priority,
      } as PathMatch;
    },
  );

  const results = await Promise.all(pathMatchCalls);

  logger?.debug(
    `[dfs-utils] Created ${results.length} PathMatch(es) from ${filePath}`,
  );

  return results;
}
