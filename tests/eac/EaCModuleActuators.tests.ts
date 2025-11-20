import { isEaCModuleActuators, parseEaCModuleActuators } from "../../src/eac/.exports.ts";
import { assertEquals, assertThrows } from "../test.deps.ts";
import { EaCModuleActuators } from "../../src/eac/EaCModuleActuators.ts";

Deno.test("EaCModuleActuators Tests", async (t) => {
  const eacModuleActuatorsTest: EaCModuleActuators = {
    ActuatorOne: { APIPath: "/test/api", Order: 1 },
    ActuatorTwo: { APIPath: "/another/api", Order: 2 },
  };
  eacModuleActuatorsTest.$Force = true;

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCModuleActuators(eacModuleActuatorsTest), true);
    assertEquals(isEaCModuleActuators({ $Force: false }), true);
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEaCModuleActuators(42), false);
    assertEquals(isEaCModuleActuators(null), false);
    assertEquals(isEaCModuleActuators("string"), false);
    assertEquals(isEaCModuleActuators({ $Force: "yes" }), false);
  });

  await t.step(
    "parseEaCModuleActuators should return correct values for valid inputs",
    () => {
      const parsed = parseEaCModuleActuators(eacModuleActuatorsTest);
      assertEquals(parsed.$Force, eacModuleActuatorsTest.$Force);
      assertEquals(
        parsed.ActuatorOne.APIPath,
        eacModuleActuatorsTest.ActuatorOne.APIPath,
      );
      assertEquals(
        parsed.ActuatorTwo.Order,
        eacModuleActuatorsTest.ActuatorTwo.Order,
      );
    },
  );

  await t.step(
    "parseEaCModuleActuators should throw for invalid inputs",
    () => {
      assertThrows(() => parseEaCModuleActuators(42));
      assertThrows(() => parseEaCModuleActuators(null));
      assertThrows(() => parseEaCModuleActuators("string"));
      assertThrows(() => parseEaCModuleActuators({ $Force: "yes" }));
    },
  );
});
