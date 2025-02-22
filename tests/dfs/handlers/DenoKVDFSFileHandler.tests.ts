import { EaCDenoKVDistributedFileSystemDetails } from "../../../src/dfs/handlers/.deps.ts";
import { DenoKVDFSFileHandler } from "../../../src/dfs/handlers/.exports.ts";
import { assertEquals, assertRejects } from "../../test.deps.ts";

/**
 * Test Suite for DenoKVDFSFileHandler
 */
Deno.test("DenoKVDFSFileHandler Tests", async (t) => {
  const mockKv = await Deno.openKv(); // Create a temporary Deno KV instance
  const rootKey = ["DFS"];
  const rootPath = "testRoot";
  const segmentPath = "segments";
  const revision = "test-revision";

  const dfsHandler = new DenoKVDFSFileHandler(
    "test",
    {
      Type: "DenoKV",
      DatabaseLookup: "",
      FileRoot: rootPath,
      RootKey: rootKey,
      SegmentPath: segmentPath,
    },
    mockKv,
  );

  const testFilePath = "/sample.txt";
  const nestedFilePath = "/nested/dir/file.json";
  const missingFile = "/missing.txt";
  const validFilePaths = [testFilePath, nestedFilePath];
  const fileContents = "Hello, Deno KV DFS!";

  // ✅ Write test files using the `WriteFile` API
  for (const filePath of validFilePaths) {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(fileContents));
        controller.close();
      },
    });

    await dfsHandler.WriteFile(filePath, revision, stream);
  }

  await t.step("GetFileInfo should return valid file info", async () => {
    for (const filePath of validFilePaths) {
      const fileInfo = await dfsHandler.GetFileInfo(filePath, revision);
      assertEquals(fileInfo?.Path, filePath);
      assertEquals(fileInfo?.Contents instanceof ReadableStream, true);
    }
  });

  await t.step("GetFileInfo should throw for missing file", async () => {
    await assertRejects(
      () => dfsHandler.GetFileInfo(missingFile, revision),
      Error,
      `Unable to locate a DenoKV file at path ${missingFile}.`,
    );
  });

  await t.step("LoadAllPaths should return files in the KV store", async () => {
    const paths = await dfsHandler.LoadAllPaths(revision);
    for (const filePath of validFilePaths) {
      assertEquals(
        paths.includes(filePath),
        true,
        `Expected to find ${filePath} in KV store, found: ${
          JSON.stringify(
            paths,
          )
        }`,
      );
    }
  });

  await t.step("RemoveFile should delete file from Deno KV", async () => {
    for (const filePath of validFilePaths) {
      await dfsHandler.RemoveFile(filePath, revision);

      const fileInfo = await mockKv.get([
        ...rootKey,
        "Root",
        rootPath,
        "Revision",
        revision,
        "Path",
        ...filePath.split("/").filter((fp) => fp),
      ]);

      assertEquals(
        fileInfo.value,
        null,
        `File should be removed, but found: ${JSON.stringify(fileInfo.value)}`,
      );
    }
  });

  await t.step("WriteFile should store a file in Deno KV", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("New file content"));
        controller.close();
      },
    });

    await dfsHandler.WriteFile(testFilePath, revision, stream);

    const fileInfo = await dfsHandler.GetFileInfo(testFilePath, revision);
    assertEquals(fileInfo?.Path, testFilePath);
    assertEquals(fileInfo?.Contents instanceof ReadableStream, true);
  });

  // ✅ Ensure behavior for unsupported file operations
  await t.step("RemoveFile should reject if file doesn't exist", async () => {
    await dfsHandler.RemoveFile(missingFile, revision);

    assertRejects(() => dfsHandler.GetFileInfo(missingFile, revision));
  });

  await t.step("WriteFile should handle empty file content", async () => {
    const emptyStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(0)); // Empty content
        controller.close();
      },
    });

    await dfsHandler.WriteFile(testFilePath, revision, emptyStream);

    const fileInfo = await dfsHandler.GetFileInfo(testFilePath, revision);
    assertEquals(fileInfo?.Path, testFilePath);
    assertEquals(fileInfo?.Contents instanceof ReadableStream, true);
  });

  // ✅ Check that file paths are consistent across DFSHandlers
  await t.step("Valid file paths should always start with /", async () => {
    const paths = await dfsHandler.LoadAllPaths(revision);
    for (const filePath of paths) {
      assertEquals(
        filePath.startsWith("/"),
        true,
        `File path should start with '/', but got: ${filePath}`,
      );
    }
  });

  // Cleanup
  await mockKv.close();
});
