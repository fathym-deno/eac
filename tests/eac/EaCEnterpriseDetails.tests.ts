import {
  isEaCEnterpriseDetails,
  parseEaCEnterpriseDetails,
} from "../../src/eac/.exports.ts";
import { assertEquals, assertThrows } from "../test.deps.ts";
import { EaCEnterpriseDetails } from "../../src/eac/EaCEnterpriseDetails.ts";

Deno.test("EaCEnterpriseDetails Tests", async (t) => {
  const eacEnterpriseTest: EaCEnterpriseDetails = {
    Name: "Test Enterprise",
    Description: "An example enterprise for testing",
  };

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCEnterpriseDetails(eacEnterpriseTest), true);
    assertEquals(isEaCEnterpriseDetails({}), true);
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEaCEnterpriseDetails(42), false);
    assertEquals(isEaCEnterpriseDetails(null), false);
    assertEquals(isEaCEnterpriseDetails("string"), false);
  });

  await t.step(
    "parseEaCEnterpriseDetails should return correct values for valid inputs",
    () => {
      const parsed = parseEaCEnterpriseDetails(eacEnterpriseTest);
      assertEquals(parsed.Name, eacEnterpriseTest.Name);
      assertEquals(parsed.Description, eacEnterpriseTest.Description);
      assertEquals(parseEaCEnterpriseDetails({}), {});
    },
  );

  await t.step(
    "parseEaCEnterpriseDetails should throw for invalid inputs",
    () => {
      assertThrows(() => parseEaCEnterpriseDetails(42));
      assertThrows(() => parseEaCEnterpriseDetails(null));
      assertThrows(() => parseEaCEnterpriseDetails("string"));
    },
  );
});
