import { assert, assertEquals, assertRejects } from "../../test.deps.ts";
import { convertFilePathToPattern } from "../../../src/dfs/utils/convertFilePathToPattern.ts";
import { PathMatch } from "../../../src/dfs/utils/PathMatch.ts";
import { EaCRuntimeHandlerPipeline } from "../../../src/runtime/pipelines/EaCRuntimeHandlerPipeline.ts";

/**
 * Tests for pattern matching flow used by API Processor
 *
 * The flow is:
 * 1. LoadAllPaths() returns file paths like "./enterprise/index.ts"
 * 2. convertFilePathToPattern() converts them to URL patterns like "/enterprise"
 * 3. URLPattern.test() matches request paths against patterns
 *
 * Bug being investigated:
 * - Request to /api/steward/enterprise fails with "NotFound: The requested path '/enterprise' could not be found"
 * - The file ./enterprise/index.ts exists and convertFilePathToPattern produces /enterprise
 * - But pattern matching fails
 */

/**
 * Helper to create PathMatch objects for testing
 * Sorts by priority descending (as loadRequestPathPatterns does)
 */
function createPathMatches(
  files: string[],
  defaultFile: string,
): PathMatch[] {
  const matches = files.flatMap((filePath) => {
    const patterns = convertFilePathToPattern(filePath, defaultFile);
    return patterns.map(({ patternText, priority }) => ({
      Handlers: new EaCRuntimeHandlerPipeline(),
      Path: filePath,
      Pattern: new URLPattern({ pathname: patternText }),
      PatternText: patternText,
      Priority: priority,
    }));
  });

  // Sort by priority descending (as loadRequestPathPatterns does)
  // Also sort catch-all patterns to the end
  return matches
    .sort((a, b) => b.Priority - a.Priority)
    .sort((a, b) => {
      const aCatch = a.PatternText.endsWith("*") ? -1 : 1;
      const bCatch = b.PatternText.endsWith("*") ? -1 : 1;
      return bCatch - aCatch;
    });
}

/**
 * Helper to simulate how executePathMatch tests URLs
 * This is EXACTLY how @fathym/eac constructs the test URL
 */
function testPatternMatch(
  patterns: PathMatch[],
  requestPath: string,
): PathMatch | undefined {
  const apiTestUrl = new URL(
    `.${requestPath}`,
    new URL("https://notused.com"),
  );

  return patterns.find((app) => app.Pattern.test(apiTestUrl));
}

Deno.test("Pattern matching - basic paths", async (t) => {
  const files = [
    "./enterprise/index.ts",
    "./enterprise/users.ts",
    "./enterprise/status/index.ts",
    "./index.ts",
  ];
  const patterns = createPathMatches(files, "index.ts");

  await t.step("/enterprise should match /enterprise pattern", () => {
    const match = testPatternMatch(patterns, "/enterprise");

    console.log("Request: /enterprise");
    console.log("Available patterns:", patterns.map((p) => p.PatternText));
    console.log("Match result:", match?.PatternText);

    assert(match, "Should find a match for /enterprise");
    assertEquals(match!.PatternText, "/enterprise");
    assertEquals(match!.Path, "./enterprise/index.ts");
  });

  await t.step(
    "/enterprise/users should match /enterprise/users pattern",
    () => {
      const match = testPatternMatch(patterns, "/enterprise/users");

      assert(match, "Should find a match for /enterprise/users");
      assertEquals(match!.PatternText, "/enterprise/users");
      assertEquals(match!.Path, "./enterprise/users.ts");
    },
  );

  await t.step(
    "/enterprise/status should match /enterprise/status pattern",
    () => {
      const match = testPatternMatch(patterns, "/enterprise/status");

      assert(match, "Should find a match for /enterprise/status");
      assertEquals(match!.PatternText, "/enterprise/status");
      assertEquals(match!.Path, "./enterprise/status/index.ts");
    },
  );

  await t.step("/ should match / pattern", () => {
    const match = testPatternMatch(patterns, "/");

    assert(match, "Should find a match for /");
    assertEquals(match!.PatternText, "/");
    assertEquals(match!.Path, "./index.ts");
  });

  await t.step("/nonexistent should NOT match any pattern", () => {
    const match = testPatternMatch(patterns, "/nonexistent");

    assertEquals(match, undefined, "Should NOT find a match for /nonexistent");
  });
});

Deno.test("Pattern matching - dynamic segments", async (t) => {
  const files = [
    "./users/index.ts",
    "./users/[id].ts",
    "./users/[id]/posts/[postId].ts",
  ];
  const patterns = createPathMatches(files, "index.ts");

  await t.step("/users should match /users pattern", () => {
    const match = testPatternMatch(patterns, "/users");

    assert(match, "Should find a match for /users");
    assertEquals(match!.PatternText, "/users");
  });

  await t.step("/users/123 should match /users/:id pattern", () => {
    const match = testPatternMatch(patterns, "/users/123");

    assert(match, "Should find a match for /users/123");
    assertEquals(match!.PatternText, "/users/:id");
  });

  await t.step(
    "/users/123/posts/456 should match /users/:id/posts/:postId pattern",
    () => {
      const match = testPatternMatch(patterns, "/users/123/posts/456");

      assert(match, "Should find a match for /users/123/posts/456");
      assertEquals(match!.PatternText, "/users/:id/posts/:postId");
    },
  );
});

