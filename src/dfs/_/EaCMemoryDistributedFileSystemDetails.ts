import { z } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemDetailsSchema,
} from "./EaCDistributedFileSystemDetails.ts";

/**
 * Represents details for a Memory-backed Distributed File System (DFS) in Everything as Code (EaC).
 *
 * This type extends `EaCDistributedFileSystemDetails` with Memory-specific properties.
 * Memory DFS stores files in-memory and is useful for temporary/virtual file storage.
 */
export type EaCMemoryDistributedFileSystemDetails =
  EaCDistributedFileSystemDetails<"Memory">;

/**
 * Schema for `EaCMemoryDistributedFileSystemDetails`.
 * Ensures `Type` is explicitly `"Memory"` while extending `EaCDistributedFileSystemDetailsSchema`.
 */
export const EaCMemoryDistributedFileSystemDetailsSchema: z.ZodObject<
  {
    CacheDBLookup: z.ZodOptional<z.ZodString>;
    CacheSeconds: z.ZodOptional<z.ZodNumber>;
    DefaultFile: z.ZodOptional<z.ZodString>;
    Extensions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    UseCascading: z.ZodOptional<z.ZodBoolean>;
    WorkerPath: z.ZodOptional<z.ZodString>;
    Type: z.ZodLiteral<"Memory">;
  },
  z.core.$strip
> = EaCDistributedFileSystemDetailsSchema.extend({
  Type: z.literal("Memory").describe("The fixed type identifier for this DFS."),
}).describe(
  "Schema for EaCMemoryDistributedFileSystemDetails, defining Memory-specific properties for a Distributed File System.",
);

/**
 * Type guard for `EaCMemoryDistributedFileSystemDetails`.
 * Validates if the given object conforms to the `EaCMemoryDistributedFileSystemDetails` structure.
 *
 * @param dfs - The object to validate.
 * @returns True if the object is a valid `EaCMemoryDistributedFileSystemDetails`, false otherwise.
 */
export function isEaCMemoryDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCMemoryDistributedFileSystemDetails {
  return EaCMemoryDistributedFileSystemDetailsSchema.safeParse(dfs).success;
}

/**
 * Validates and parses an object as `EaCMemoryDistributedFileSystemDetails`.
 *
 * @param dfs - The object to validate and parse.
 * @throws If the object does not conform to the `EaCMemoryDistributedFileSystemDetailsSchema`.
 * @returns The parsed `EaCMemoryDistributedFileSystemDetails` object.
 */
export function parseEaCMemoryDistributedFileSystemDetails(
  dfs: unknown,
): EaCMemoryDistributedFileSystemDetails {
  return EaCMemoryDistributedFileSystemDetailsSchema.parse(dfs);
}
