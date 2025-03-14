import { EaCDistributedFileSystemAsCode } from "../../../src/dfs/_/EaCDistributedFileSystemAsCode.ts";
import {
  isEverythingAsCodeDFS,
  parseEverythingAsCodeDFS,
} from "../../../src/dfs/_/EverythingAsCodeDFS.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EverythingAsCodeDFS Tests", async (t) => {
  const validDFS: Record<string, EaCDistributedFileSystemAsCode> = {
    "dfs-1": { Name: "Primary DFS", Path: "/primary" },
    "dfs-2": { Name: "Backup DFS", Path: "/backup" },
  };

  const validEACDFS = { DFSs: validDFS };
  const validWithGlobalOptions = {
    $GlobalOptions: {
      DFSs: {
        PreventWorkers: true,
      },
    },
    DFSs: validDFS,
  };

  const emptyEACDFS = { DFSs: {} };
  const onlyGlobalOptions = {
    $GlobalOptions: {
      DFSs: {
        PreventWorkers: false,
      },
    },
  };

  const invalidEACDFS = { DFSs: "invalid" };

  await t.step("Valid values should pass", () => {
    assertEquals(isEverythingAsCodeDFS(validEACDFS), true);
    assertEquals(isEverythingAsCodeDFS(validWithGlobalOptions), true);
    assertEquals(isEverythingAsCodeDFS(emptyEACDFS), true);
    assertEquals(isEverythingAsCodeDFS(onlyGlobalOptions), true);
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEverythingAsCodeDFS(42), false);
    assertEquals(isEverythingAsCodeDFS(null), false);
    assertEquals(isEverythingAsCodeDFS("string"), false);
    assertEquals(isEverythingAsCodeDFS(invalidEACDFS), false);
  });

  await t.step(
    "parseEverythingAsCodeDFS should return correct values for valid inputs",
    () => {
      assertEquals(parseEverythingAsCodeDFS(validEACDFS), validEACDFS);
      assertEquals(
        parseEverythingAsCodeDFS(validWithGlobalOptions),
        validWithGlobalOptions,
      );
      assertEquals(parseEverythingAsCodeDFS(emptyEACDFS), emptyEACDFS);
      assertEquals(
        parseEverythingAsCodeDFS(onlyGlobalOptions),
        onlyGlobalOptions,
      );
    },
  );

  await t.step(
    "parseEverythingAsCodeDFS should throw for invalid inputs",
    () => {
      assertThrows(() => parseEverythingAsCodeDFS(42));
      assertThrows(() => parseEverythingAsCodeDFS(null));
      assertThrows(() => parseEverythingAsCodeDFS("string"));
      assertThrows(() => parseEverythingAsCodeDFS(invalidEACDFS));
    },
  );
});
