import { EaCRuntimeHandlerPipeline } from "../../runtime/pipelines/EaCRuntimeHandlerPipeline.ts";

/**
 * Represents a matched URL pattern with its associated handler pipeline.
 *
 * PathMatch objects are generated from file paths in the DFS and used to
 * route incoming requests to the appropriate handler.
 */
export type PathMatch = {
  /** The handler pipeline to execute when this pattern matches. */
  Handlers: EaCRuntimeHandlerPipeline;

  /** The original file path this pattern was generated from (e.g., `./enterprise/index.ts`). */
  Path: string;

  /** The compiled URLPattern for matching requests. */
  Pattern: URLPattern;

  /** The URL pattern text (e.g., `/enterprise`, `/users/:id`). */
  PatternText: string;

  /**
   * Priority value for pattern matching order.
   *
   * Higher values are matched first. Calculated based on:
   * - Path segment count (more segments = higher priority)
   * - Pattern type adjustments (optional segments reduce priority)
   * - Catch-all patterns (`*`) are always matched last
   */
  Priority: number;
};

/**
 * Regex transformations for converting file path segments to URL pattern syntax.
 *
 * Each entry is a tuple of:
 * - `[0]` RegExp - Pattern to match in the file path
 * - `[1]` string - Replacement pattern for URLPattern syntax
 * - `[2]` number - Priority weight adjustment
 * - `[3]` type - Pattern type identifier
 *
 * @example File path segment transformations
 * ```
 * [[optional]]  → {/:optional}?  (optional route segment)
 * [...path]     → :path*         (catch-all/spread parameter)
 * [id]          → :id            (named route parameter)
 * ```
 */
export const pathToPatternRegexes: [
  RegExp,
  string,
  number,
  "optional" | "expand" | "segment",
][] = [
  // [[optional]] → optional route segment that may or may not be present
  [/\[\[(.*?)\]\]/g, "{/:$1}?", 2, "optional"],
  // [...ident] → catch-all/spread parameter (matches remaining path)
  [/\[\.\.\.(.*?)\]/g, ":$1*", -1000, "expand"],
  // [segment] → named route parameter
  [/\[(.*?)\]/g, ":$1", 3, "segment"],
];
