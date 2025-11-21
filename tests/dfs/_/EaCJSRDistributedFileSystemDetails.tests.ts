import {
  EaCJSRDistributedFileSystemDetails,
  isEaCJSRDistributedFileSystemDetails,
  parseEaCJSRDistributedFileSystemDetails,
} from "../../../src/dfs/_/EaCJSRDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCJSRDistributedFileSystemDetails Tests", async (t) => {
  const validJSRDFS: EaCJSRDistributedFileSystemDetails = {
    Type: "JSR",
    Package: "some-package",
    Version: "1.2.3",
    FileRoot: "/jsr-storage",
    Name: "JSR DFS",
    Description: "A DFS for JSR packages.",
  };

  const validMinimalJSRDFS: EaCJSRDistributedFileSystemDetails = {
    Type: "JSR",
    Package: "some-package",
  };

  const invalidJSRDFSs = [
    42,
    null,
    "invalid",
    {
      Type: "RandomDFS",
      Package: "some-package",
      FileRoot: "/jsr-storage",
    }, // Wrong type
    {
      Package: 123,
      Type: "JSR",
      FileRoot: "/jsr-storage",
    }, // Package should be a string
    { Type: "JSR", FileRoot: "/jsr-storage" }, // Missing Package (required field)
    {
      Type: "JSR",
      Package: "some-package",
      Version: 1.2, // Wrong type (should be string)
    },
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCJSRDistributedFileSystemDetails(validJSRDFS), true);
    assertEquals(
      isEaCJSRDistributedFileSystemDetails(validMinimalJSRDFS),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidJSRDFSs) {
      assertEquals(isEaCJSRDistributedFileSystemDetails(invalid), false);
    }
  });

  await t.step(
    "parseEaCJSRDistributedFileSystemDetails should return correct values for valid inputs",
    () => {
      assertEquals(
        parseEaCJSRDistributedFileSystemDetails(validJSRDFS),
        validJSRDFS,
      );
      assertEquals(
        parseEaCJSRDistributedFileSystemDetails(validMinimalJSRDFS),
        validMinimalJSRDFS,
      );
    },
  );

  await t.step(
    "parseEaCJSRDistributedFileSystemDetails should throw for invalid inputs",
    () => {
      for (const invalid of invalidJSRDFSs) {
        assertThrows(() => parseEaCJSRDistributedFileSystemDetails(invalid));
      }
    },
  );
});
