import { DistributedFileSystemOptions } from "../_/DistributedFileSystemOptions.ts";
import {
  AzureBlobDFSFileHandler,
  DFSFileHandler,
  DFSFileHandlerResolver,
  getPackageLogger,
  isEaCAzureBlobStorageDistributedFileSystemDetails,
} from "./.deps.ts";

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
        logger.error("Error initializing Azure Blob Storage DFS handler", err);
        throw err;
      }
    },
  };
