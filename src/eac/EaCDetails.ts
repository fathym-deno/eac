import { z } from "./.deps.ts";
import {
  EaCVertexDetails,
  EaCVertexDetailsSchema,
} from "./EaCVertexDetails.ts";
import { EaCMetadataBase, EaCMetadataBaseSchema } from "./EaCMetadataBase.ts";

/**
 * Everything as Code (EaC) details.
 *
 * Represents the core structure for holding specific details about a node within the Everything as Code (EaC) graph.
 * This structure includes `Details`, which provides information specific to each vertex type, while also supporting
 * extended metadata through `EaCMetadataBase`.
 *
 * @template TDetails - Extends `EaCVertexDetails`, specifying the structure of details for the EaC node.
 */
export type EaCDetails<TDetails extends EaCVertexDetails> = {
  /** Details for the EaC node, including properties specific to the node’s purpose and characteristics. */
  Details?: TDetails;
} & EaCMetadataBase;

/**
 * Schema for `EaCDetails`.
 * Validates the structure for Everything as Code (EaC) details, focusing on the `Details` field which
 * captures vertex-specific properties and supports metadata extensibility.
 */
export const EaCDetailsSchema: z.ZodObject<
  {
    Details: z.ZodOptional<
      z.ZodObject<
        {
          Description: z.ZodOptional<z.ZodString>;
          Name: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$catchall<z.ZodUnknown>
> = EaCMetadataBaseSchema.merge(
  z
    .object({
      Details: EaCVertexDetailsSchema.optional().describe(
        "Contains properties specific to the EaC node, supporting consistent identification and categorization within the graph.",
      ),
    })
    .catchall(z.unknown()),
).describe(
  "Schema for Everything as Code (EaC) details, encapsulating node-specific information in the `Details` field for structured data handling within the EaC graph.",
);

/**
 * Type guard for `EaCDetails`.
 * Validates if the given object conforms to the `EaCDetails` structure.
 *
 * @param details - The object to validate.
 * @returns True if the object is a valid `EaCDetails<EaCVertexDetails>`, false otherwise.
 */
export function isEaCDetails(
  details: unknown,
): details is EaCDetails<EaCVertexDetails> {
  return EaCDetailsSchema.safeParse(details).success;
}

/**
 * Validates and parses an object as `EaCDetails`.
 *
 * @param details - The object to validate and parse.
 * @throws If the object does not conform to the `EaCDetailsSchema`.
 * @returns The parsed `EaCDetails<EaCVertexDetails>` object.
 */
export function parseEaCDetails(
  details: unknown,
): EaCDetails<EaCVertexDetails> {
  return EaCDetailsSchema.parse(details);
}
