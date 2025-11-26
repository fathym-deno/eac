import { z } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemDetailsSchema,
} from "./EaCDistributedFileSystemDetails.ts";

/**
 * Represents details for an NPM-backed Distributed File System (DFS) in Everything as Code (EaC).
 *
 * This type extends `EaCDistributedFileSystemDetails` with NPM-specific properties.
 */
export type EaCNPMDistributedFileSystemDetails = {
  /** The name of the NPM package. */
  Package: string;

  /** The version of the NPM package to use. */
  Version: string;
} & EaCDistributedFileSystemDetails<"NPM">;

/**
 * Schema for `EaCNPMDistributedFileSystemDetails`.
 * Ensures `Type` is explicitly `"NPM"` while extending `EaCDistributedFileSystemDetailsSchema`.
 */
export const EaCNPMDistributedFileSystemDetailsSchema: z.ZodObject<
  {
    CacheDBLookup: z.ZodOptional<z.ZodString>;
    CacheSeconds: z.ZodOptional<z.ZodNumber>;
    DefaultFile: z.ZodOptional<z.ZodString>;
    Extensions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    UseCascading: z.ZodOptional<z.ZodBoolean>;
    WorkerPath: z.ZodOptional<z.ZodString>;
    Type: z.ZodLiteral<"NPM">;
    Package: z.ZodString;
    Version: z.ZodString;
  },
  z.core.$strip
> = EaCDistributedFileSystemDetailsSchema.extend({
  Type: z.literal("NPM").describe("The fixed type identifier for this DFS."),
  Package: z.string().describe("The name of the NPM package."),
  Version: z.string().describe("The version of the NPM package to use."),
}).describe(
  "Schema for EaCNPMDistributedFileSystemDetails, defining NPM-specific properties for a Distributed File System.",
);

/**
 * Type guard for `EaCNPMDistributedFileSystemDetails`.
 * Validates if the given object conforms to the `EaCNPMDistributedFileSystemDetails` structure.
 *
 * @param dfs - The object to validate.
 * @returns True if the object is a valid `EaCNPMDistributedFileSystemDetails`, false otherwise.
 */
export function isEaCNPMDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCNPMDistributedFileSystemDetails {
  return EaCNPMDistributedFileSystemDetailsSchema.safeParse(dfs).success;
}

/**
 * Validates and parses an object as `EaCNPMDistributedFileSystemDetails`.
 *
 * @param dfs - The object to validate and parse.
 * @throws If the object does not conform to the `EaCNPMDistributedFileSystemDetailsSchema`.
 * @returns The parsed `EaCNPMDistributedFileSystemDetails` object.
 */
export function parseEaCNPMDistributedFileSystemDetails(
  dfs: unknown,
): EaCNPMDistributedFileSystemDetails {
  return EaCNPMDistributedFileSystemDetailsSchema.parse(dfs);
}
