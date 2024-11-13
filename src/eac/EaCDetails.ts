import { z } from "./.deps.ts";
import {
  EaCVertexDetails,
  EaCVertexDetailsSchema,
} from "./EaCVertexDetails.ts";
import { EaCMetadataBase } from "./EaCMetadataBase.ts";

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
 * `EaCDetailsSchema` validates the `EaCDetails` structure, focusing on the `Details` field
 * which captures key information for each EaC node.
 *
 * - `Details`: Contains vertex-specific properties defined in `EaCVertexDetails`.
 */
export const EaCDetailsSchema: z.ZodObject<
  {
    Details: z.ZodOptional<typeof EaCVertexDetailsSchema>;
  },
  "strip",
  z.ZodTypeAny,
  EaCDetails<EaCVertexDetails>,
  EaCDetails<EaCVertexDetails>
> = z
  .object({
    Details: EaCVertexDetailsSchema.optional().describe(
      "Contains properties specific to the EaC node, supporting consistent identification and categorization within the graph.",
    ),
  })
  .describe(
    "Schema for Everything as Code (EaC) details, encapsulating node-specific information in the `Details` field for structured data handling within the EaC graph.",
  );

export type EaCDetailsSchema = z.infer<typeof EaCDetailsSchema>;
