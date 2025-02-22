import { EaCESMDistributedFileSystemDetails } from "../../../src/dfs/handlers/.deps.ts";
import { ESMFetchDFSFileHandler } from "../../../src/dfs/handlers/.exports.ts";
import { assertEquals, assertRejects, assertThrows } from "../../test.deps.ts";

/**
 * Test Suite for ESMFetchDFSFileHandler
 */
Deno.test("ESMFetchDFSFileHandler Tests", async (t) => {
  // ✅ Use a real ESM package from Skypack CDN
  const packageURL = "https://cdn.skypack.dev/lodash-es@4.17.21/";
  const entryPoints = ["lodash.js"]; // Lodash ES entry point

  const handlerWithDeps = new ESMFetchDFSFileHandler("test", {
    Details: {
      Type: "ESM",
      EntryPoints: entryPoints,
      Root: packageURL,
      IncludeDependencies: true,
    } as EaCESMDistributedFileSystemDetails,
  });
  const handlerWithoutDeps = new ESMFetchDFSFileHandler("test", {
    Details: {
      Type: "ESM",
      EntryPoints: entryPoints,
      Root: packageURL,
      IncludeDependencies: false,
    } as EaCESMDistributedFileSystemDetails,
  });

  await t.step(
    "LoadAllPaths should resolve entry points only (excluding dependencies)",
    async () => {
      const paths = await handlerWithoutDeps.LoadAllPaths("revision");

      console.log("Resolved Paths without Dependencies:", paths);
      assertEquals(paths.length, 1, "Should only return entry points.");
      assertEquals(paths[0], `/${entryPoints[0]}`);
    },
  );

  await t.step(
    "LoadAllPaths should correctly resolve import maps (if applicable)",
    async () => {
      const handlerWithImportMaps = new ESMFetchDFSFileHandler("test", {
        Details: {
          Type: "ESM",
          EntryPoints: ["lodash-es@4.17.21/lodash.js"],
          Root: "https://cdn.skypack.dev/",
        } as EaCESMDistributedFileSystemDetails,
      });

      const paths = await handlerWithImportMaps.LoadAllPaths("revision");

      console.log("Resolved Paths with Import Maps:", paths);
      assertEquals(
        paths.some((p) => p.includes("lodash")),
        true,
      );
    },
  );

  await t.step(
    "LoadAllPaths should correctly resolve local file URLs",
    async () => {
      const localHandler = new ESMFetchDFSFileHandler("test", {
        Details: {
          Type: "ESM",
          EntryPoints: ["mod.ts"],
          Root: "file:///",
          IncludeDependencies: false,
        } as EaCESMDistributedFileSystemDetails,
      });
      const paths = await localHandler.LoadAllPaths("revision");

      console.log("Resolved Local Paths:", paths);
      assertEquals(paths.length, 1);
      assertEquals(paths[0], "/mod.ts");
    },
  );

  await t.step(
    "ESMFetchDFSFileHandler should throw an error when entry points are empty",
    async () => {
      await assertThrows(
        () =>
          new ESMFetchDFSFileHandler("test", {
            Details: {
              Type: "ESM",
              EntryPoints: [],
              Root: packageURL,
            } as EaCESMDistributedFileSystemDetails,
          }),
        Error,
        "No entry points provided",
      );
    },
  );

  // ✅ Fetch-Based Tests in ESM Context
  const validFilePath = "/lodash.js"; // Lodash entry module
  const missingFilePath = "/missing.js"; // Non-existent file

  await t.step(
    "GetFileInfo should return valid file info (ESM Module)",
    async () => {
      const fileInfo = await handlerWithDeps.GetFileInfo(
        validFilePath,
        "revision",
      );
      assertEquals(fileInfo?.Path, validFilePath);
      assertEquals(fileInfo?.Contents instanceof ReadableStream, true);
    },
  );

  await t.step(
    "GetFileInfo should return undefined for missing ESM file",
    async () => {
      const fileInfo = await handlerWithDeps.GetFileInfo(
        missingFilePath,
        "revision",
      );
      assertEquals(fileInfo, undefined);
    },
  );

  await t.step(
    "LoadAllPaths should return valid ESM module paths",
    async () => {
      const paths = await handlerWithDeps.LoadAllPaths("revision");
      assertEquals(
        paths.length > 0,
        true,
        "Expected resolved ESM module paths.",
      );
    },
  );

  await t.step("RemoveFile should throw NotSupported error", async () => {
    await assertRejects(
      () => handlerWithDeps.RemoveFile(validFilePath, "revision"),
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
      () => handlerWithDeps.WriteFile(validFilePath, "revision", stream),
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
