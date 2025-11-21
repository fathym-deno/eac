import {
  isEverythingAsCode,
  parseEverythingAsCode,
} from "../../src/eac/.exports.ts";
import { assertEquals, assertThrows } from "../test.deps.ts";
import { EverythingAsCode } from "../../src/eac/EverythingAsCode.ts";

Deno.test("EverythingAsCode Tests", async (t) => {
  const everythingAsCodeTest: EverythingAsCode = {
    EnterpriseLookup: "enterprise-123",
    ParentEnterpriseLookup: "parent-enterprise-456",
    Actuators: {
      ModuleOne: { APIPath: "/api/module1", Order: 1 },
    },
    Details: {
      Name: "Test Enterprise",
      Description: "An example enterprise for testing",
    },
  };
  everythingAsCodeTest.Actuators!.$Force = true;

  await t.step("Valid values should pass", () => {
    assertEquals(isEverythingAsCode(everythingAsCodeTest), true);
    assertEquals(isEverythingAsCode({}), true);
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEverythingAsCode(42), false);
    assertEquals(isEverythingAsCode(null), false);
    assertEquals(isEverythingAsCode("string"), false);
  });

  await t.step(
    "parseEverythingAsCode should return correct values for valid inputs",
    () => {
      const parsed = parseEverythingAsCode(everythingAsCodeTest);
      assertEquals(
        parsed.EnterpriseLookup,
        everythingAsCodeTest.EnterpriseLookup,
      );
      assertEquals(
        parsed.ParentEnterpriseLookup,
        everythingAsCodeTest.ParentEnterpriseLookup,
      );
      assertEquals(
        parsed.Actuators?.$Force,
        everythingAsCodeTest.Actuators?.$Force,
      );
      assertEquals(parsed.Details?.Name, everythingAsCodeTest.Details?.Name);
    },
  );

  await t.step("parseEverythingAsCode should throw for invalid inputs", () => {
    assertThrows(() => parseEverythingAsCode(42));
    assertThrows(() => parseEverythingAsCode(null));
    assertThrows(() => parseEverythingAsCode("string"));
  });
});
