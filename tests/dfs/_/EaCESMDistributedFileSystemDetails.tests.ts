import {
  EaCESMDistributedFileSystemDetails,
  isEaCESMDistributedFileSystemDetails,
  parseEaCESMDistributedFileSystemDetails,
} from "../../../src/dfs/_/EaCESMDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCESMDistributedFileSystemDetails Tests", async (t) => {
  const validESMDFS: EaCESMDistributedFileSystemDetails = {
    Type: "ESM",
    EntryPoints: ["./index.js", "./main.js"],
    // IncludeDependencies: true,
    Root: "/esm-modules",
    Name: "ESM DFS",
    Description: "A DFS for ESM module resolution.",
  };

  const validMinimalESMDFS: EaCESMDistributedFileSystemDetails = {
    Type: "ESM",
    EntryPoints: ["./index.js"],
    Root: "/esm-modules",
  };

  const invalidESMDFSs = [
    42,
    null,
    "invalid",
    {
      Type: "RandomDFS",
      EntryPoints: ["./index.js"],
      Root: "/esm-modules",
    }, // Wrong type
    {
      EntryPoints: "./index.js",
      Type: "ESM",
      Root: "/esm-modules",
    }, // Wrong type (EntryPoints should be an array)
    { Root: 42, Type: "ESM", EntryPoints: ["./index.js"] }, // Wrong type
    {
      // IncludeDependencies: "not a boolean",
      Type: "ESM",
      EntryPoints: "not an array",
      Root: "/esm-modules",
    }, // Wrong type
    {
      Type: "ESM",
      EntryPoints: [],
      Root: "/esm-modules",
    }, // Invalid (EntryPoints should not be empty)
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCESMDistributedFileSystemDetails(validESMDFS), true);
    assertEquals(
      isEaCESMDistributedFileSystemDetails(validMinimalESMDFS),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidESMDFSs) {
      assertEquals(isEaCESMDistributedFileSystemDetails(invalid), false);
    }
  });

  await t.step(
    "parseEaCESMDistributedFileSystemDetails should return correct values for valid inputs",
    () => {
      assertEquals(
        parseEaCESMDistributedFileSystemDetails(validESMDFS),
        validESMDFS,
      );
      assertEquals(
        parseEaCESMDistributedFileSystemDetails(validMinimalESMDFS),
        validMinimalESMDFS,
      );
    },
  );

  await t.step(
    "parseEaCESMDistributedFileSystemDetails should throw for invalid inputs",
    () => {
      for (const invalid of invalidESMDFSs) {
        assertThrows(() => parseEaCESMDistributedFileSystemDetails(invalid));
      }
    },
  );
});
