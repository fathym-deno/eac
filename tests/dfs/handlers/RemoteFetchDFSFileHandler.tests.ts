import { EaCRemoteDistributedFileSystemDetails } from "../../../src/dfs/handlers/.deps.ts";
import { RemoteFetchDFSFileHandler } from "../../../src/dfs/handlers/RemoteFetchDFSFileHandler.ts";
import { assertEquals, assertRejects } from "../../test.deps.ts";

/**
 * Test Suite for FetchDFSFileHandler
 */
Deno.test("FetchDFSFileHandler Tests", async (t) => {
  // ✅ Use a real public file for online testing
  const realRoot = "https://raw.githubusercontent.com/denoland/deno/main/";
  const validFilePaths = [
    "/README.md", // ✅ Publicly available file
    "/.github/workflows/ci.yml", // ✅ Nested file
  ];
  const missingFile = "/does-not-exist.txt"; // ❌ Should return 404

  const dfsHandler = new RemoteFetchDFSFileHandler("test", {
    Type: "Remote",
    RemoteRoot: realRoot,
  });

  await t.step("GetFileInfo should return valid file info", async () => {
    for (const filePath of validFilePaths) {
      const fileInfo = await dfsHandler.GetFileInfo(filePath, "revision");

      assertEquals(fileInfo?.Path, filePath);
      assertEquals(fileInfo?.Contents instanceof ReadableStream, true);

      fileInfo?.Contents.cancel();
    }
  });

  await t.step("GetFileInfo should be undefined for missing file", async () => {
    const fileInfo = await dfsHandler.GetFileInfo(missingFile, "revision");
    assertEquals(fileInfo, undefined);
  });

  await t.step("LoadAllPaths should throw NotSupported error", async () => {
    await assertRejects(
      () => dfsHandler.LoadAllPaths("revision"),
      Deno.errors.NotSupported,
      "Retrieval of fetch paths is not supported.",
    );
  });

  await t.step("RemoveFile should throw NotSupported error", async () => {
    await assertRejects(
      () => dfsHandler.RemoveFile(validFilePaths[0], "revision"),
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
      () => dfsHandler.WriteFile(validFilePaths[0], "revision", stream),
      Deno.errors.NotSupported,
      "File writing is not supported.",
    );
  });

  await t.step("Valid file paths should always start with /", async () => {
    for (const filePath of validFilePaths) {
      assertEquals(
        filePath.startsWith("/"),
        true,
        `File path should start with '/', but got: ${filePath}`,
      );
    }
  });
});
