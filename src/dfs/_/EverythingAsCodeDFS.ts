import { z } from "./.deps.ts";
import { EaCDistributedFileSystemAsCode, EaCDistributedFileSystemAsCodeSchema } from "./EaCDistributedFileSystemAsCode.ts";

/**
 * Represents the Everything as Code (EaC) Distributed File System (DFS) structure.
 *
 * This type contains a record mapping unique keys to `EaCDistributedFileSystemAsCode` objects.
 */
export type EverythingAsCodeDFS = {
  /** A collection of Distributed File Systems (DFS) mapped by unique keys. */
  DFSs?: Record<string, EaCDistributedFileSystemAsCode>;
};

/**
 * Schema for `EverythingAsCodeDFS`.
 * Validates that `DFSs` is an object where each key maps to a valid `EaCDistributedFileSystemAsCode` instance.
 */
export const EverythingAsCodeDFSSchema = z
  .object({
    DFSs: z
      .record(z.string(), EaCDistributedFileSystemAsCodeSchema)
      .optional()
      .describe(
        "A collection of Distributed File Systems (DFSs) mapped by unique keys."
      ),
  })
  .describe(
    "Schema for EverythingAsCodeDFS, validating its structure with an optional record of DFS mappings."
  );

/**
 * Type guard for `EverythingAsCodeDFS`.
 * Validates if the given object conforms to the `EverythingAsCodeDFS` structure.
 *
 * @param eac - The object to validate.
 * @returns True if the object is a valid `EverythingAsCodeDFS`, false otherwise.
 */
export function isEverythingAsCodeDFS(eac: unknown): eac is EverythingAsCodeDFS {
  return EverythingAsCodeDFSSchema.safeParse(eac).success;
}

/**
 * Validates and parses an object as `EverythingAsCodeDFS`.
 *
 * @param eac - The object to validate and parse.
 * @throws If the object does not conform to the `EverythingAsCodeDFSSchema`.
 * @returns The parsed `EverythingAsCodeDFS` object.
 */
export function parseEverythingAsCodeDFS(eac: unknown): EverythingAsCodeDFS {
  return EverythingAsCodeDFSSchema.parse(eac);
}