Deno.test("Pattern matching - catch-all segments", async (t) => {
  const files = [
    "./docs/[...path].ts",
    "./docs/index.ts",
  ];
  const patterns = createPathMatches(files, "index.ts");

  await t.step("/docs should match /docs pattern", () => {
    const match = testPatternMatch(patterns, "/docs");

    assert(match, "Should find a match for /docs");
    // Should prefer exact match over catch-all
    assertEquals(match!.PatternText, "/docs");
  });

  await t.step("/docs/getting-started should match catch-all pattern", () => {
    const match = testPatternMatch(patterns, "/docs/getting-started");

    assert(match, "Should find a match for /docs/getting-started");
    assertEquals(match!.PatternText, "/docs/:path*");
  });

  await t.step("/docs/api/v1/users should match catch-all pattern", () => {
    const match = testPatternMatch(patterns, "/docs/api/v1/users");

    assert(match, "Should find a match for /docs/api/v1/users");
    assertEquals(match!.PatternText, "/docs/:path*");
  });
});

/**
 * This test replicates the exact scenario from the bug report
 */
Deno.test("Pattern matching - steward API bug replication", async (t) => {
  const files = [
    "./enterprise/index.ts",
    "./enterprise/users.ts",
    "./enterprise/status/index.ts",
    "./enterprise/_middleware.ts",
    "./index.ts",
  ];

  // Filter out middleware (as the API processor does)
  const apiFiles = files.filter((f) => !f.endsWith("_middleware.ts"));

  const patterns = createPathMatches(apiFiles, "index.ts");

  await t.step("steward API patterns are generated correctly", () => {
    const patternTexts = patterns.map((p) => p.PatternText);

    console.log("Steward API patterns:", patternTexts);

    assert(patternTexts.includes("/enterprise"), "Should have /enterprise");
    assert(
      patternTexts.includes("/enterprise/users"),
      "Should have /enterprise/users",
    );
    assert(
      patternTexts.includes("/enterprise/status"),
      "Should have /enterprise/status",
    );
    assert(patternTexts.includes("/"), "Should have /");
  });

  await t.step(
    "request to /enterprise should find ./enterprise/index.ts",
    () => {
      const match = testPatternMatch(patterns, "/enterprise");

      console.log("Request: /enterprise");
      console.log(
        "Match result:",
        match ? `${match.PatternText} -> ${match.Path}` : "NO MATCH",
      );

      assert(match, "Should find a match for /enterprise");
      assertEquals(match!.Path, "./enterprise/index.ts");
    },
  );

  await t.step(
    "request to /enterprise/users should find ./enterprise/users.ts",
    () => {
      const match = testPatternMatch(patterns, "/enterprise/users");

      assert(match, "Should find a match for /enterprise/users");
      assertEquals(match!.Path, "./enterprise/users.ts");
    },
  );

  await t.step(
    "request to /enterprise/status should find ./enterprise/status/index.ts",
    () => {
      const match = testPatternMatch(patterns, "/enterprise/status");

      assert(match, "Should find a match for /enterprise/status");
      assertEquals(match!.Path, "./enterprise/status/index.ts");
    },
  );
});

/**
 * Test the URL construction that executePathMatch uses
 * This is how the API processor creates the test URL
 */
Deno.test("URL construction for pattern matching", async (t) => {
  await t.step("URL construction for /enterprise", () => {
    const requestPath = "/enterprise";
    const apiTestUrl = new URL(
      `.${requestPath}`,
      new URL("https://notused.com"),
    );

    console.log("Request path:", requestPath);
    console.log("Constructed URL:", apiTestUrl.href);
    console.log("URL pathname:", apiTestUrl.pathname);

    // The pathname should be /enterprise
    assertEquals(apiTestUrl.pathname, "/enterprise");
  });

  await t.step("URL construction for /", () => {
    const requestPath = "/";
    const apiTestUrl = new URL(
      `.${requestPath}`,
      new URL("https://notused.com"),
    );

    console.log("Request path:", requestPath);
    console.log("Constructed URL:", apiTestUrl.href);
    console.log("URL pathname:", apiTestUrl.pathname);

    // The pathname should be /
    assertEquals(apiTestUrl.pathname, "/");
  });

  await t.step(
    "URLPattern.test() with /enterprise pattern matches /enterprise URL",
    () => {
      const pattern = new URLPattern({ pathname: "/enterprise" });
      const url = new URL("./enterprise", new URL("https://notused.com"));

      console.log("Pattern:", "/enterprise");
      console.log("URL to test:", url.href);
      console.log("URL pathname:", url.pathname);

      const matches = pattern.test(url);

      assert(matches, "Pattern /enterprise should match URL ./enterprise");
    },
  );
});
