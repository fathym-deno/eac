import { z } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemDetailsSchema,
} from "./EaCDistributedFileSystemDetails.ts";

/**
 * Represents details for a Composite Distributed File System (DFS) in Everything as Code (EaC).
 *
 * This type extends `EaCDistributedFileSystemDetails` with Composite-specific properties.
 * Composite DFS combines multiple DFS sources into a single unified file system,
 * attempting to resolve files from each source in order.
 */
export type EaCCompositeDistributedFileSystemDetails = {
  /** Ordered list of DFS lookups that are combined into this composite. */
  DFSLookups: string[];
} & EaCDistributedFileSystemDetails<"Composite">;

/**
 * Schema for `EaCCompositeDistributedFileSystemDetails`.
 * Ensures `Type` is explicitly `"Composite"` while extending `EaCDistributedFileSystemDetailsSchema`.
 */
export const EaCCompositeDistributedFileSystemDetailsSchema: z.ZodObject<
  {
    CacheDBLookup: z.ZodOptional<z.ZodString>;
    CacheSeconds: z.ZodOptional<z.ZodNumber>;
    DefaultFile: z.ZodOptional<z.ZodString>;
    Extensions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    UseCascading: z.ZodOptional<z.ZodBoolean>;
    WorkerPath: z.ZodOptional<z.ZodString>;
    Type: z.ZodLiteral<"Composite">;
    DFSLookups: z.ZodArray<z.ZodString>;
  },
  z.core.$strip
> = EaCDistributedFileSystemDetailsSchema.extend({
  Type: z
    .literal("Composite")
    .describe("The fixed type identifier for this DFS."),
  DFSLookups: z
    .array(z.string())
    .min(1)
    .describe(
      "Ordered list of DFS lookups that are combined into this composite.",
    ),
}).describe(
  "Schema for EaCCompositeDistributedFileSystemDetails, defining Composite-specific properties for a Distributed File System.",
);

/**
 * Type guard for `EaCCompositeDistributedFileSystemDetails`.
 * Validates if the given object conforms to the `EaCCompositeDistributedFileSystemDetails` structure.
 *
 * @param dfs - The object to validate.
 * @returns True if the object is a valid `EaCCompositeDistributedFileSystemDetails`, false otherwise.
 */
export function isEaCCompositeDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCCompositeDistributedFileSystemDetails {
  return EaCCompositeDistributedFileSystemDetailsSchema.safeParse(dfs).success;
}

/**
 * Validates and parses an object as `EaCCompositeDistributedFileSystemDetails`.
 *
 * @param dfs - The object to validate and parse.
 * @throws If the object does not conform to the `EaCCompositeDistributedFileSystemDetailsSchema`.
 * @returns The parsed `EaCCompositeDistributedFileSystemDetails` object.
 */
export function parseEaCCompositeDistributedFileSystemDetails(
  dfs: unknown,
): EaCCompositeDistributedFileSystemDetails {
  return EaCCompositeDistributedFileSystemDetailsSchema.parse(dfs);
}
