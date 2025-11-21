import { z } from "./.deps.ts";
import {
  EaCVertexDetails,
  EaCVertexDetailsSchema,
} from "./EaCVertexDetails.ts";

/**
 * EaC enterprise details.
 *
 * Represents the core details for an enterprise node in the Everything as Code (EaC) environment.
 * This type is based on `EaCVertexDetails`, inheriting key properties like `Name` and `Description`
 * to allow consistent referencing, categorization, and documentation of enterprise nodes.
 */
export type EaCEnterpriseDetails = EaCVertexDetails;

/**
 * Schema for `EaCEnterpriseDetails`.
 * Validates the structure for enterprise details, inheriting all properties from `EaCVertexDetailsSchema`.
 */
export const EaCEnterpriseDetailsSchema: z.ZodObject<
  {
    Description: z.ZodOptional<z.ZodString>;
    Name: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  EaCEnterpriseDetails,
  EaCEnterpriseDetails
> = EaCVertexDetailsSchema.describe(
  "Schema for EaC enterprise details, defining core properties like `Name` and `Description` for clear and consistent enterprise-level documentation and categorization within the Everything as Code framework.",
);

/**
 * Type guard for `EaCEnterpriseDetails`.
 * Validates if the given object conforms to the `EaCEnterpriseDetails` structure.
 *
 * @param details - The object to validate.
 * @returns True if the object is a valid `EaCEnterpriseDetails`, false otherwise.
 */
export function isEaCEnterpriseDetails(
  details: unknown,
): details is EaCEnterpriseDetails {
  return EaCEnterpriseDetailsSchema.safeParse(details).success;
}

/**
 * Validates and parses an object as `EaCEnterpriseDetails`.
 *
 * @param details - The object to validate and parse.
 * @throws If the object does not conform to the `EaCEnterpriseDetails` schema.
 * @returns The parsed `EaCEnterpriseDetails` object.
 */
export function parseEaCEnterpriseDetails(
  details: unknown,
): EaCEnterpriseDetails {
  return EaCEnterpriseDetailsSchema.parse(details);
}
