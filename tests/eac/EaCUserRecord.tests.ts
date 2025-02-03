import { isEaCUserRecord, parseEaCUserRecord } from "../../src/eac/.exports.ts";
import { assertEquals, assertThrows } from "../test.deps.ts";
import { EaCUserRecord } from "../../src/eac/EaCUserRecord.ts";

Deno.test("EaCUserRecord Tests", async (t) => {
  const eacUserRecordTest: EaCUserRecord = {
    EnterpriseLookup: "enterprise-123",
    EnterpriseName: "Test Enterprise",
    Owner: true,
    ParentEnterpriseLookup: "parent-enterprise-456",
    Username: "testuser",
  };

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCUserRecord(eacUserRecordTest), true);
    assertEquals(
      isEaCUserRecord({
        EnterpriseLookup: "enterprise-789",
        EnterpriseName: "Another Enterprise",
        Owner: false,
        ParentEnterpriseLookup: "parent-enterprise-999",
        Username: "anotheruser",
      }),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEaCUserRecord(42), false);
    assertEquals(isEaCUserRecord(null), false);
    assertEquals(isEaCUserRecord("string"), false);
    assertEquals(isEaCUserRecord({ Username: "missing-fields" }), false);
  });

  await t.step(
    "parseEaCUserRecord should return correct values for valid inputs",
    () => {
      const parsed = parseEaCUserRecord(eacUserRecordTest);
      assertEquals(parsed.EnterpriseLookup, eacUserRecordTest.EnterpriseLookup);
      assertEquals(parsed.Username, eacUserRecordTest.Username);
    },
  );

  await t.step("parseEaCUserRecord should throw for invalid inputs", () => {
    assertThrows(() => parseEaCUserRecord(42));
    assertThrows(() => parseEaCUserRecord(null));
    assertThrows(() => parseEaCUserRecord("string"));
    assertThrows(() => parseEaCUserRecord({ Username: "missing-fields" }));
  });
});
