import { z } from "../.deps.ts";

/**
 * Represents the JWT payload structure for EaC API requests.
 *
 * This includes enterprise-specific properties like `EnterpriseLookup`, user-specific properties
 * like `Username`, and a `JWT` token, while supporting additional metadata via dynamic keys.
 */
export type EaCAPIJWTPayload = Record<string, unknown> & {
  /** The lookup identifier for the enterprise. */
  EnterpriseLookup?: string;

  /** The JSON Web Token (JWT) for authentication. */
  JWT?: string;

  /** The username associated with this payload. */
  Username?: string;
};

/**
 * Schema for `EaCAPIJWTPayload`.
 * Validates the JWT payload structure, ensuring specific keys like `EnterpriseLookup`, `JWT`, and `Username`
 * are of the correct types while allowing additional metadata through dynamic keys.
 */
export const EaCAPIJWTPayloadSchema: z.ZodObject<
  {
    EnterpriseLookup: z.ZodOptional<z.ZodString>;
    JWT: z.ZodOptional<z.ZodString>;
    Username: z.ZodOptional<z.ZodString>;
  },
  z.core.$catchall<z.ZodUnknown>
> = z
  .object({
    EnterpriseLookup: z
      .string()
      .optional()
      .describe("The lookup identifier for the enterprise."),
    JWT: z
      .string()
      .optional()
      .describe("The JSON Web Token (JWT) for authentication."),
    Username: z
      .string()
      .optional()
      .describe("The username associated with this payload."),
  })
  .catchall(z.unknown())
  .describe(
    "Schema for EaCAPIJWTPayload, defining required fields for enterprise lookup, username, and JWT, while allowing additional metadata through dynamic keys.",
  );

/**
 * Type guard for `EaCAPIJWTPayload`.
 * Validates if the given object conforms to the `EaCAPIJWTPayload` structure.
 *
 * @param payload - The object to validate.
 * @returns True if the object is a valid `EaCAPIJWTPayload`, false otherwise.
 */
export function isEaCAPIJWTPayload(
  payload: unknown,
): payload is EaCAPIJWTPayload {
  return EaCAPIJWTPayloadSchema.safeParse(payload).success;
}

/**
 * Validates and parses an object as `EaCAPIJWTPayload`.
 *
 * @param payload - The object to validate and parse.
 * @throws If the object does not conform to the `EaCAPIJWTPayloadSchema`.
 * @returns The parsed `EaCAPIJWTPayload` object.
 */
export function parseEaCAPIJWTPayload(payload: unknown): EaCAPIJWTPayload {
  return EaCAPIJWTPayloadSchema.parse(payload);
}
