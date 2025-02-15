import {
  isDistributedFileSystemOptions,
  parseDistributedFileSystemOptions,
} from "../../../src/dfs/_/DistributedFileSystemOptions.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("DistributedFileSystemOptions Tests", async (t) => {
  const validOptionsWithWorkersDisabled = {
    PreventWorkers: true,
  };

  const validOptionsDefault = {};

  const invalidOptions = [
    42,
    null,
    "invalid",
    { PreventWorkers: "yes" }, // Wrong type
    { PreventWorkers: 123 }, // Wrong type
    { PreventWorkers: {} }, // Wrong type
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(
      isDistributedFileSystemOptions(validOptionsWithWorkersDisabled),
      true,
    );
    assertEquals(isDistributedFileSystemOptions(validOptionsDefault), true);
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidOptions) {
      assertEquals(isDistributedFileSystemOptions(invalid), false);
    }
  });

  await t.step(
    "parseDistributedFileSystemOptions should return correct values for valid inputs",
    () => {
      assertEquals(
        parseDistributedFileSystemOptions(validOptionsWithWorkersDisabled),
        validOptionsWithWorkersDisabled,
      );
      assertEquals(
        parseDistributedFileSystemOptions(validOptionsDefault),
        validOptionsDefault,
      );
    },
  );

  await t.step(
    "parseDistributedFileSystemOptions should throw for invalid inputs",
    () => {
      for (const invalid of invalidOptions) {
        assertThrows(() => parseDistributedFileSystemOptions(invalid));
      }
    },
  );
});
