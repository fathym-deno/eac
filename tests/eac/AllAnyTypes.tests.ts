import { isAllAnyType, parseAllAnyType } from "../../src/eac/.exports.ts";
import { assertEquals, assertThrows } from "../test.deps.ts";

Deno.test("AllAnyTypes Tests", async (t) => {
  await t.step("Valid values should pass", () => {
    assertEquals(isAllAnyType("All"), true);
    assertEquals(isAllAnyType("Any"), true);
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isAllAnyType("Invalid"), false);
    assertEquals(isAllAnyType(42), false);
    assertEquals(isAllAnyType(null), false);
  });

  await t.step(
    "parseAllAnyType should return correct values for valid inputs",
    () => {
      assertEquals(parseAllAnyType("All"), "All");
      assertEquals(parseAllAnyType("Any"), "Any");
    },
  );

  await t.step("parseAllAnyType should throw for invalid inputs", () => {
    assertThrows(() => parseAllAnyType("Invalid"));
    assertThrows(() => parseAllAnyType(42));
    assertThrows(() => parseAllAnyType(null));
  });
});
