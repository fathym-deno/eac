import { isEaCMetadataBase, parseEaCMetadataBase } from "../../src/eac/.exports.ts";
import { assertEquals, assertThrows } from "../test.deps.ts";

Deno.test("EaCMetadataBase Tests", async (t) => {
  await t.step("Valid values should pass", () => {
    assertEquals(isEaCMetadataBase({ key: "value" }), true);
    assertEquals(isEaCMetadataBase({ 42: "numberKey" }), true);
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEaCMetadataBase(42), false);
    assertEquals(isEaCMetadataBase(null), false);
    assertEquals(isEaCMetadataBase("string"), false);
    assertEquals(isEaCMetadataBase(undefined), false);
  });

  await t.step(
    "parseEaCMetadataBase should return correct values for valid inputs",
    () => {
      assertEquals(parseEaCMetadataBase({ key: "value" }).key, "value");
    },
  );

  await t.step("parseEaCMetadataBase should throw for invalid inputs", () => {
    assertThrows(() => parseEaCMetadataBase(42));
    assertThrows(() => parseEaCMetadataBase(null));
    assertThrows(() => parseEaCMetadataBase("string"));
    assertThrows(() => parseEaCMetadataBase(undefined));
  });
});
