import { z } from "./.deps.ts";

/**
 * The base type for Everything as Code (EaC) to create open EaC types.
 * This represents an extensible metadata structure with arbitrary keys and values.
 */
export type EaCMetadataBase = Record<string, unknown>;

/**
 * Schema for `EaCMetadataBase`.
 * Validates that the object is an extensible metadata structure with arbitrary keys and values.
 */
export const EaCMetadataBaseSchema: z.ZodObject<
  {},
  "strip",
  z.ZodUnknown,
  z.objectOutputType<{}, z.ZodUnknown, "strip">,
  z.objectInputType<{}, z.ZodUnknown, "strip">
> = z
  .object({})
  .catchall(z.unknown()) // Allows arbitrary key-value pairs for extensibility
  .describe(
    "Schema for EaCMetadataBase, allowing an open metadata structure with arbitrary keys and values.",
  );

/**
 * Type guard for `EaCMetadataBase`.
 * Validates if the given object conforms to the `EaCMetadataBase` structure.
 *
 * @param metadata - The object to validate.
 * @returns True if the object is a valid `EaCMetadataBase`, false otherwise.
 */
export function isEaCMetadataBase(
  metadata: unknown,
): metadata is EaCMetadataBase {
  return EaCMetadataBaseSchema.safeParse(metadata).success;
}

/**
 * Validates and parses an object as `EaCMetadataBase`.
 *
 * @param metadata - The object to validate and parse.
 * @throws If the object does not conform to the `EaCMetadataBase` schema.
 * @returns The parsed `EaCMetadataBase` object.
 */
export function parseEaCMetadataBase(metadata: unknown): EaCMetadataBase {
  return EaCMetadataBaseSchema.parse(metadata);
}
