import { z } from "./.deps.ts";

/**
 * The base type for Everything as Code (EaC) to create open EaC types.
 * This represents an extensible metadata structure with arbitrary keys and values.
 */
export type EaCMetadataBase =
  | Record<string | number | symbol, unknown>
  | undefined;

/**
 * Schema for `EaCMetadataBase`.
 * Validates that the object is either an extensible metadata structure (record of arbitrary keys and values) or undefined.
 */
export const EaCMetadataBaseSchema: z.ZodType<EaCMetadataBase> = z
  .union([
    z.record(z.union([z.string(), z.number(), z.symbol()]), z.unknown()),
    z.undefined(),
  ])
  .describe(
    "Schema for EaCMetadataBase, allowing an open metadata structure with arbitrary keys and values or undefined.",
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
