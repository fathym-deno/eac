import { toJson } from "jsr:@std/streams@1.0.8/to-json";
import { NPMFetchDFSFileHandler } from "../../../src/dfs/handlers/.exports.ts";
import { assertEquals, assertRejects, assertThrows } from "../../test.deps.ts";
import { toText } from "jsr:@std/streams@1.0.8/to-text";

/**
 * Test Suite for NPMFetchDFSFileHandler
 */
Deno.test("NPMFetchDFSFileHandler Tests", async (t) => {
  // ✅ Using a real NPM package from Skypack CDN
  const packageName = "lodash-es@4.17.21";
  const handler = new NPMFetchDFSFileHandler(packageName);

  await t.step("Constructor should set correct Root URL", () => {
    assertEquals(
      handler.Root,
      `https://cdn.skypack.dev/${packageName}/`,
      "Root URL should be properly constructed for Skypack.",
    );
  });

  await t.step(
    "GetFileInfo should return valid file info for an existing module file",
    async () => {
      const validFilePath = "/lodash.js"; // Lodash entry module

      const fileInfo = await handler.GetFileInfo(validFilePath, "revision");

      assertEquals(
        fileInfo?.Path,
        validFilePath,
        "Returned path should match request.",
      );
      assertEquals(
        fileInfo?.Contents instanceof ReadableStream,
        true,
        "Contents should be a ReadableStream.",
      );
    },
  );

  await t.step(
    "GetFileInfo should return undefined for non-existent file",
    async () => {
      const missingFile = "/missing-file.js";

      const fileInfo = await handler.GetFileInfo(missingFile, "revision");
      assertEquals(
        fileInfo,
        undefined,
        "File should return undefined if missing.",
      );
    },
  );

  await t.step("LoadAllPaths should throw NotSupported error", async () => {
    await assertRejects(
      () => handler.LoadAllPaths("revision"),
      Deno.errors.NotSupported,
      "Retrieval of fetch paths is not supported.",
    );
  });

  await t.step("RemoveFile should throw NotSupported error", async () => {
    await assertRejects(
      () => handler.RemoveFile("/lodash.js", "revision"),
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
      () => handler.WriteFile("/lodash.js", "revision", stream),
      Deno.errors.NotSupported,
      "File writing is not supported.",
    );
  });

  await t.step("Valid file paths should always start with /", async () => {
    const validFilePath = "/lodash.js";
    const fileInfo = await handler.GetFileInfo(validFilePath, "revision");

    assertEquals(
      fileInfo?.Path?.startsWith("/"),
      true,
      `File path should start with '/', but got: ${fileInfo?.Path}`,
    );
  });
});
