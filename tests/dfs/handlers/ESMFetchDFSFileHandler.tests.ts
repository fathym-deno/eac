import { ESMFetchDFSFileHandler } from "../../../src/dfs/handlers/.exports.ts";
import { assertEquals, assertRejects } from "../../test.deps.ts";

/**
 * Test Suite for ESMFetchDFSFileHandler
 */
Deno.test("ESMFetchDFSFileHandler Tests", async (t) => {
  // ✅ Use a real ESM package from Skypack CDN
  const root = "jsr:@o-biotech/atomic";
  const entryPoints = ["mod.ts"]; // Lodash ES entry point

  const handlerWithDeps = new ESMFetchDFSFileHandler(
    root,
    entryPoints,
    true,
  );
  const handlerWithoutDeps = new ESMFetchDFSFileHandler(
    root,
    entryPoints,
    false,
  );

  await t.step(
    "LoadAllPaths should resolve all module paths (including dependencies)",
    async () => {
      const paths = await handlerWithDeps.LoadAllPaths("revision");

      console.log("Resolved Paths with Dependencies:", paths);
      assertEquals(paths.some((p) => p.includes("lodash")), true);
      assertEquals(paths.length > 1, true, "Should include dependencies.");
    },
  );

  await t.step(
    "LoadAllPaths should resolve entry points only (excluding dependencies)",
    async () => {
      const paths = await handlerWithoutDeps.LoadAllPaths("revision");

      console.log("Resolved Paths without Dependencies:", paths);
      assertEquals(paths.length, 1, "Should only return entry points.");
      assertEquals(paths[0], `./${entryPoints[0]}`);
    },
  );

  await t.step(
    "LoadAllPaths should correctly resolve import maps (if applicable)",
    async () => {
      const handlerWithImportMaps = new ESMFetchDFSFileHandler(
        "@o-biotech/atomic",
        ["mod.ts"],
        false,
      );

      const paths = await handlerWithImportMaps.LoadAllPaths("revision");

      console.log("Resolved Paths with Import Maps:", paths);
      assertEquals(paths.some((p) => p.includes("lodash")), true);
    },
  );

  await t.step(
    "LoadAllPaths should correctly resolve local file URLs",
    async () => {
      const localHandler = new ESMFetchDFSFileHandler(
        "file:///",
        ["mod.ts"],
        false,
      );
      const paths = await localHandler.LoadAllPaths("revision");

      console.log("Resolved Local Paths:", paths);
      assertEquals(paths.length, 1);
      assertEquals(paths[0], "./mod.ts");
    },
  );

  await t.step(
    "LoadAllPaths should throw an error when entry points are empty",
    async () => {
      const emptyHandler = new ESMFetchDFSFileHandler(root, [], false);
      await assertRejects(
        () => emptyHandler.LoadAllPaths("revision"),
        Error,
        "No entry points provided",
      );
    },
  );

  // ✅ Standard Fetch-Based Tests (Same as FetchDFSFileHandler)
  const testFilePath = "/sample.txt";
  const missingFile = "/missing.txt";

  await t.step("GetFileInfo should return valid file info", async () => {
    const fileInfo = await handlerWithDeps.GetFileInfo(
      testFilePath,
      "revision",
    );
    assertEquals(fileInfo?.Path, testFilePath);
    assertEquals(fileInfo?.Contents instanceof ReadableStream, true);
  });

  await t.step(
    "GetFileInfo should return undefined for missing file",
    async () => {
      const fileInfo = await handlerWithDeps.GetFileInfo(
        missingFile,
        "revision",
      );
      assertEquals(fileInfo, undefined);
    },
  );

  await t.step("LoadAllPaths should return valid paths", async () => {
    const paths = await handlerWithDeps.LoadAllPaths("revision");
    assertEquals(paths.length > 0, true, "Expected resolved module paths.");
  });

  await t.step("RemoveFile should throw NotSupported error", async () => {
    await assertRejects(
      () => handlerWithDeps.RemoveFile(testFilePath, "revision"),
      Deno.errors.NotSupported,
      "File removal is not supported.",
    );
  });

  await t.step("WriteFile should throw NotSupported error", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Sample Data"));
        controller.close();
      },
    });

    await assertRejects(
      () => handlerWithDeps.WriteFile(testFilePath, "revision", stream),
      Deno.errors.NotSupported,
      "File writing is not supported.",
    );
  });

  await t.step("Valid file paths should always start with /", async () => {
    const paths = await handlerWithDeps.LoadAllPaths("revision");
    for (const filePath of paths) {
      assertEquals(
        filePath.startsWith("/"),
        true,
        `File path should start with '/', but got: ${filePath}`,
      );
    }
  });
});
