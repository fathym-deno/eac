import { z } from "../.deps.ts";

/**
 * Represents the configuration for a state resolver in the Everything as Code (EaC) framework.
 *
 * This configuration includes details such as the hostname, optional path, and port.
 */
export type EaCStateResolverConfiguration = {
  /** The hostname of the resolver. */
  Hostname: string;

  /** The optional path associated with the resolver. */
  Path?: string;

  /** The optional port number for the resolver. */
  Port?: number;
};

/**
 * Schema for `EaCStateResolverConfiguration`.
 * Validates the resolver configuration, ensuring the presence of a `Hostname` and optional `Path` and `Port` fields.
 */
export const EaCStateResolverConfigurationSchema: z.ZodType<EaCStateResolverConfiguration> =
  z
  .object({
    Hostname: z
      .string()
      .describe(
        "The hostname of the resolver, required for identifying the target host.",
      ),
    Path: z
      .string()
      .optional()
      .describe("An optional path associated with the resolver."),
    Port: z
      .number()
      .optional()
      .describe("An optional port number for the resolver."),
  })
  .describe(
    "Schema for EaCStateResolverConfiguration, defining the structure for a resolver's hostname, optional path, and port.",
  );

/**
 * Type guard for `EaCStateResolverConfiguration`.
 * Validates if the given object conforms to the `EaCStateResolverConfiguration` structure.
 *
 * @param config - The object to validate.
 * @returns True if the object is a valid `EaCStateResolverConfiguration`, false otherwise.
 */
export function isEaCStateResolverConfiguration(
  config: unknown,
): config is EaCStateResolverConfiguration {
  return EaCStateResolverConfigurationSchema.safeParse(config).success;
}

/**
 * Validates and parses an object as `EaCStateResolverConfiguration`.
 *
 * @param config - The object to validate and parse.
 * @throws If the object does not conform to the `EaCStateResolverConfigurationSchema`.
 * @returns The parsed `EaCStateResolverConfiguration` object.
 */
export function parseEaCStateResolverConfiguration(
  config: unknown,
): EaCStateResolverConfiguration {
  return EaCStateResolverConfigurationSchema.parse(config);
}
