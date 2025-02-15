import {
  EaCLocalDistributedFileSystemDetails,
  isEaCLocalDistributedFileSystemDetails,
  parseEaCLocalDistributedFileSystemDetails,
} from "../../../src/dfs/_/EaCLocalDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCLocalDistributedFileSystemDetails Tests", async (t) => {
  const validLocalDFS: EaCLocalDistributedFileSystemDetails = {
    Type: "Local",
    FileRoot: "/local-storage",
    Name: "Local DFS",
    Description: "A DFS for local file system storage.",
  };

  const validMinimalLocalDFS: EaCLocalDistributedFileSystemDetails = {
    Type: "Local",
    FileRoot: "/local-storage",
  };

  const invalidLocalDFSs = [
    42,
    null,
    "invalid",
    {
      Type: "RandomDFS",
      FileRoot: "/local-storage",
    }, // Wrong type
    {
      FileRoot: 123,
      Type: "Local",
    }, // FileRoot should be a string
    { Type: "Local" }, // Missing FileRoot (required field)
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCLocalDistributedFileSystemDetails(validLocalDFS), true);
    assertEquals(
      isEaCLocalDistributedFileSystemDetails(validMinimalLocalDFS),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidLocalDFSs) {
      assertEquals(isEaCLocalDistributedFileSystemDetails(invalid), false);
    }
  });

  await t.step(
    "parseEaCLocalDistributedFileSystemDetails should return correct values for valid inputs",
    () => {
      assertEquals(
        parseEaCLocalDistributedFileSystemDetails(validLocalDFS),
        validLocalDFS,
      );
      assertEquals(
        parseEaCLocalDistributedFileSystemDetails(validMinimalLocalDFS),
        validMinimalLocalDFS,
      );
    },
  );

  await t.step(
    "parseEaCLocalDistributedFileSystemDetails should throw for invalid inputs",
    () => {
      for (const invalid of invalidLocalDFSs) {
        assertThrows(() => parseEaCLocalDistributedFileSystemDetails(invalid));
      }
    },
  );
});
