import { z } from "./.deps.ts";
import { EaCDetails, EaCDetailsSchema } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemDetailsSchema,
  isEaCDistributedFileSystemDetails,
} from "./EaCDistributedFileSystemDetails.ts";

/**
 * Represents an Everything as Code (EaC) Distributed File System (DFS).
 *
 * This type extends `EaCDetails` with `EaCDistributedFileSystemDetails`.
 */
export type EaCDistributedFileSystemAsCode = EaCDetails<
  EaCDistributedFileSystemDetails
>;

/**
 * Schema for `EaCDistributedFileSystemAsCode`.
 * Ensures that `Details` conforms to `EaCDistributedFileSystemDetailsSchema`.
 */
export const EaCDistributedFileSystemAsCodeSchema: z.ZodObject<{
  Details: z.ZodOptional<typeof EaCDistributedFileSystemDetailsSchema>;
}> = EaCDetailsSchema.extend({
  Details: EaCDistributedFileSystemDetailsSchema.optional().describe(
    "Distributed File System (DFS) details.",
  ),
}).describe(
  "Schema for EaCDistributedFileSystemAsCode, ensuring the correct structure for DFS-based Everything as Code.",
);

/**
 * Type guard for `EaCDistributedFileSystemAsCode`.
 * Validates if the given object conforms to the `EaCDistributedFileSystemAsCode` structure.
 *
 * @param eac - The object to validate.
 * @returns True if the object is a valid `EaCDistributedFileSystemAsCode`, false otherwise.
 */
export function isEaCDistributedFileSystemAsCode(
  eac: unknown,
): eac is EaCDistributedFileSystemAsCode {
  if (!eac || typeof eac !== "object") return false;

  const obj = eac as EaCDistributedFileSystemAsCode;

  // If Details is present, it must conform to the expected schema
  if (obj.Details !== undefined) {
    return (
      EaCDistributedFileSystemAsCodeSchema.safeParse(eac).success &&
      isEaCDistributedFileSystemDetails(undefined, obj.Details)
    );
  }

  // If Details is missing, it's still valid
  return EaCDistributedFileSystemAsCodeSchema.safeParse(eac).success;
}

/**
 * Validates and parses an object as `EaCDistributedFileSystemAsCode`.
 *
 * @param eac - The object to validate and parse.
 * @throws If the object does not conform to the `EaCDistributedFileSystemAsCodeSchema`.
 * @returns The parsed `EaCDistributedFileSystemAsCode` object.
 */
export function parseEaCDistributedFileSystemAsCode(
  eac: unknown,
): EaCDistributedFileSystemAsCode {
  return EaCDistributedFileSystemAsCodeSchema.parse(eac);
}
