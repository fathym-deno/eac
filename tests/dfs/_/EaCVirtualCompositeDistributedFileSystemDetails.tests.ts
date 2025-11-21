import {
  EaCVirtualCompositeDistributedFileSystemDetails,
  isEaCVirtualCompositeDistributedFileSystemDetails,
  parseEaCVirtualCompositeDistributedFileSystemDetails,
} from "../../../src/dfs/_/EaCVirtualCompositeDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

const validVirtual: EaCVirtualCompositeDistributedFileSystemDetails = {
  Type: "VirtualComposite",
  BaseDFSLookups: ["primary", "secondary"],
  Name: "Virtual Overlay",
  Description: "Virtual DFS overlay targeting multiple base DFSs.",
};

const minimalVirtual: EaCVirtualCompositeDistributedFileSystemDetails = {
  Type: "VirtualComposite",
  BaseDFSLookups: ["primary"],
};

const invalidVirtuals = [
  undefined,
  null,
  "virtual",
  {},
  {
    Type: "VirtualComposite",
  },
  {
    Type: "VirtualComposite",
    BaseDFSLookups: [],
  },
  {
    Type: "Local",
    BaseDFSLookups: ["primary"],
  },
];

Deno.test(
  "EaCVirtualCompositeDistributedFileSystemDetails schema guards",
  async (t) => {
    await t.step("Valid definitions pass guard", () => {
      assertEquals(
        isEaCVirtualCompositeDistributedFileSystemDetails(validVirtual),
        true,
      );
      assertEquals(
        isEaCVirtualCompositeDistributedFileSystemDetails(minimalVirtual),
        true,
      );
    });

    await t.step("Invalid definitions fail guard", () => {
      for (const invalid of invalidVirtuals) {
        assertEquals(
          isEaCVirtualCompositeDistributedFileSystemDetails(
            invalid,
          ),
          false,
        );
      }
    });

    await t.step("Parser returns values for valid inputs", () => {
      const parsedFull = parseEaCVirtualCompositeDistributedFileSystemDetails(
        validVirtual,
      );
      const parsedMinimal =
        parseEaCVirtualCompositeDistributedFileSystemDetails(minimalVirtual);

      assertEquals(parsedFull, structuredClone(validVirtual));
      assertEquals(parsedMinimal, structuredClone(minimalVirtual));
    });

    await t.step("Parser throws for invalid inputs", () => {
      for (const invalid of invalidVirtuals) {
        assertThrows(() =>
          parseEaCVirtualCompositeDistributedFileSystemDetails(
            invalid,
          )
        );
      }
    });
  },
);
