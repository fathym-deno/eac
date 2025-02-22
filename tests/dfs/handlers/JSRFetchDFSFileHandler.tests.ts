import { JSRFetchDFSFileHandler } from "../../../src/dfs/handlers/.exports.ts";
import { EaCJSRDistributedFileSystemDetails } from "../../../src/dfs/resolvers/.deps.ts";
import { assertEquals, assertRejects, assertThrows } from "../../test.deps.ts";

/**
 * Test Suite for JSRFetchDFSFileHandler
 */
Deno.test("JSRFetchDFSFileHandler Tests", async (t) => {
  // ✅ Use a real JSR package example
  const packageName = "@fathym/atomic";
  const version = ""; // This should resolve to the latest version
  const handler = new JSRFetchDFSFileHandler("test", {
    Details: {
      Type: "JSR",
      Package: packageName,
      Version: version,
    } as EaCJSRDistributedFileSystemDetails,
  });
  const rootedHandler = new JSRFetchDFSFileHandler("test", {
    Details: {
      Type: "JSR",
      Package: packageName,
      Version: version,
      FileRoot: "/src/",
    } as EaCJSRDistributedFileSystemDetails,
  });

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
    "LoadAllPaths should retrieve all JSR module paths from File Root",
    async () => {
      const paths = await rootedHandler.LoadAllPaths("revision");

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
    "GetFileInfo should return valid file info (if module exists) for default file",
    async () => {
      const testFilePath = "/src/atoms/.exports.ts"; // Use first resolved module file

      const fileInfo = await rootedHandler.GetFileInfo(
        "/atoms",
        "revision",
        ".exports.ts",
      );
      assertEquals(fileInfo?.Path, "/atoms/.exports.ts");
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
      const invalidHandler = new JSRFetchDFSFileHandler("test", {
        Details: {
          Type: "JSR",
          Package: "@invalid/package",
          Version: "",
        } as EaCJSRDistributedFileSystemDetails,
      });
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
