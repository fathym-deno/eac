import { z } from "./.deps.ts";
import { EaCMetadataBase, EaCMetadataBaseSchema } from "./EaCMetadataBase.ts";

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
 * Schema for `EaCVertexDetails`.
 * This schema validates the essential details of a vertex in the EaC graph.
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
> = EaCMetadataBaseSchema.merge(
  z.object({
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
  }),
).describe(
  "Schema representing the core details of an EaC vertex, including optional fields for description and name. This structure supports clear vertex representation within the Everything as Code graph.",
);

/**
 * Type guard for `EaCVertexDetails`.
 * Validates if the given object conforms to the `EaCVertexDetails` structure.
 *
 * @param details - The object to validate.
 * @returns True if the object is a valid `EaCVertexDetails`, false otherwise.
 */
export function isEaCVertexDetails(
  details: unknown,
): details is EaCVertexDetails {
  return EaCVertexDetailsSchema.safeParse(details).success;
}

/**
 * Validates and parses an object as `EaCVertexDetails`.
 *
 * @param details - The object to validate and parse.
 * @throws If the object does not conform to the `EaCVertexDetails` schema.
 * @returns The parsed `EaCVertexDetails` object.
 */
export function parseEaCVertexDetails(details: unknown): EaCVertexDetails {
  return EaCVertexDetailsSchema.parse(details);
}
