import { isEaCDistributedFileSystemAsCode, parseEaCDistributedFileSystemAsCode } from "../../../src/dfs/_/EaCDistributedFileSystemAsCode.ts";
import { EaCDistributedFileSystemDetails } from "../../../src/dfs/_/EaCDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCDistributedFileSystemAsCode Tests", async (t) => {
  const validDFSDetails: EaCDistributedFileSystemDetails = {
    Name: "Primary DFS",
    Type: "Test", // Type is required
  };

  const validDFSAsCode = { Details: validDFSDetails };
  const emptyDFSAsCode = {}; // This is valid as `Details` is optional
  const invalidDFSAsCode = { Details: "invalid" };
  const missingTypeDFSAsCode = { Details: {} }; // ❌ Invalid: Type is required

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCDistributedFileSystemAsCode(validDFSAsCode), true);
    assertEquals(isEaCDistributedFileSystemAsCode(emptyDFSAsCode), true); // Valid because Details is optional
  });

  await t.step("Invalid values should fail", () => {
    assertEquals(isEaCDistributedFileSystemAsCode(42), false);
    assertEquals(isEaCDistributedFileSystemAsCode(null), false);
    assertEquals(isEaCDistributedFileSystemAsCode("string"), false);
    assertEquals(isEaCDistributedFileSystemAsCode(invalidDFSAsCode), false);
    assertEquals(isEaCDistributedFileSystemAsCode(missingTypeDFSAsCode), false);
  });

  await t.step(
    "parseEaCDistributedFileSystemAsCode should return correct values for valid inputs",
    () => {
      assertEquals(
        parseEaCDistributedFileSystemAsCode(validDFSAsCode),
        validDFSAsCode,
      );
      assertEquals(
        parseEaCDistributedFileSystemAsCode(emptyDFSAsCode),
        emptyDFSAsCode,
      );
    },
  );

  await t.step(
    "parseEaCDistributedFileSystemAsCode should throw for invalid inputs",
    () => {
      assertThrows(() => parseEaCDistributedFileSystemAsCode(42));
      assertThrows(() => parseEaCDistributedFileSystemAsCode(null));
      assertThrows(() => parseEaCDistributedFileSystemAsCode("string"));
      assertThrows(() => parseEaCDistributedFileSystemAsCode(invalidDFSAsCode));
      assertThrows(() => parseEaCDistributedFileSystemAsCode(missingTypeDFSAsCode));
    },
  );
});
