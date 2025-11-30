import { z } from "../.deps.ts";
import { EaCDetails, EaCDetailsSchema } from "../../eac/EaCDetails.ts";
import {
  EaCStateEntityDetails,
  EaCStateEntityDetailsSchema,
  isEaCStateEntityDetails,
} from "./EaCStateEntityDetails.ts";
import {
  EaCStateResolverConfiguration,
  EaCStateResolverConfigurationSchema,
} from "./EaCStateResolverConfiguration.ts";

/**
 * Represents an EaC state entity as code.
 *
 * Combines state-specific entity details with optional modifier resolvers for configuration.
 */
export type EaCStateEntityAsCode = {
  /** Optional modifier resolvers mapped by unique identifiers. */
  ModifierResolvers?: Record<string, EaCStateResolverConfiguration>;
} & EaCDetails<EaCStateEntityDetails>;

/**
 * Schema for `EaCStateEntityAsCode`.
 * Validates the structure, ensuring proper state entity details and optional modifier resolvers.
 */
export const EaCStateEntityAsCodeSchema: z.ZodType<EaCStateEntityAsCode> =
  EaCDetailsSchema.extend({
    ModifierResolvers: z
      .record(z.string(), EaCStateResolverConfigurationSchema)
      .optional()
      .describe(
        "Optional modifier resolvers mapped by unique identifiers, specifying additional state-specific logic.",
      ),
    Details: EaCStateEntityDetailsSchema.optional(),
  }).describe(
    "Schema for EaCStateEntityAsCode, defining state-specific entity details and optional modifier resolvers.",
  );

/**
 * Type guard for `EaCStateEntityAsCode`.
 * Validates if the given object conforms to the `EaCStateEntityAsCode` structure.
 *
 * @param eac - The object to validate.
 * @returns True if the object is a valid `EaCStateEntityAsCode`, false otherwise.
 */
export function isEaCStateEntityAsCode(
  eac: unknown,
): eac is EaCStateEntityAsCode {
  return EaCStateEntityAsCodeSchema.safeParse(eac).success;
}

/**
 * Validates and parses an object as `EaCStateEntityAsCode`.
 *
 * @param eac - The object to validate and parse.
 * @throws If the object does not conform to the `EaCStateEntityAsCodeSchema`.
 * @returns The parsed `EaCStateEntityAsCode` object.
 */
export function parseEaCStateEntityAsCode(
  eac: unknown,
): EaCStateEntityAsCode {
  return EaCStateEntityAsCodeSchema.parse(eac);
}
