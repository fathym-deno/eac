import { z } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemDetailsSchema,
} from "./EaCDistributedFileSystemDetails.ts";

/**
 * Represents details for a Local File System-backed Distributed File System (DFS) in Everything as Code (EaC).
 *
 * This type extends `EaCDistributedFileSystemDetails` with Local-specific properties.
 */
export type EaCLocalDistributedFileSystemDetails = {
  /** The root path in the local file system. */
  FileRoot: string;
} & EaCDistributedFileSystemDetails<"Local">;

/**
 * Schema for `EaCLocalDistributedFileSystemDetails`.
 * Ensures `Type` is explicitly `"Local"` while extending `EaCDistributedFileSystemDetailsSchema`.
 */
export const EaCLocalDistributedFileSystemDetailsSchema: z.ZodObject<
  {
    CacheDBLookup: z.ZodOptional<z.ZodString>;
    CacheSeconds: z.ZodOptional<z.ZodNumber>;
    DefaultFile: z.ZodOptional<z.ZodString>;
    Extensions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    UseCascading: z.ZodOptional<z.ZodBoolean>;
    WorkerPath: z.ZodOptional<z.ZodString>;
    Type: z.ZodLiteral<"Local">;
    FileRoot: z.ZodString;
  },
  z.core.$strip
> = EaCDistributedFileSystemDetailsSchema.extend({
  Type: z.literal("Local").describe("The fixed type identifier for this DFS."),
  FileRoot: z.string().describe("The root path in the local file system."),
}).describe(
  "Schema for EaCLocalDistributedFileSystemDetails, defining Local-specific properties for a Distributed File System.",
);

/**
 * Type guard for `EaCLocalDistributedFileSystemDetails`.
 * Validates if the given object conforms to the `EaCLocalDistributedFileSystemDetails` structure.
 *
 * @param dfs - The object to validate.
 * @returns True if the object is a valid `EaCLocalDistributedFileSystemDetails`, false otherwise.
 */
export function isEaCLocalDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCLocalDistributedFileSystemDetails {
  return EaCLocalDistributedFileSystemDetailsSchema.safeParse(dfs).success;
}

/**
 * Validates and parses an object as `EaCLocalDistributedFileSystemDetails`.
 *
 * @param dfs - The object to validate and parse.
 * @throws If the object does not conform to the `EaCLocalDistributedFileSystemDetailsSchema`.
 * @returns The parsed `EaCLocalDistributedFileSystemDetails` object.
 */
export function parseEaCLocalDistributedFileSystemDetails(
  dfs: unknown,
): EaCLocalDistributedFileSystemDetails {
  return EaCLocalDistributedFileSystemDetailsSchema.parse(dfs);
}
