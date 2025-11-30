import { z } from "../.deps.ts";
import {
  EaCVertexDetails,
  EaCVertexDetailsSchema,
} from "../../eac/EaCVertexDetails.ts";

/**
 * Represents the details of a state in the Everything as Code (EaC) framework.
 *
 * Extends `EaCVertexDetails` and introduces additional properties like `DFSLookup`, `EntitiesDFSLookup`, and `Priority`.
 */
export type EaCStateDetails = {
  /** A unique identifier for the state in a depth-first search lookup. */
  DFSLookup: string;

  /** A unique identifier for the associated entities' depth-first search lookup. */
  EntitiesDFSLookup: string;

  /** The priority of the state, influencing its processing order. */
  Priority: number;
} & EaCVertexDetails;

/**
 * Schema for `EaCStateDetails`.
 * Validates the structure, ensuring the presence of `DFSLookup`, `EntitiesDFSLookup`, and `Priority`, while extending `EaCVertexDetails`.
 */
export const EaCStateDetailsSchema: z.ZodType<EaCStateDetails> =
  EaCVertexDetailsSchema.extend({
  DFSLookup: z
    .string()
    .describe(
      "A unique identifier for the state in a depth-first search lookup.",
    ),
  EntitiesDFSLookup: z
    .string()
    .describe(
      "A unique identifier for the associated entities' depth-first search lookup.",
    ),
  Priority: z
    .number()
    .describe("The priority of the state, influencing its processing order."),
}).describe(
  "Schema for EaCStateDetails, defining additional properties like `DFSLookup`, `EntitiesDFSLookup`, and `Priority` while extending `EaCVertexDetails`.",
);

/**
 * Type guard for `EaCStateDetails`.
 * Validates if the given object conforms to the `EaCStateDetails` structure.
 *
 * @param details - The object to validate.
 * @returns True if the object is a valid `EaCStateDetails`, false otherwise.
 */
export function isEaCStateDetails(
  details: unknown,
): details is EaCStateDetails {
  return EaCStateDetailsSchema.safeParse(details).success;
}

/**
 * Validates and parses an object as `EaCStateDetails`.
 *
 * @param details - The object to validate and parse.
 * @throws If the object does not conform to the `EaCStateDetailsSchema`.
 * @returns The parsed `EaCStateDetails` object.
 */
export function parseEaCStateDetails(details: unknown): EaCStateDetails {
  return EaCStateDetailsSchema.parse(details);
}
