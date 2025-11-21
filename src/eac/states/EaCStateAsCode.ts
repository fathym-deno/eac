import { z } from "../.deps.ts";
import { EaCDetails, EaCDetailsSchema } from "../../eac/EaCDetails.ts";
import {
  EaCStateDetails,
  EaCStateDetailsSchema,
  isEaCStateDetails,
} from "./EaCStateDetails.ts";
import {
  EaCStateResolverConfiguration,
  EaCStateResolverConfigurationSchema,
} from "./EaCStateResolverConfiguration.ts";

/**
 * Represents the state configuration for Everything as Code (EaC), including resolver configurations
 * and detailed state-specific information.
 */
export type EaCStateAsCode = {
  /** Resolver configurations mapped by a unique identifier. */
  ResolverConfigs: Record<string, EaCStateResolverConfiguration>;
} & EaCDetails<EaCStateDetails>;

/**
 * Schema for `EaCStateAsCode`.
 * Validates the structure, ensuring resolver configurations and state-specific details are properly defined.
 */
export const EaCStateAsCodeSchema: z.ZodObject<
  {
    ResolverConfigs: z.ZodRecord<
      z.ZodString,
      typeof EaCStateResolverConfigurationSchema
    >;
    Details: z.ZodOptional<typeof EaCStateDetailsSchema>;
  },
  "strip",
  z.ZodTypeAny,
  EaCStateAsCode,
  EaCStateAsCode
> = EaCDetailsSchema.extend({
  ResolverConfigs: z
    .record(EaCStateResolverConfigurationSchema)
    .describe(
      "Resolver configurations mapped by unique identifiers, specifying logic for state-specific resolutions.",
    ),
  Details: EaCStateDetailsSchema.optional(),
}).describe(
  "Schema for EaCStateAsCode, combining resolver configurations and state-specific details.",
);

/**
 * Type guard for `EaCStateAsCode`.
 * Validates if the given object conforms to the `EaCStateAsCode` structure.
 *
 * @param eac - The object to validate.
 * @returns True if the object is a valid `EaCStateAsCode`, false otherwise.
 */
export function isEaCStateAsCode(eac: unknown): eac is EaCStateAsCode {
  return EaCStateAsCodeSchema.safeParse(eac).success;
}

/**
 * Validates and parses an object as `EaCStateAsCode`.
 *
 * @param eac - The object to validate and parse.
 * @throws If the object does not conform to the `EaCStateAsCodeSchema`.
 * @returns The parsed `EaCStateAsCode` object.
 */
export function parseEaCStateAsCode(eac: unknown): EaCStateAsCode {
  return EaCStateAsCodeSchema.parse(eac);
}
