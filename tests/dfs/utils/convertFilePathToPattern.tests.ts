import { assert, assertEquals } from "../../test.deps.ts";
import { convertFilePathToPattern } from "../../../src/dfs/utils/convertFilePathToPattern.ts";

/**
 * Tests for convertFilePathToPattern
 *
 * This function converts file paths from LoadAllPaths() to URL patterns for routing.
 * It's used by the API Processor to match incoming requests to file handlers.
 *
 * Bug being investigated:
 * - Request to /api/steward/enterprise fails with "NotFound: The requested path '/enterprise' could not be found"
 * - The file ./enterprise/index.ts exists but pattern matching isn't working
 */

Deno.test("convertFilePathToPattern - basic file paths", async (t) => {
  await t.step(
    "./enterprise/index.ts with defaultFile='index.ts' should produce /enterprise pattern",
    () => {
      const results = convertFilePathToPattern(
        "./enterprise/index.ts",
        "index.ts",
      );

      assertEquals(results.length, 1);
      assertEquals(results[0].patternText, "/enterprise");
    },
  );

  await t.step(
    "./enterprise/users.ts should produce /enterprise/users pattern",
    () => {
      const results = convertFilePathToPattern(
        "./enterprise/users.ts",
        "index.ts",
      );

      assertEquals(results.length, 1);
      assertEquals(results[0].patternText, "/enterprise/users");
    },
  );

  await t.step(
    "./enterprise/status/index.ts with defaultFile='index.ts' should produce /enterprise/status pattern",
    () => {
      const results = convertFilePathToPattern(
        "./enterprise/status/index.ts",
        "index.ts",
      );

      assertEquals(results.length, 1);
      assertEquals(results[0].patternText, "/enterprise/status");
    },
  );

  await t.step(
    "./index.ts with defaultFile='index.ts' should produce / pattern",
    () => {
      const results = convertFilePathToPattern("./index.ts", "index.ts");

      assertEquals(results.length, 1);
      assertEquals(results[0].patternText, "/");
    },
  );
});

Deno.test("convertFilePathToPattern - dynamic segments", async (t) => {
  await t.step("./users/[id].ts should produce /users/:id pattern", () => {
    const results = convertFilePathToPattern("./users/[id].ts", "index.ts");

    assertEquals(results.length, 1);
    assertEquals(results[0].patternText, "/users/:id");
  });

  await t.step(
    "./users/[id]/posts/[postId].ts should produce /users/:id/posts/:postId pattern",
    () => {
      const results = convertFilePathToPattern(
        "./users/[id]/posts/[postId].ts",
        "index.ts",
      );

      assertEquals(results.length, 1);
      assertEquals(results[0].patternText, "/users/:id/posts/:postId");
    },
  );
});

Deno.test("convertFilePathToPattern - catch-all segments", async (t) => {
  await t.step(
    "./docs/[...path].ts should produce /docs/:path* pattern",
    () => {
      const results = convertFilePathToPattern(
        "./docs/[...path].ts",
        "index.ts",
      );

      assertEquals(results.length, 1);
      assertEquals(results[0].patternText, "/docs/:path*");
    },
  );
});

Deno.test("convertFilePathToPattern - optional segments", async (t) => {
  await t.step(
    "./blog/[[category]]/index.ts should produce optional pattern",
    () => {
      const results = convertFilePathToPattern(
        "./blog/[[category]]/index.ts",
        "index.ts",
      );

      // Optional segments generate multiple patterns
      console.log("Optional segment patterns:", results);

      // At least one pattern should be generated
      assert(
        results.length >= 1,
        "Should generate at least one pattern for optional segments",
      );
    },
  );
});

Deno.test("convertFilePathToPattern - priority ordering", async (t) => {
  await t.step("more specific paths should have higher priority", () => {
    const rootResult = convertFilePathToPattern("./index.ts", "index.ts");
    const nestedResult = convertFilePathToPattern(
      "./enterprise/index.ts",
      "index.ts",
    );
    const deepResult = convertFilePathToPattern(
      "./enterprise/status/index.ts",
      "index.ts",
    );

    // Deeper paths should have higher priority
    assert(
      deepResult[0].priority > nestedResult[0].priority,
      "Deeper paths should have higher priority",
    );
    assert(
      nestedResult[0].priority > rootResult[0].priority,
      "Nested paths should have higher priority than root",
    );
  });

  await t.step(
    "static segments should have higher priority than dynamic segments",
    () => {
      const staticResult = convertFilePathToPattern(
        "./users/profile.ts",
        "index.ts",
      );
      const dynamicResult = convertFilePathToPattern(
        "./users/[id].ts",
        "index.ts",
      );

      console.log(
        "Static priority:",
        staticResult[0].priority,
        "Pattern:",
        staticResult[0].patternText,
      );
      console.log(
        "Dynamic priority:",
        dynamicResult[0].priority,
        "Pattern:",
        dynamicResult[0].patternText,
      );

      // Static should generally have higher priority than dynamic
      assert(
        staticResult[0].priority > dynamicResult[0].priority,
        "Static segments should have higher priority than dynamic segments",
      );
    },
  );
});

/**
 * This test replicates the exact scenario from the bug report
 * File structure from steward API:
 * - ./enterprise/index.ts
 * - ./enterprise/users.ts
 * - ./enterprise/status/index.ts
 * - ./index.ts
 */
Deno.test("convertFilePathToPattern - steward API file structure (bug replication)", async (t) => {
  const defaultFile = "index.ts";

  const files = [
    "./enterprise/index.ts",
    "./enterprise/users.ts",
    "./enterprise/status/index.ts",
    "./index.ts",
  ];

  await t.step("all steward API files should produce valid patterns", () => {
    const allPatterns = files.flatMap((f) =>
      convertFilePathToPattern(f, defaultFile)
    );

    const patternTexts = allPatterns.map((p) => p.patternText);

    console.log("Generated patterns for steward API:", patternTexts);

    // Verify all expected patterns are present
    assert(
      patternTexts.includes("/enterprise"),
      "Should have /enterprise pattern",
    );
    assert(
      patternTexts.includes("/enterprise/users"),
      "Should have /enterprise/users pattern",
    );
    assert(
      patternTexts.includes("/enterprise/status"),
      "Should have /enterprise/status pattern",
    );
    assert(patternTexts.includes("/"), "Should have / pattern");
  });
});
