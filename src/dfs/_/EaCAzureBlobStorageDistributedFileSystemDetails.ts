import { z } from "./.deps.ts";
import { EaCDistributedFileSystemDetails, EaCDistributedFileSystemDetailsSchema } from "./EaCDistributedFileSystemDetails.ts";

/**
 * Represents details for an Azure Blob Storage-backed Distributed File System (DFS) in Everything as Code (EaC).
 *
 * This type extends `EaCDistributedFileSystemDetails` with Azure Blob Storage-specific properties.
 */
export type EaCAzureBlobStorageDistributedFileSystemDetails = {
  /** The Azure Storage connection string for authentication. */
  ConnectionString: string;

  /** The name of the Azure Blob Storage container. */
  Container: string;

  /** The root path in the Azure Blob Storage container. */
  FileRoot?: string;
} & EaCDistributedFileSystemDetails<"AzureBlobStorage">;

/**
 * Schema for `EaCAzureBlobStorageDistributedFileSystemDetails`.
 * Ensures `Type` is explicitly `"AzureBlobStorage"` while extending `EaCDistributedFileSystemDetailsSchema`.
 */
export const EaCAzureBlobStorageDistributedFileSystemDetailsSchema: z.ZodObject<
  {
    Type: z.ZodLiteral<"AzureBlobStorage">;
    ConnectionString: z.ZodString;
    Container: z.ZodString;
    FileRoot: z.ZodOptional<z.ZodString>;
  }
> = EaCDistributedFileSystemDetailsSchema.extend({
  Type: z
    .literal("AzureBlobStorage")
    .describe("The fixed type identifier for this DFS."),
  ConnectionString: z
    .string()
    .describe("The Azure Storage connection string for authentication."),
  Container: z
    .string()
    .describe("The name of the Azure Blob Storage container."),
  FileRoot: z
    .string()
    .optional()
    .describe("The root path in the Azure Blob Storage container."),
}).describe(
  "Schema for EaCAzureBlobStorageDistributedFileSystemDetails, defining Azure Blob Storage-specific properties for a Distributed File System.",
);

/**
 * Type guard for `EaCAzureBlobStorageDistributedFileSystemDetails`.
 * Validates if the given object conforms to the `EaCAzureBlobStorageDistributedFileSystemDetails` structure.
 *
 * @param dfs - The object to validate.
 * @returns True if the object is a valid `EaCAzureBlobStorageDistributedFileSystemDetails`, false otherwise.
 */
export function isEaCAzureBlobStorageDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCAzureBlobStorageDistributedFileSystemDetails {
  return EaCAzureBlobStorageDistributedFileSystemDetailsSchema.safeParse(dfs)
    .success;
}

/**
 * Validates and parses an object as `EaCAzureBlobStorageDistributedFileSystemDetails`.
 *
 * @param dfs - The object to validate and parse.
 * @throws If the object does not conform to the `EaCAzureBlobStorageDistributedFileSystemDetailsSchema`.
 * @returns The parsed `EaCAzureBlobStorageDistributedFileSystemDetails` object.
 */
export function parseEaCAzureBlobStorageDistributedFileSystemDetails(
  dfs: unknown,
): EaCAzureBlobStorageDistributedFileSystemDetails {
  return EaCAzureBlobStorageDistributedFileSystemDetailsSchema.parse(dfs);
}
