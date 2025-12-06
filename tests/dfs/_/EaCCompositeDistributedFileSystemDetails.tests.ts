import {
  EaCCompositeDistributedFileSystemDetails,
  isEaCCompositeDistributedFileSystemDetails,
  parseEaCCompositeDistributedFileSystemDetails,
} from "../../../src/dfs/_/EaCCompositeDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCCompositeDistributedFileSystemDetails Tests", async (t) => {
  const validCompositeDFS: EaCCompositeDistributedFileSystemDetails = {
    Type: "Composite",
    DFSLookups: ["local:app", "jsr:components"],
    Name: "Composite DFS",
    Description: "A composite DFS combining multiple sources.",
  };

  const validMinimalCompositeDFS: EaCCompositeDistributedFileSystemDetails = {
    Type: "Composite",
    DFSLookups: ["local:main"],
  };

  const validWithOptionsDFS: EaCCompositeDistributedFileSystemDetails = {
    Type: "Composite",
    DFSLookups: ["local:primary", "local:fallback", "esm:shared"],
    DefaultFile: "index.tsx",
    Extensions: ["tsx", "ts"],
    UseCascading: true,
  };

  const invalidCompositeDFSs = [
    42,
    null,
    "invalid",
    {
      Type: "RandomDFS",
      DFSLookups: ["local:test"],
    }, // Wrong type
    {
      Type: "Composite",
    }, // Missing DFSLookups (required field)
    {
      Type: "Composite",
      DFSLookups: [],
    }, // Empty DFSLookups (min 1 required)
    {
      Type: "Composite",
      DFSLookups: 123,
    }, // DFSLookups should be array of strings
    {
      Type: "Local",
      FileRoot: "/path",
    }, // Wrong type (Local not Composite)
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(
      isEaCCompositeDistributedFileSystemDetails(validCompositeDFS),
      true,
    );
    assertEquals(
      isEaCCompositeDistributedFileSystemDetails(validMinimalCompositeDFS),
      true,
    );
    assertEquals(
      isEaCCompositeDistributedFileSystemDetails(validWithOptionsDFS),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidCompositeDFSs) {
      assertEquals(
        isEaCCompositeDistributedFileSystemDetails(invalid),
        false,
      );
    }
  });

  await t.step(
    "parseEaCCompositeDistributedFileSystemDetails should return correct values for valid inputs",
    () => {
      assertEquals(
        parseEaCCompositeDistributedFileSystemDetails(validCompositeDFS),
        validCompositeDFS,
      );
      assertEquals(
        parseEaCCompositeDistributedFileSystemDetails(validMinimalCompositeDFS),
        validMinimalCompositeDFS,
      );
      assertEquals(
        parseEaCCompositeDistributedFileSystemDetails(validWithOptionsDFS),
        validWithOptionsDFS,
      );
    },
  );

  await t.step(
    "parseEaCCompositeDistributedFileSystemDetails should throw for invalid inputs",
    () => {
      for (const invalid of invalidCompositeDFSs) {
        assertThrows(() =>
          parseEaCCompositeDistributedFileSystemDetails(invalid)
        );
      }
    },
  );
});
