import {
  EaCDistributedFileSystemDetails,
  isEaCDistributedFileSystemDetails,
} from "./EaCDistributedFileSystemDetails.ts";

export type EaCAzureBlobStorageDistributedFileSystemDetails = {
  /**
   * The Azure Storage connection string for authentication.
   */
  ConnectionString: string;

  /**
   * The name of the Azure Blob Storage container.
   */
  Container: string;

  /**
   * The root path in the Azure Blob Storage container.
   */
  FileRoot?: string;
} & EaCDistributedFileSystemDetails<"AzureBlobStorage">;

export function isEaCAzureBlobStorageDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCAzureBlobStorageDistributedFileSystemDetails {
  const x = dfs as EaCAzureBlobStorageDistributedFileSystemDetails;

  return (
    isEaCDistributedFileSystemDetails("AzureBlobStorage", x) &&
    x.ConnectionString !== undefined &&
    typeof x.ConnectionString === "string" &&
    x.Container !== undefined &&
    typeof x.Container === "string"
  );
}
