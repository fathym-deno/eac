import { isEaCModuleActuator, parseEaCModuleActuator } from "../../src/eac/.exports.ts";
import { assertEquals, assertThrows } from "../test.deps.ts";
import { EaCModuleActuator } from "../../src/eac/EaCModuleActuator.ts";

Deno.test("EaCModuleActuator Tests", async (t) => {
  const eacModuleActuatorTest: EaCModuleActuator = {
    APIPath: "/test/api",
    Order: 1,
  };

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCModuleActuator(eacModuleActuatorTest), true);
    assertEquals(
      isEaCModuleActuator({ APIPath: "/another/api", Order: 2 }),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEaCModuleActuator(42), false);
    assertEquals(isEaCModuleActuator(null), false);
    assertEquals(isEaCModuleActuator("string"), false);
    assertEquals(isEaCModuleActuator({ APIPath: 123, Order: "first" }), false);
  });

  await t.step(
    "parseEaCModuleActuator should return correct values for valid inputs",
    () => {
      const parsed = parseEaCModuleActuator(eacModuleActuatorTest);
      assertEquals(parsed.APIPath, eacModuleActuatorTest.APIPath);
      assertEquals(parsed.Order, eacModuleActuatorTest.Order);
    },
  );

  await t.step("parseEaCModuleActuator should throw for invalid inputs", () => {
    assertThrows(() => parseEaCModuleActuator(42));
    assertThrows(() => parseEaCModuleActuator(null));
    assertThrows(() => parseEaCModuleActuator("string"));
    assertThrows(() => parseEaCModuleActuator({ APIPath: 123, Order: "first" }));
  });
});
