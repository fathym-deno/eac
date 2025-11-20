import { EaCNPMDistributedFileSystemDetails, isEaCNPMDistributedFileSystemDetails, parseEaCNPMDistributedFileSystemDetails } from "../../../src/dfs/_/EaCNPMDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCNPMDistributedFileSystemDetails Tests", async (t) => {
  const validNPMDFS: EaCNPMDistributedFileSystemDetails = {
    Type: "NPM",
    Package: "express",
    Version: "4.17.1",
    Name: "Express NPM DFS",
    Description: "A DFS for managing Express package files.",
  };

  const validMinimalNPMDFS: EaCNPMDistributedFileSystemDetails = {
    Type: "NPM",
    Package: "lodash",
    Version: "latest",
  };

  const invalidNPMDFSs = [
    42,
    null,
    "invalid",
    {
      Type: "RandomDFS",
      Package: "react",
      Version: "18.0.0",
    }, // Wrong Type
    {
      Package: "express",
      Type: "NPM",
    }, // Missing Version
    {
      Version: "4.17.1",
      Type: "NPM",
    }, // Missing Package
    {
      Type: "NPM",
      Package: 123,
      Version: "4.17.1",
    }, // Package should be a string
    {
      Type: "NPM",
      Package: "express",
      Version: 123,
    }, // Version should be a string
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCNPMDistributedFileSystemDetails(validNPMDFS), true);
    assertEquals(
      isEaCNPMDistributedFileSystemDetails(validMinimalNPMDFS),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidNPMDFSs) {
      assertEquals(isEaCNPMDistributedFileSystemDetails(invalid), false);
    }
  });

  await t.step(
    "parseEaCNPMDistributedFileSystemDetails should return correct values for valid inputs",
    () => {
      assertEquals(
        parseEaCNPMDistributedFileSystemDetails(validNPMDFS),
        validNPMDFS,
      );
      assertEquals(
        parseEaCNPMDistributedFileSystemDetails(validMinimalNPMDFS),
        validMinimalNPMDFS,
      );
    },
  );

  await t.step(
    "parseEaCNPMDistributedFileSystemDetails should throw for invalid inputs",
    () => {
      for (const invalid of invalidNPMDFSs) {
        assertThrows(() => parseEaCNPMDistributedFileSystemDetails(invalid));
      }
    },
  );
});
