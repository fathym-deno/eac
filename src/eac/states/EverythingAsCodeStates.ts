// import { z } from "../.deps.ts";
// import { EaCStateEntityAsCode, EaCStateEntityAsCodeSchema } from "./EaCStateEntityAsCode.ts";
// import { EaCStateAsCode, EaCStateAsCodeSchema } from "./EaCStateAsCode.ts";
// import { EverythingAsCodeDFS, EverythingAsCodeDFSSchema } from "../dfs/EverythingAsCodeDFS.ts";

// /**
//  * Represents the states and state entities for Everything as Code (EaC), including their configurations
//  * and relationships within a depth-first search (DFS) context.
//  */
// export type EverythingAsCodeStates = {
//   /** A record of state entities mapped by unique identifiers. */
//   StateEntities?: Record<string, EaCStateEntityAsCode>;

//   /** A record of states mapped by unique identifiers. */
//   States?: Record<string, EaCStateAsCode>;
// } & EverythingAsCodeDFS;

// /**
//  * Schema for `EverythingAsCodeStates`.
//  * Validates the structure, ensuring proper state entities, states, and DFS context.
//  */
// export const EverythingAsCodeStatesSchema: z.ZodObject<
//   {
//     StateEntities: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCStateEntityAsCodeSchema>>;
//     States: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCStateAsCodeSchema>>;
//   },
//   "strip",
//   z.ZodTypeAny,
//   EverythingAsCodeStates,
//   EverythingAsCodeStates
// > = EverythingAsCodeDFSSchema.extend({
//   StateEntities: z
//     .record(EaCStateEntityAsCodeSchema)
//     .optional()
//     .describe("A record of state entities mapped by unique identifiers."),
//   States: z
//     .record(EaCStateAsCodeSchema)
//     .optional()
//     .describe("A record of states mapped by unique identifiers."),
// }).describe(
//   "Schema for EverythingAsCodeStates, defining state entities, states, and DFS context.",
// );

// /**
//  * Type guard for `EverythingAsCodeStates`.
//  * Validates if the given object conforms to the `EverythingAsCodeStates` structure.
//  *
//  * @param eac - The object to validate.
//  * @returns True if the object is a valid `EverythingAsCodeStates`, false otherwise.
//  */
// export function isEverythingAsCodeStates(eac: unknown): eac is EverythingAsCodeStates {
//   return EverythingAsCodeStatesSchema.safeParse(eac).success;
// }

// /**
//  * Validates and parses an object as `EverythingAsCodeStates`.
//  *
//  * @param eac - The object to validate and parse.
//  * @throws If the object does not conform to the `EverythingAsCodeStatesSchema`.
//  * @returns The parsed `EverythingAsCodeStates` object.
//  */
// export function parseEverythingAsCodeStates(eac: unknown): EverythingAsCodeStates {
//   return EverythingAsCodeStatesSchema.parse(eac);
// }
