import {
  isEaCDistributedFileSystemDetails,
  parseEaCDistributedFileSystemDetails,
} from "../../../src/dfs/_/EaCDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCDistributedFileSystemDetails Tests", async (t) => {
  const validDFS = {
    CacheDBLookup: "cache-db-1",
    CacheSeconds: 3600,
    DefaultFile: "index.html",
    Extensions: [".html", ".css", ".js"],
    Type: "static",
    UseCascading: true,
    WorkerPath: "/worker/path",
    Name: "Primary DFS",
    Description: "DFS for static files",
  };

  const validDFSMinimal = {
    Type: "dynamic",
  };

  const invalidDFSs = [
    42,
    null,
    "invalid",
    { Type: 123 }, // Wrong type
    { CacheSeconds: "one hour" }, // Wrong type
    { Extensions: [42] }, // Wrong type inside array
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCDistributedFileSystemDetails("static", validDFS), true);
    assertEquals(
      isEaCDistributedFileSystemDetails("dynamic", validDFSMinimal),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidDFSs) {
      assertEquals(isEaCDistributedFileSystemDetails("static", invalid), false);
    }
  });

  await t.step("Type-specific validation should work", () => {
    assertEquals(isEaCDistributedFileSystemDetails("static", validDFS), true);
    assertEquals(isEaCDistributedFileSystemDetails("dynamic", validDFS), false);
  });

  await t.step(
    "parseEaCDistributedFileSystemDetails should return correct values for valid inputs",
    () => {
      assertEquals(parseEaCDistributedFileSystemDetails(validDFS), validDFS);
      assertEquals(
        parseEaCDistributedFileSystemDetails(validDFSMinimal),
        validDFSMinimal,
      );
    },
  );

  await t.step(
    "parseEaCDistributedFileSystemDetails should throw for invalid inputs",
    () => {
      for (const invalid of invalidDFSs) {
        assertThrows(() => parseEaCDistributedFileSystemDetails(invalid));
      }
    },
  );
});
