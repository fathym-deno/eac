import { z } from "./.deps.ts";

/**
 * Represents a user record in the Everything as Code (EaC) framework.
 */
export type EaCUserRecord = {
  /** The lookup identifier for the enterprise associated with this user. */
  EnterpriseLookup: string;

  /** The name of the enterprise associated with this user. */
  EnterpriseName: string;

  /** Indicates whether the user is the owner of the enterprise. */
  Owner: boolean;

  /** The lookup identifier for the parent enterprise. */
  ParentEnterpriseLookup: string;

  /** The username associated with this user record. */
  Username: string;
};

/**
 * Schema for `EaCUserRecord`.
 * This schema validates user records, ensuring a consistent structure for enterprise-related user data.
 */
export const EaCUserRecordSchema: z.ZodObject<
  {
    EnterpriseLookup: z.ZodString;
    EnterpriseName: z.ZodString;
    Owner: z.ZodBoolean;
    ParentEnterpriseLookup: z.ZodString;
    Username: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  EaCUserRecord,
  EaCUserRecord
> = z
  .object({
    EnterpriseLookup: z
      .string()
      .describe(
        "The lookup identifier for the enterprise associated with this user.",
      ),
    EnterpriseName: z
      .string()
      .describe("The name of the enterprise associated with this user."),
    Owner: z
      .boolean()
      .describe("Indicates whether the user is the owner of the enterprise."),
    ParentEnterpriseLookup: z
      .string()
      .describe("The lookup identifier for the parent enterprise."),
    Username: z
      .string()
      .describe("The username associated with this user record."),
  })
  .describe(
    "Schema representing a user record in the Everything as Code framework, including enterprise identifiers, ownership status, and username.",
  );

/**
 * Type guard for `EaCUserRecord`.
 * Validates if the given object conforms to the `EaCUserRecord` structure.
 *
 * @param record - The object to validate.
 * @returns True if the object is a valid `EaCUserRecord`, false otherwise.
 */
export function isEaCUserRecord(record: unknown): record is EaCUserRecord {
  return EaCUserRecordSchema.safeParse(record).success;
}

/**
 * Validates and parses an object as `EaCUserRecord`.
 *
 * @param record - The object to validate and parse.
 * @throws If the object does not conform to the `EaCUserRecord` schema.
 * @returns The parsed `EaCUserRecord` object.
 */
export function parseEaCUserRecord(record: unknown): EaCUserRecord {
  return EaCUserRecordSchema.parse(record);
}
