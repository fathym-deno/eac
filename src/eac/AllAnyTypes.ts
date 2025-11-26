import { z } from "./.deps.ts";

/**
 * Type representing whether to fetch all or any matches.
 */
export type AllAnyTypes = "All" | "Any";

/**
 * Schema for `AllAnyTypes`.
 * Validates that the value is one of the `AllAnyTypes` union type values.
 */
export const AllAnyTypesSchema: z.ZodUnion<
  readonly [z.ZodLiteral<"All">, z.ZodLiteral<"Any">]
> = z
  .union([z.literal("All"), z.literal("Any")])
  .describe(
    "Schema for AllAnyTypes, representing whether to fetch all or any matches.",
  );

/**
 * Type guard for `AllAnyTypes`.
 * Validates if the given value is a valid `AllAnyTypes` value.
 *
 * @param value - The value to validate.
 * @returns True if the value is a valid `AllAnyTypes` value, false otherwise.
 */
export function isAllAnyType(value: unknown): value is AllAnyTypes {
  return AllAnyTypesSchema.safeParse(value).success;
}

/**
 * Validates and parses a value as `AllAnyTypes`.
 *
 * @param value - The value to validate and parse.
 * @throws If the value is not a valid `AllAnyTypes` value.
 * @returns The parsed `AllAnyTypes` value.
 */
export function parseAllAnyType(value: unknown): AllAnyTypes {
  return AllAnyTypesSchema.parse(value);
}
