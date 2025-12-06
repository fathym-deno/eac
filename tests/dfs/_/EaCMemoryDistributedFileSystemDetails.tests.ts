import {
  EaCMemoryDistributedFileSystemDetails,
  isEaCMemoryDistributedFileSystemDetails,
  parseEaCMemoryDistributedFileSystemDetails,
} from "../../../src/dfs/_/EaCMemoryDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCMemoryDistributedFileSystemDetails Tests", async (t) => {
  const validMemoryDFS: EaCMemoryDistributedFileSystemDetails = {
    Type: "Memory",
    Name: "Memory DFS",
    Description: "A DFS for in-memory file storage.",
  };

  const validMinimalMemoryDFS: EaCMemoryDistributedFileSystemDetails = {
    Type: "Memory",
  };

  const validWithOptionsDFS: EaCMemoryDistributedFileSystemDetails = {
    Type: "Memory",
    DefaultFile: "index.tsx",
    Extensions: ["tsx", "ts"],
    UseCascading: true,
  };

  const invalidMemoryDFSs = [
    42,
    null,
    "invalid",
    {
      Type: "RandomDFS",
    }, // Wrong type
    {
      Type: "Local",
      FileRoot: "/path",
    }, // Wrong type (Local not Memory)
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCMemoryDistributedFileSystemDetails(validMemoryDFS), true);
    assertEquals(
      isEaCMemoryDistributedFileSystemDetails(validMinimalMemoryDFS),
      true,
    );
    assertEquals(
      isEaCMemoryDistributedFileSystemDetails(validWithOptionsDFS),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidMemoryDFSs) {
      assertEquals(isEaCMemoryDistributedFileSystemDetails(invalid), false);
    }
  });

  await t.step(
    "parseEaCMemoryDistributedFileSystemDetails should return correct values for valid inputs",
    () => {
      assertEquals(
        parseEaCMemoryDistributedFileSystemDetails(validMemoryDFS),
        validMemoryDFS,
      );
      assertEquals(
        parseEaCMemoryDistributedFileSystemDetails(validMinimalMemoryDFS),
        validMinimalMemoryDFS,
      );
      assertEquals(
        parseEaCMemoryDistributedFileSystemDetails(validWithOptionsDFS),
        validWithOptionsDFS,
      );
    },
  );

  await t.step(
    "parseEaCMemoryDistributedFileSystemDetails should throw for invalid inputs",
    () => {
      for (const invalid of invalidMemoryDFSs) {
        assertThrows(() => parseEaCMemoryDistributedFileSystemDetails(invalid));
      }
    },
  );
});
