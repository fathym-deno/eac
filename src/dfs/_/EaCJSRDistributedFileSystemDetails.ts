import { z } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemDetailsSchema,
} from "./EaCDistributedFileSystemDetails.ts";

/**
 * Represents details for a JSR-backed Distributed File System (DFS) in Everything as Code (EaC).
 *
 * This type extends `EaCDistributedFileSystemDetails` with JSR-specific properties.
 */
export type EaCJSRDistributedFileSystemDetails = {
  /** The root directory for storing JSR files. */
  FileRoot?: string;

  /** The JSR package name. */
  Package: string;

  /** The specific version of the JSR package (optional). */
  Version?: string;
} & EaCDistributedFileSystemDetails<"JSR">;

/**
 * Schema for `EaCJSRDistributedFileSystemDetails`.
 * Ensures `Type` is explicitly `"JSR"` while extending `EaCDistributedFileSystemDetailsSchema`.
 */
export const EaCJSRDistributedFileSystemDetailsSchema: z.ZodObject<
  {
    CacheDBLookup: z.ZodOptional<z.ZodString>;
    CacheSeconds: z.ZodOptional<z.ZodNumber>;
    DefaultFile: z.ZodOptional<z.ZodString>;
    Extensions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    UseCascading: z.ZodOptional<z.ZodBoolean>;
    WorkerPath: z.ZodOptional<z.ZodString>;
    Type: z.ZodLiteral<"JSR">;
    FileRoot: z.ZodOptional<z.ZodString>;
    Package: z.ZodString;
    Version: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
> = EaCDistributedFileSystemDetailsSchema.extend({
  Type: z.literal("JSR").describe("The fixed type identifier for this DFS."),
  FileRoot: z
    .string()
    .optional()
    .describe("The root directory for storing JSR files."),
  Package: z.string().describe("The JSR package name."),
  Version: z
    .string()
    .optional()
    .describe("The specific version of the JSR package."),
}).describe(
  "Schema for EaCJSRDistributedFileSystemDetails, defining JSR-specific properties for a Distributed File System.",
);

/**
 * Type guard for `EaCJSRDistributedFileSystemDetails`.
 * Validates if the given object conforms to the `EaCJSRDistributedFileSystemDetails` structure.
 *
 * @param dfs - The object to validate.
 * @returns True if the object is a valid `EaCJSRDistributedFileSystemDetails`, false otherwise.
 */
export function isEaCJSRDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCJSRDistributedFileSystemDetails {
  return EaCJSRDistributedFileSystemDetailsSchema.safeParse(dfs).success;
}

/**
 * Validates and parses an object as `EaCJSRDistributedFileSystemDetails`.
 *
 * @param dfs - The object to validate and parse.
 * @throws If the object does not conform to the `EaCJSRDistributedFileSystemDetailsSchema`.
 * @returns The parsed `EaCJSRDistributedFileSystemDetails` object.
 */
export function parseEaCJSRDistributedFileSystemDetails(
  dfs: unknown,
): EaCJSRDistributedFileSystemDetails {
  return EaCJSRDistributedFileSystemDetailsSchema.parse(dfs);
}
