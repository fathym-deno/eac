import { assertEquals, assertThrows } from "../test.deps.ts";
import { EaCDiff, isEaCDiff, parseEaCDiff } from "../../src/eac/EaCDiff.ts";

Deno.test("EaCDiff Tests", async (t) => {
  const eacDiffTest: EaCDiff = {
    SomeProperty: "Test Value",
  };

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCDiff(eacDiffTest), true);
    assertEquals(isEaCDiff({}), true);
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEaCDiff(42), false);
    assertEquals(isEaCDiff(null), false);
    assertEquals(isEaCDiff("string"), false);
  });

  await t.step(
    "parseEaCDiff should return correct values for valid inputs",
    () => {
      const parsed = parseEaCDiff(eacDiffTest);
      assertEquals(parsed.SomeProperty, eacDiffTest.SomeProperty);
      assertEquals(parsed, eacDiffTest);
      assertEquals(parseEaCDiff({}), {});
    },
  );

  await t.step("parseEaCDiff should throw for invalid inputs", () => {
    assertThrows(() => parseEaCDiff(42));
    assertThrows(() => parseEaCDiff(null));
    assertThrows(() => parseEaCDiff("string"));
  });
});
