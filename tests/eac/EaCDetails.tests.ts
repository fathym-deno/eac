import {
  EaCVertexDetails,
  isEaCDetails,
  parseEaCDetails,
} from "../../src/eac/.exports.ts";
import { assertEquals, assertThrows } from "../test.deps.ts";
import { EaCDetails } from "../../src/eac/EaCDetails.ts";

Deno.test("EaCDetails Tests", async (t) => {
  const eacTest: EaCDetails<EaCVertexDetails> = {
    Details: { Name: "Test Vertex" },
  };

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCDetails(eacTest), true);
    assertEquals(isEaCDetails({}), true);
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEaCDetails(42), false);
    assertEquals(isEaCDetails(null), false);
    assertEquals(isEaCDetails("string"), false);
  });

  await t.step(
    "parseEaCDetails should return correct values for valid inputs",
    () => {
      assertEquals(
        parseEaCDetails(eacTest).Details?.Name,
        eacTest.Details?.Name,
      );
      assertEquals(parseEaCDetails({}), {});
    },
  );

  await t.step("parseEaCDetails should throw for invalid inputs", () => {
    assertThrows(() => parseEaCDetails(42));
    assertThrows(() => parseEaCDetails(null));
    assertThrows(() => parseEaCDetails("string"));
  });
});
