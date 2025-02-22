import { EaCLocalDistributedFileSystemDetails } from "../../../src/dfs/handlers/.deps.ts";
import { LocalDFSFileHandler } from "../../../src/dfs/handlers/.exports.ts";
import { assertEquals, assertRejects } from "../../test.deps.ts";

/**
 * Test Suite for LocalDFSFileHandler
 */
Deno.test("LocalDFSFileHandler Tests", async (t) => {
  const testRoot = "./test_data";
  const validFile = "/sample.txt";
  const missingFile = "missing.txt";
  const revision = "test-revision";

  // Ensure test directory and file exist
  await Deno.mkdir(testRoot, { recursive: true });
  await Deno.writeTextFile(`${testRoot}/${validFile}`, "Hello, Local DFS!");

  const dfsHandler = new LocalDFSFileHandler("test", {
    Details: {
      Type: "Local",
      FileRoot: testRoot,
    } as EaCLocalDistributedFileSystemDetails,
  });

  await t.step("GetFileInfo should return valid file info", async () => {
    const fileInfo = await dfsHandler.GetFileInfo(validFile, revision);
    assertEquals(fileInfo?.Path, validFile);
    assertEquals(fileInfo?.Contents instanceof ReadableStream, true);
  });

  await t.step(
    "GetFileInfo should return undefined for missing file",
    async () => {
      const missingFile = "/nonexistent.js";
      const fileInfo = await dfsHandler.GetFileInfo(missingFile, "revision");
      assertEquals(fileInfo, undefined);
    },
  );

  await t.step(
    "LoadAllPaths should return files in the directory",
    async () => {
      const paths = await dfsHandler.LoadAllPaths(revision);
      assertEquals(paths.includes(`.${validFile}`), true);
    },
  );

  await t.step("RemoveFile should throw NotSupported error", async () => {
    await assertRejects(
      () => dfsHandler.RemoveFile(validFile, revision),
      Deno.errors.NotSupported,
      "File removal not yet supported.",
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
      () => dfsHandler.WriteFile(validFile, revision, stream),
      Deno.errors.NotSupported,
      "File writing not yet supported.",
    );
  });

  // Cleanup test files
  await Deno.remove(testRoot, { recursive: true });
});
