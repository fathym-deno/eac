import { establishHeaders, type TelemetryLogger } from "./.deps.ts";
import { EaCRuntimeContext } from "../../runtime/_/EaCRuntimeContext.ts";
import { PathMatch } from "./PathMatch.ts";

/**
 * Executes a request against a set of path patterns and returns the response.
 *
 * This function performs URL pattern matching against a sorted list of PathMatch
 * entries and executes the handler pipeline of the first matching pattern.
 *
 * ## Matching Process
 *
 * 1. Construct a test URL from the request path
 * 2. Find the first pattern that matches (patterns should be pre-sorted by priority)
 * 3. Extract URL parameters from the pattern match
 * 4. Execute the handler pipeline
 * 5. Apply default content type if response lacks one
 *
 * ## Error Handling
 *
 * Throws `Deno.errors.NotFound` if no pattern matches the request path.
 * This error should be caught by the runtime and converted to a 404 response.
 *
 * @param matches - Sorted array of PathMatch entries to test against
 * @param req - The incoming HTTP request
 * @param ctx - Runtime context containing URL match info and request state
 * @param defaultContentType - Optional default Content-Type for responses without one
 * @param logger - Optional telemetry logger for debug output
 * @returns The response from the matched handler pipeline
 * @throws {Deno.errors.NotFound} When no pattern matches the request path
 *
 * @example
 * ```ts
 * try {
 *   const response = await executePathMatch(
 *     patterns,
 *     request,
 *     runtimeContext,
 *     "application/json",
 *     logger,
 *   );
 *   return response;
 * } catch (error) {
 *   if (error instanceof Deno.errors.NotFound) {
 *     return new Response("Not Found", { status: 404 });
 *   }
 *   throw error;
 * }
 * ```
 */
export async function executePathMatch(
  matches: PathMatch[],
  req: Request,
  ctx: EaCRuntimeContext,
  defaultContentType?: string,
  logger?: TelemetryLogger,
): Promise<Response> {
  const requestPath = ctx.Runtime.URLMatch.Path;

  logger?.debug(`[pattern-match] Matching request path: ${requestPath}`);

  // Construct URL for pattern testing (base URL is irrelevant for pathname matching)
  const apiTestUrl = new URL(
    `.${requestPath}`,
    new URL("https://notused.com"),
  );

  // Find the first matching pattern (relies on patterns being sorted by priority)
  const match = matches.find((app) => {
    const isMatch = app.Pattern.test(apiTestUrl);

    if (isMatch) {
      logger?.debug(
        `[pattern-match] Pattern matched: ${app.PatternText} (priority: ${app.Priority})`,
      );
    }

    return isMatch;
  });

  if (!match) {
    logger?.warn(
      `[pattern-match] No pattern matched for path: ${requestPath}`,
    );

    throw new Deno.errors.NotFound(
      `The requested path '${requestPath}' could not be found.`,
    );
  }

  // Extract URL parameters (e.g., :id from /users/:id)
  const patternResult = match!.Pattern.exec(apiTestUrl);
  ctx.Params = patternResult?.pathname.groups || {};

  logger?.debug(
    `[pattern-match] Extracted params: ${JSON.stringify(ctx.Params)}`,
  );

  // Execute the handler pipeline
  let resp = match.Handlers.Execute(req, ctx);

  // Apply default content type if needed
  if (defaultContentType) {
    resp = await resp;

    if (
      !resp.headers.has("content-type") ||
      resp.headers.get("content-type") === "text/plain;charset=UTF-8"
    ) {
      logger?.debug(
        `[pattern-match] Applying default content-type: ${defaultContentType}`,
      );

      resp = new Response(resp.body, {
        headers: establishHeaders(resp.headers, {
          "Content-Type": defaultContentType,
        }),
        status: resp.status,
        statusText: resp.statusText,
      });
    }
  }

  return resp;
}
