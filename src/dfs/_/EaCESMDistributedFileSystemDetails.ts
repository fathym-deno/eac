import { z } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemDetailsSchema,
} from "./EaCDistributedFileSystemDetails.ts";

/**
 * Represents details for an ESM-backed Distributed File System (DFS) in Everything as Code (EaC).
 *
 * This type extends `EaCDistributedFileSystemDetails` with ESM-specific properties.
 */
export type EaCESMDistributedFileSystemDetails = {
  /** Entry points for the ESM module resolution. */
  EntryPoints: string[];

  // /** Whether to include dependencies in resolution. */
  // IncludeDependencies?: boolean;

  /** The root directory for ESM file resolution. */
  Root: string;
} & EaCDistributedFileSystemDetails<"ESM">;

/**
 * Schema for `EaCESMDistributedFileSystemDetails`.
 * Ensures `Type` is explicitly `"ESM"` while extending `EaCDistributedFileSystemDetailsSchema`.
 */
export const EaCESMDistributedFileSystemDetailsSchema: z.ZodObject<{
  Type: z.ZodLiteral<"ESM">;
  EntryPoints: z.ZodArray<z.ZodString>;
  // IncludeDependencies: z.ZodOptional<z.ZodBoolean>;
  Root: z.ZodString;
}> = EaCDistributedFileSystemDetailsSchema.extend({
  Type: z.literal("ESM").describe("The fixed type identifier for this DFS."),
  EntryPoints: z
    .array(z.string())
    .min(1)
    .describe("Entry points for the ESM module resolution."),
  // IncludeDependencies: z
  //   .boolean()
  //   .optional()
  //   .describe("Whether to include dependencies in resolution."),
  Root: z.string().describe("The root directory for ESM file resolution."),
}).describe(
  "Schema for EaCESMDistributedFileSystemDetails, defining ESM-specific properties for a Distributed File System.",
);

/**
 * Type guard for `EaCESMDistributedFileSystemDetails`.
 * Validates if the given object conforms to the `EaCESMDistributedFileSystemDetails` structure.
 *
 * @param dfs - The object to validate.
 * @returns True if the object is a valid `EaCESMDistributedFileSystemDetails`, false otherwise.
 */
export function isEaCESMDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCESMDistributedFileSystemDetails {
  return EaCESMDistributedFileSystemDetailsSchema.safeParse(dfs).success;
}

/**
 * Validates and parses an object as `EaCESMDistributedFileSystemDetails`.
 *
 * @param dfs - The object to validate and parse.
 * @throws If the object does not conform to the `EaCESMDistributedFileSystemDetailsSchema`.
 * @returns The parsed `EaCESMDistributedFileSystemDetails` object.
 */
export function parseEaCESMDistributedFileSystemDetails(
  dfs: unknown,
): EaCESMDistributedFileSystemDetails {
  return EaCESMDistributedFileSystemDetailsSchema.parse(dfs);
}
