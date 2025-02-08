import { isEaCAPIJWTPayload, parseEaCAPIJWTPayload } from "../../../src/eac/.exports.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCAPIJWTPayload Tests", async (t) => {
  const validPayload: Record<string, unknown> = {
    EnterpriseLookup: "enterprise-123",
    JWT: "valid.jwt.token",
    Username: "testUser",
    additionalKey: "extraData",
  };

  const minimalValidPayload: Record<string, unknown> = {
    EnterpriseLookup: "enterprise-123",
  };

  const invalidPayloads = [
    42,
    null,
    "invalid",
    { EnterpriseLookup: 123 }, // Wrong type
    { JWT: 456 }, // Wrong type
    { Username: true }, // Wrong type
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCAPIJWTPayload(validPayload), true);
    assertEquals(isEaCAPIJWTPayload(minimalValidPayload), true);
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidPayloads) {
      assertEquals(isEaCAPIJWTPayload(invalid), false);
    }
  });

  await t.step("parseEaCAPIJWTPayload should return correct values for valid inputs", () => {
    assertEquals(parseEaCAPIJWTPayload(validPayload), validPayload);
    assertEquals(parseEaCAPIJWTPayload(minimalValidPayload), minimalValidPayload);
  });

  await t.step("parseEaCAPIJWTPayload should throw for invalid inputs", () => {
    for (const invalid of invalidPayloads) {
      assertThrows(() => parseEaCAPIJWTPayload(invalid));
    }
  });
});
