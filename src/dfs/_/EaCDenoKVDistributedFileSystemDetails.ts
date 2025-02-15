import { z } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemDetailsSchema,
} from "./EaCDistributedFileSystemDetails.ts";

/**
 * Represents details for a Deno KV-backed Distributed File System (DFS) in Everything as Code (EaC).
 *
 * This type extends `EaCDistributedFileSystemDetails` with Deno KV-specific properties.
 */
export type EaCDenoKVDistributedFileSystemDetails = {
  /** The lookup key for the database. */
  DatabaseLookup: string;

  /** The root path for file storage. */
  FileRoot: string;

  /** The segment path within the DFS. */
  SegmentPath?: string;

  /** The root key used for Deno KV storage. */
  RootKey: Deno.KvKey;
} & EaCDistributedFileSystemDetails<"DenoKV">;

/**
 * Schema for `EaCDenoKVDistributedFileSystemDetails`.
 * Ensures `Type` is explicitly `"DenoKV"` while extending `EaCDistributedFileSystemDetailsSchema`.
 */
export const EaCDenoKVDistributedFileSystemDetailsSchema: z.ZodObject<{
  Type: z.ZodLiteral<"DenoKV">;
  DatabaseLookup: z.ZodString;
  FileRoot: z.ZodString;
  SegmentPath: z.ZodOptional<z.ZodString>;
  RootKey: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
}> = EaCDistributedFileSystemDetailsSchema.extend({
  Type: z.literal("DenoKV").describe("The fixed type identifier for this DFS."),
  DatabaseLookup: z.string().describe("The lookup key for the database."),
  FileRoot: z.string().describe("The root path for file storage."),
  SegmentPath: z
    .string()
    .optional()
    .describe("The segment path within the DFS."),
  RootKey: z
    .array(z.union([z.string(), z.number()]))
    .describe("The root key used for Deno KV storage."),
}).describe(
  "Schema for EaCDenoKVDistributedFileSystemDetails, defining Deno KV-specific properties for a Distributed File System.",
);

/**
 * Type guard for `EaCDenoKVDistributedFileSystemDetails`.
 * Validates if the given object conforms to the `EaCDenoKVDistributedFileSystemDetails` structure.
 *
 * @param dfs - The object to validate.
 * @returns True if the object is a valid `EaCDenoKVDistributedFileSystemDetails`, false otherwise.
 */
export function isEaCDenoKVDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCDenoKVDistributedFileSystemDetails {
  return EaCDenoKVDistributedFileSystemDetailsSchema.safeParse(dfs).success;
}

/**
 * Validates and parses an object as `EaCDenoKVDistributedFileSystemDetails`.
 *
 * @param dfs - The object to validate and parse.
 * @throws If the object does not conform to the `EaCDenoKVDistributedFileSystemDetailsSchema`.
 * @returns The parsed `EaCDenoKVDistributedFileSystemDetails` object.
 */
export function parseEaCDenoKVDistributedFileSystemDetails(
  dfs: unknown,
): EaCDenoKVDistributedFileSystemDetails {
  return EaCDenoKVDistributedFileSystemDetailsSchema.parse(dfs);
}
