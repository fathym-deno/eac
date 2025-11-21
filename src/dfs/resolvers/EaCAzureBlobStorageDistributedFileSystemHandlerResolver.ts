import { getPackageLogger } from "./.deps.ts";
import { isEaCAzureBlobStorageDistributedFileSystemDetails } from "../_/EaCAzureBlobStorageDistributedFileSystemDetails.ts";
import { AzureBlobDFSFileHandler } from "../handlers/AzureBlobDFSFileHandler.ts";
import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";
import { DFSFileHandlerResolver } from "../handlers/DFSFileHandlerResolver.ts";

/**
 * Resolver for Azure Blob Storage Distributed File Systems (DFS).
 */
export const EaCAzureBlobStorageDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(_ioc, dfsLookup, dfs): Promise<DFSFileHandler | undefined> {
      if (!isEaCAzureBlobStorageDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCAzureBlobStorageDFSHandlerResolver.",
        );
      }

      const logger = await getPackageLogger(import.meta);

      try {
        // Directly create an instance of AzureBlobDFSFileHandler
        return new AzureBlobDFSFileHandler(dfsLookup, dfs);
      } catch (err) {
        logger.error("Error initializing Azure Blob Storage DFS handler", {
          err,
        });
        throw err;
      }
    },
  };
