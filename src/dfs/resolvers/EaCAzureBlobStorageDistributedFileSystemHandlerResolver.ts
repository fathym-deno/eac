import {
  buildAzureBlobDFSFileHandler,
  DFSFileHandler,
  DFSFileHandlerResolver,
  getPackageLogger,
  isEaCAzureBlobStorageDistributedFileSystemDetails,
  path,
} from "./.deps.ts";

import { BlobServiceClient } from "npm:@azure/storage-blob@12.26.0";

export const EaCAzureBlobStorageDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
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
        const fileRoot = dfs.FileRoot || "";

        const handler = buildAzureBlobDFSFileHandler(containerClient, fileRoot);

        handler.LoadAllPaths = async (_revision: string) => {
          try {
            return await handler.LoadAllPaths(_revision);
          } catch (err) {
            logger.error("Error listing blob storage paths", err);
            throw err;
          }
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

      return {
        get Root() {
          return handler.Root;
        },

        GetFileInfo(
          filePath: string,
          revision: string,
          defaultFileName?: string,
          extensions?: string[],
          useCascading?: boolean,
          cacheDb?: Deno.Kv,
          cacheSeconds?: number,
        ) {
          return handler.GetFileInfo(
            path.join(dfs.FileRoot || "", filePath),
            revision,
            defaultFileName,
            extensions,
            useCascading,
            cacheDb,
            cacheSeconds,
          );
        },

        async LoadAllPaths(revision: string) {
          const allPaths = await handler.LoadAllPaths(revision);

          return allPaths.map((filePath) =>
            dfs.FileRoot && filePath.startsWith(dfs.FileRoot)
              ? filePath.replace(dfs.FileRoot, "")
              : filePath
          );
        },

        RemoveFile(filePath: string, revision: string, cacheDb?: Deno.Kv) {
          return handler.RemoveFile(
            path.join(dfs.FileRoot || "", filePath),
            revision,
            cacheDb,
          );
        },

        WriteFile(
          filePath: string,
          revision: string,
          stream: ReadableStream<Uint8Array>,
          ttlSeconds?: number,
          headers?: Headers,
          maxChunkSize?: number,
          cacheDb?: Deno.Kv,
        ) {
          return handler.WriteFile(
            path.join(dfs.FileRoot || "", filePath),
            revision,
            stream,
            ttlSeconds,
            headers,
            maxChunkSize,
            cacheDb,
          );
        },
      };
    },
  };
