import { z } from "./.deps.ts";
import {
  EaCModuleActuators,
  EaCModuleActuatorsSchema,
} from "./EaCModuleActuators.ts";
import {
  EaCEnterpriseDetails,
  EaCEnterpriseDetailsSchema,
} from "./EaCEnterpriseDetails.ts";
import { EaCMetadataBase } from "./EaCMetadataBase.ts";

/**
 * Everything as Code (EaC).
 *
 * Represents the foundational structure for an EaC node, including core identification,
 * modular configurations, and hierarchical relationships.
 */
export type EverythingAsCode = {
  /** The module actuators for the EaC. */
  Actuators?: EaCModuleActuators;

  /** The Details for the EaC node. */
  Details?: EaCEnterpriseDetails;

  /** The enterprise lookup for the EaC. */
  EnterpriseLookup?: string;

  /** The parent enterprise lookup for the EaC. */
  ParentEnterpriseLookup?: string;
} & EaCMetadataBase;

/**
 * Schema for `EverythingAsCode`.
 * Validates the structure of an EaC node, ensuring consistency in identification, configuration,
 * and hierarchical linking properties.
 */
export const EverythingAsCodeSchema: z.ZodObject<
  {
    Actuators: z.ZodOptional<typeof EaCModuleActuatorsSchema>;
    Details: z.ZodOptional<typeof EaCEnterpriseDetailsSchema>;
    EnterpriseLookup: z.ZodOptional<z.ZodString>;
    ParentEnterpriseLookup: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  EverythingAsCode,
  EverythingAsCode
> = z
  .object({
    Actuators: EaCModuleActuatorsSchema.optional().describe(
      "A collection of module actuators, defining modular configurations for EaC processing.",
    ),
    Details: EaCEnterpriseDetailsSchema.optional().describe(
      "Core details for the EaC node, including properties specific to the node's role and purpose.",
    ),
    EnterpriseLookup: z
      .string()
      .optional()
      .describe(
        "A unique identifier for the enterprise, enabling efficient referencing and management within an EaC ecosystem.",
      ),
    ParentEnterpriseLookup: z
      .string()
      .optional()
      .describe(
        "A unique identifier for a parent enterprise, allowing hierarchical relationships within an EaC ecosystem.",
      ),
  })
  .describe(
    "Schema for `EverythingAsCode`, defining the essential structure for managing EaC nodes. This schema includes actuators, details, enterprise identifiers, and hierarchical properties to enable dynamic and scalable code management.",
  );

/**
 * Type guard for `EverythingAsCode`.
 * Validates if the given object conforms to the `EverythingAsCode` structure.
 *
 * @param value - The object to validate.
 * @returns True if the object is a valid `EverythingAsCode`, false otherwise.
 */
export function isEverythingAsCode(value: unknown): value is EverythingAsCode {
  return EverythingAsCodeSchema.safeParse(value).success;
}

/**
 * Validates and parses an object as `EverythingAsCode`.
 *
 * @param value - The object to validate and parse.
 * @throws If the object does not conform to the `EverythingAsCodeSchema`.
 * @returns The parsed `EverythingAsCode` object.
 */
export function parseEverythingAsCode(value: unknown): EverythingAsCode {
  return EverythingAsCodeSchema.parse(value);
}
