import { z } from "./.deps.ts";

/**
 * Enum used to represent whether to fetch all or any matches.
 */
export enum AllAnyTypes {
  /** Return only if all entries match. */
  All = "All",

  /** Return if any entry matches. */
  Any = "Any",
}

/**
 * Schema for `AllAnyTypes`.
 * Validates that the value is one of the `AllAnyTypes` enum values.
 */
export const AllAnyTypesSchema: z.ZodEnum<["All", "Any"]> = z.enum([
  "All",
  "Any",
]).describe(
  "Schema for AllAnyTypes enum, representing whether to fetch all or any matches.",
);

/**
 * Type guard for `AllAnyTypes`.
 * Validates if the given value is a valid `AllAnyTypes` enum value.
 *
 * @param value - The value to validate.
 * @returns True if the value is a valid `AllAnyTypes` enum value, false otherwise.
 */
export function isAllAnyType(value: unknown): value is AllAnyTypes {
  return AllAnyTypesSchema.safeParse(value).success;
}

/**
 * Validates and parses a value as `AllAnyTypes`.
 *
 * @param value - The value to validate and parse.
 * @throws If the value is not a valid `AllAnyTypes` enum value.
 * @returns The parsed `AllAnyTypes` value.
 */
export function parseAllAnyType(value: unknown): AllAnyTypes {
  return AllAnyTypesSchema.parse(value) as AllAnyTypes;
}
