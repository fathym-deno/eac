import {
  DFSFileHandler,
  DFSFileHandlerResolver,
  getPackageLogger,
  isEaCAzureBlobStorageDistributedFileSystemDetails,
  path,
} from "./.deps.ts";

import { BlobServiceClient } from "npm:@azure/storage-blob@12.26.0";

export const EaCAzureBlobStorageDFSHandlerResolver: DFSFileHandlerResolver = {
  async Resolve(_ioc, dfs): Promise<DFSFileHandler | undefined> {
    if (!isEaCAzureBlobStorageDistributedFileSystemDetails(dfs)) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCAzureBlobStorageDFSHandlerResolver.",
      );
    }

    const loadHandler = async () => {
      const logger = await getPackageLogger(import.meta);

      // Initialize Azure Blob Storage client
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        dfs.ConnectionString,
      );
      const containerClient = blobServiceClient.getContainerClient(
        dfs.Container,
      );

      const handler: DFSFileHandler = {
        get Root() {
          return dfs.FileRoot || "";
        },

        async GetFileInfo(
          filePath: string,
          _revision: string,
          defaultFileName?: string,
          extensions?: string[],
          useCascading?: boolean,
          cacheDb?: Deno.Kv,
          cacheSeconds?: number,
        ) {
          const fullPath = path.join(dfs.FileRoot || "", filePath);
          const blobClient = containerClient.getBlobClient(fullPath);

          try {
            const properties = await blobClient.getProperties();

            return {
              Path: fullPath,
              Headers: {
                "last-modified": properties.lastModified?.toISOString() || "",
                "content-length": properties.contentLength?.toString() || "0",
              },
              Contents: (await blobClient.download()).readableStreamBody,
            };
            // deno-lint-ignore no-explicit-any
          } catch (error: any) {
            if (error.statusCode === 404) {
              return undefined; // File does not exist
            }
            logger.error(`Error retrieving file info: ${fullPath}`, error);
            throw error;
          }
        },

        async LoadAllPaths(_revision: string) {
          const filePaths: string[] = [];

          try {
            for await (const blob of containerClient.listBlobsFlat()) {
              if (dfs.FileRoot && !blob.name.startsWith(dfs.FileRoot)) continue;
              filePaths.push(blob.name);
            }

            return filePaths.map((filePath) =>
              dfs.FileRoot && filePath.startsWith(dfs.FileRoot)
                ? filePath.replace(dfs.FileRoot, "")
                : filePath
            );
          } catch (error) {
            logger.error("Error listing blob storage paths", error);
            throw error;
          }
        },

        async RemoveFile(
          filePath: string,
          _revision: string,
          _cacheDb?: Deno.Kv,
        ) {
          const fullPath = path.join(dfs.FileRoot || "", filePath);
          const blobClient = containerClient.getBlobClient(fullPath);

          try {
            await blobClient.deleteIfExists();
          } catch (error) {
            logger.error(`Error removing file: ${fullPath}`, error);
            throw error;
          }
        },

        async WriteFile(
          filePath: string,
          _revision: string,
          stream: ReadableStream<Uint8Array>,
          ttlSeconds?: number,
          headers?: Headers,
          maxChunkSize?: number,
          cacheDb?: Deno.Kv,
        ) {
          const fullPath = path.join(dfs.FileRoot || "", filePath);
          const blockBlobClient = containerClient.getBlockBlobClient(fullPath);

          try {
            await blockBlobClient.uploadStream(stream);
          } catch (error) {
            logger.error(`Error writing file: ${fullPath}`, error);
            throw error;
          }
        },
      };

      return handler;
    };

    let handler = await loadHandler();

    setInterval(() => {
      const work = async () => {
        handler = await loadHandler();
      };
      work();
    }, 60 * 1000);

    return handler;
  },
};
