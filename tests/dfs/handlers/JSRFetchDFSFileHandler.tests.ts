import { JSRFetchDFSFileHandler } from "../../../src/dfs/handlers/.exports.ts";
import { assertEquals, assertRejects, assertThrows } from "../../test.deps.ts";

/**
 * Test Suite for JSRFetchDFSFileHandler
 */
Deno.test("JSRFetchDFSFileHandler Tests", async (t) => {
  // ✅ Use a real JSR package example
  const packageName = "@fathym/atomic";
  const version = ""; // This should resolve to the latest version
  const handler = new JSRFetchDFSFileHandler(packageName, version);

  await t.step(
    "ResolveVersion should correctly determine the latest version",
    async () => {
      await handler["resolveVersion"]();
      assertEquals(
        typeof handler["version"],
        "string",
        "Version should be resolved as a string.",
      );
      assertEquals(
        handler["version"]!.length > 0,
        true,
        "Version should not be empty.",
      );
    },
  );

  await t.step(
    "LoadAllPaths should retrieve all JSR module paths",
    async () => {
      const paths = await handler.LoadAllPaths("revision");

      console.log("Resolved Paths:", paths);
      assertEquals(paths.length > 0, true, "Should retrieve module paths.");
      assertEquals(
        paths.some((p) => p.startsWith("/")),
        true,
        "Paths should start with '/'",
      );
    },
  );

  await t.step(
    "GetFileInfo should return valid file info (if module exists)",
    async () => {
      const testFilePath = "/src/atoms/.exports.ts"; // Use first resolved module file

      const fileInfo = await handler.GetFileInfo(testFilePath, "revision");
      assertEquals(fileInfo?.Path, "/src/atoms/.exports.ts");
      assertEquals(fileInfo?.Contents instanceof ReadableStream, true);
    },
  );

  await t.step(
    "GetFileInfo should return undefined for missing JSR file",
    async () => {
      const missingFile = "/nonexistent.js";
      const fileInfo = await handler.GetFileInfo(missingFile, "revision");
      assertEquals(fileInfo, undefined);
    },
  );

  await t.step(
    "JSRFetchDFSFileHandler should throw an error for invalid package",
    async () => {
      const invalidHandler = new JSRFetchDFSFileHandler("@invalid/package");
      await assertRejects(
        () => invalidHandler.LoadAllPaths("revision"),
        Error,
        'Package "@invalid/package" does not exist or is unavailable.',
      );
    },
  );

  // ✅ Standard Fetch-Based DFS Tests
  const validFilePath = "/mod.ts";
  const missingFilePath = "/missing.ts";

  await t.step("RemoveFile should throw NotSupported error", async () => {
    await assertRejects(
      () => handler.RemoveFile(validFilePath, "revision"),
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
      () => handler.WriteFile(validFilePath, "revision", stream),
      Deno.errors.NotSupported,
      "File writing is not supported.",
    );
  });

  await t.step("Valid file paths should always start with /", async () => {
    const paths = await handler.LoadAllPaths("revision");
    for (const filePath of paths) {
      assertEquals(
        filePath.startsWith("/"),
        true,
        `File path should start with '/', but got: ${filePath}`,
      );
    }
  });
});
