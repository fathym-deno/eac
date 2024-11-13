import { z } from "./.deps.ts";
import { EaCMetadataBase } from "./EaCMetadataBase.ts";

/**
 * Details about a vertex in the Everything as Code (EaC) graph.
 */
export type EaCVertexDetails = {
  /** The description of the vertex. */
  Description?: string;

  /** The name of the vertex. */
  Name?: string;
} & EaCMetadataBase;

/**
 * `EaCVertexDetailsSchema` validates the essential details of a vertex in the EaC graph.
 * This schema includes optional fields for `Description` and `Name`, which provide context
 * and identification for vertices within the Everything as Code framework.
 */
export const EaCVertexDetailsSchema: z.ZodObject<
  {
    Description: z.ZodOptional<z.ZodString>;
    Name: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  EaCVertexDetails,
  EaCVertexDetails
> = z
  .object({
    Description: z
      .string()
      .optional()
      .describe(
        "An optional description that provides a summary or background information about the vertex.",
      ),
    Name: z
      .string()
      .optional()
      .describe(
        "An optional name for identifying the vertex, supporting easier referencing within the EaC graph.",
      ),
  })
  .describe(
    "Schema representing the core details of an EaC vertex, including optional fields for description and name. This structure supports clear vertex representation within the Everything as Code graph.",
  );

// Define the inferred type from the schema
export type EaCVertexDetailsSchema = z.infer<typeof EaCVertexDetailsSchema>;
