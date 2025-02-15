import { AzureBlobDFSFileHandler } from "../../../src/dfs/handlers/.exports.ts";
import { assertEquals, assertRejects } from "../../test.deps.ts";

/**
 * Test Suite for AzureBlobDFSFileHandler
 */
Deno.test("AzureBlobDFSFileHandler Tests", async (t) => {
  // ✅ Configuration for Azure Blob Storage
  const container = "deployments";
  const fileRoot = "o-biotech/public-web-about/latest";
  const connectionString = Deno.env.get("AZURE_STORAGE_CONNECTION_STRING") ||
    "";

  if (!connectionString) {
    console.error("Azure Storage Connection String is missing.");
    return;
  }

  const handler = new AzureBlobDFSFileHandler(
    connectionString,
    container,
    fileRoot,
  );

  await t.step("GetFileInfo should return valid file info", async () => {
    const testFilePath = "/index.html"; // Assuming this file exists in Azure Blob Storage

    const fileInfo = await handler.GetFileInfo(testFilePath, "revision");

    assertEquals(
      fileInfo?.Path,
      testFilePath,
      "File path should match the request.",
    );
    assertEquals(
      fileInfo?.Contents instanceof ReadableStream,
      true,
      "Contents should be a ReadableStream.",
    );
  });

  await t.step(
    "GetFileInfo should return undefined for missing file",
    async () => {
      const missingFile = "missing_file.txt";

      const fileInfo = await handler.GetFileInfo(missingFile, "revision");

      assertEquals(
        fileInfo,
        undefined,
        "Should return undefined for non-existent files.",
      );
    },
  );

  await t.step("LoadAllPaths should return valid blob paths", async () => {
    const paths = await handler.LoadAllPaths("revision");

    console.log("Azure Blob Storage Resolved Paths:", paths);
    assertEquals(
      paths.length > 0,
      true,
      "Should retrieve at least one file path.",
    );
  });

  await t.step(
    "WriteFile/RemoveFile should successfully write/delete a file",
    async () => {
      const tempFile = "/temp_delete_test.txt";

      // Upload a temporary file first
      const uploadStream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("Temporary Data"));
          controller.close();
        },
      });

      await handler.WriteFile(tempFile, "revision", uploadStream);

      // Ensure it was uploaded
      const fileInfoBefore = await handler.GetFileInfo(tempFile, "revision");
      assertEquals(
        fileInfoBefore !== undefined,
        true,
        "File should exist before deletion.",
      );

      // Remove the file
      await handler.RemoveFile(tempFile, "revision");

      // Ensure it is gone
      const fileInfoAfter = await handler.GetFileInfo(tempFile, "revision");
      assertEquals(
        fileInfoAfter,
        undefined,
        "File should not exist after deletion.",
      );
    },
  );

  await t.step(
    "Valid file paths should always be formatted correctly",
    async () => {
      const paths = await handler.LoadAllPaths("revision");

      for (const filePath of paths) {
        assertEquals(
          filePath.startsWith("/"),
          true,
          `File path should not start with '/', but got: ${filePath}`,
        );
      }
    },
  );
});
