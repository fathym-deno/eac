import { isEaCVertexDetails, parseEaCVertexDetails } from "../../src/eac/.exports.ts";
import { assertEquals, assertThrows } from "../test.deps.ts";
import { EaCVertexDetails } from "../../src/eac/EaCVertexDetails.ts";

Deno.test("EaCVertexDetails Tests", async (t) => {
  const eacVertexDetailsTest: EaCVertexDetails = {
    Name: "Test Vertex",
    Description: "An example vertex for testing",
  };

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCVertexDetails(eacVertexDetailsTest), true);
    assertEquals(isEaCVertexDetails({}), true);
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEaCVertexDetails(42), false);
    assertEquals(isEaCVertexDetails(null), false);
    assertEquals(isEaCVertexDetails("string"), false);
  });

  await t.step(
    "parseEaCVertexDetails should return correct values for valid inputs",
    () => {
      const parsed = parseEaCVertexDetails(eacVertexDetailsTest);
      assertEquals(parsed.Name, eacVertexDetailsTest.Name);
      assertEquals(parsed.Description, eacVertexDetailsTest.Description);
      assertEquals(parseEaCVertexDetails({}), {});
    },
  );

  await t.step("parseEaCVertexDetails should throw for invalid inputs", () => {
    assertThrows(() => parseEaCVertexDetails(42));
    assertThrows(() => parseEaCVertexDetails(null));
    assertThrows(() => parseEaCVertexDetails("string"));
  });
});
