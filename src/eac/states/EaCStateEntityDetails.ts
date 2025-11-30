import { z } from "../.deps.ts";
import {
  EaCVertexDetails,
  EaCVertexDetailsSchema,
} from "../../eac/EaCVertexDetails.ts";

/**
 * Represents the details of a state entity in the Everything as Code (EaC) framework.
 *
 * Extends `EaCVertexDetails` and includes additional properties like `DFSLookup`.
 */
export type EaCStateEntityDetails = {
  /** A unique identifier for the state entity in a depth-first search lookup. */
  DFSLookup: string;
} & EaCVertexDetails;

/**
 * Schema for `EaCStateEntityDetails`.
 * Validates the structure, ensuring the presence of `DFSLookup` and compatibility with `EaCVertexDetails`.
 */
export const EaCStateEntityDetailsSchema: z.ZodType<EaCStateEntityDetails> =
  EaCVertexDetailsSchema.extend({
    DFSLookup: z
      .string()
      .describe(
        "A unique identifier for the state entity in a depth-first search lookup.",
      ),
  }).describe(
    "Schema for EaCStateEntityDetails, defining additional properties like `DFSLookup` while extending `EaCVertexDetails`.",
  );

/**
 * Type guard for `EaCStateEntityDetails`.
 * Validates if the given object conforms to the `EaCStateEntityDetails` structure.
 *
 * @param details - The object to validate.
 * @returns True if the object is a valid `EaCStateEntityDetails`, false otherwise.
 */
export function isEaCStateEntityDetails(
  details: unknown,
): details is EaCStateEntityDetails {
  return EaCStateEntityDetailsSchema.safeParse(details).success;
}

/**
 * Validates and parses an object as `EaCStateEntityDetails`.
 *
 * @param details - The object to validate and parse.
 * @throws If the object does not conform to the `EaCStateEntityDetailsSchema`.
 * @returns The parsed `EaCStateEntityDetails` object.
 */
export function parseEaCStateEntityDetails(
  details: unknown,
): EaCStateEntityDetails {
  return EaCStateEntityDetailsSchema.parse(details);
}
