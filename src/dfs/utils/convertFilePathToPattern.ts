import { pathToPatternRegexes } from "./PathMatch.ts";

/**
 * Converts a file system path to one or more URL pattern specifications.
 *
 * This function transforms DFS file paths into URLPattern-compatible route patterns,
 * handling special bracket syntax for dynamic segments, optional parameters, and
 * catch-all routes.
 *
 * ## Pattern Syntax
 *
 * | File Path Syntax | URL Pattern Result | Description |
 * |------------------|-------------------|-------------|
 * | `[param]` | `:param` | Named route parameter |
 * | `[...path]` | `:path*` | Catch-all/spread parameter (matches remaining path) |
 * | `[[optional]]` | `{/:optional}?` | Optional route segment |
 *
 * ## Priority Calculation
 *
 * Priority determines matching order (higher = matched first):
 * - Base priority: `pathSegments * 10,000,000`
 * - Each dynamic segment: `-10,000 + weight`
 *   - Optional segments (`[[...]]`): weight = 2
 *   - Catch-all segments (`[...x]`): weight = -1000
 *   - Named segments (`[x]`): weight = 3
 * - Multiple optional segments: `+100 * optionalIndex`
 *
 * @param filePath - The file system path to convert (e.g., `./users/[id]/profile.ts`)
 * @param defaultFile - Optional default filename to strip (e.g., `index.ts`)
 * @returns Array of pattern specifications with `patternText` and `priority`.
 *          Returns multiple entries when optional segments create route variants.
 *
 * @example Basic route conversion
 * ```ts
 * convertFilePathToPattern("./users/index.ts", "index.ts")
 * // Returns: [{ patternText: "/users", priority: 10000000 }]
 * ```
 *
 * @example Named parameter
 * ```ts
 * convertFilePathToPattern("./users/[id].ts")
 * // Returns: [{ patternText: "/users/:id", priority: 19990003 }]
 * ```
 *
 * @example Catch-all route
 * ```ts
 * convertFilePathToPattern("./docs/[...path].ts")
 * // Returns: [{ patternText: "/docs/:path*", priority: 9989000 }]
 * ```
 *
 * @example Optional segment (generates multiple patterns)
 * ```ts
 * convertFilePathToPattern("./api/[[version]]/users.ts")
 * // Returns multiple patterns for with/without optional segment
 * ```
 */
export function convertFilePathToPattern(
  filePath: string,
  defaultFile?: string,
): { patternText: string; priority: number }[] {
  // Split path into segments for individual processing
  let parts = filePath.split("/");

  // Extract and process the filename (last segment)
  const lastPart = parts.pop();

  // If last part exists and isn't the default file (e.g., index.ts),
  // add it back without extension as a route segment
  if (lastPart && lastPart !== defaultFile) {
    parts.push(lastPart.replace(/\.\w+$/, ""));
  }

  // Base priority: more segments = higher priority (matched first)
  // Multiplier of 10M ensures segment count dominates over adjustments
  let priority = parts.length * 10000000;

  // Single-segment paths need empty string for proper URL formation
  if (parts.length === 1) {
    parts.push("");
  }

  // Track optional segments for generating route variants
  const optionalParts: string[] = [];

  // Transform each path segment using pattern regexes
  parts = parts.map((part) => {
    // Check if segment matches any dynamic pattern syntax
    const partCheck = pathToPatternRegexes.find(([pc]) => pc.test(part));

    if (partCheck) {
      const [partPattern, partFix, partWeight, partType] = partCheck;

      // Dynamic segments reduce priority (static routes match first)
      priority -= 10000;

      // Apply pattern-specific weight adjustment
      priority += partWeight;

      // Convert file syntax to URLPattern syntax
      part = part.replace(partPattern, partFix);

      // Collect optional segments for variant generation
      if (partType === "optional") {
        optionalParts.push(part);
      }
    }

    // Convert root marker "." to empty string
    if (part === ".") {
      part = "";
    }

    return part;
  });

  // Multiple optional segments require generating route variants
  // Each variant represents a different combination of included optionals
  if (optionalParts.length > 1) {
    return optionalParts.map((_op, i) => {
      // Optionals before current index: include as required segments
      const usedOps = optionalParts.slice(0, i);

      // Optionals after current index: exclude from this variant
      const unusedOps = optionalParts.slice(i + 1);

      const workParts = parts
        .map((part) => {
          if (usedOps.includes(part)) {
            // Convert optional syntax to required (remove {/ and }?)
            return part.replace("{/", "").replace("}?", "");
          } else if (unusedOps.includes(part)) {
            // Exclude unused optionals from this variant
            return "";
          } else {
            return part;
          }
        })
        .filter((wp) => wp);

      // Build URL pattern, ensuring proper slash handling for optionals
      const patternText = ["", ...workParts].join("/").replace("/{/:", "{/:");

      // Later variants (more optionals) get slightly higher priority
      priority += 100 * i;

      const p = priority;

      return { patternText, priority: p };
    });
  } else {
    // Simple case: no multiple optionals, generate single pattern
    const patternText = parts.join("/").replace("/{/:", "{/:");

    return [{ patternText, priority }];
  }
}
