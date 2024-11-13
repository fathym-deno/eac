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
 * `EaCEnterpriseDetailsSchema` validates the structure for enterprise details within the Everything as Code (EaC) graph.
 * Inherits all properties from `EaCVertexDetailsSchema`.
 *
 * - `Name`: The enterprise's title, providing clear identification.
 * - `Description`: A concise summary, aiding in documentation and understanding of the enterprise context.
 */
export const EaCEnterpriseDetailsSchema: typeof EaCVertexDetailsSchema =
  EaCVertexDetailsSchema.describe(
    "Schema for EaC enterprise details, defining core properties like `Name` and `Description` for clear and consistent enterprise-level documentation and categorization within the Everything as Code framework.",
  );

export type EaCEnterpriseDetailsSchema = z.infer<
  typeof EaCEnterpriseDetailsSchema
>;
