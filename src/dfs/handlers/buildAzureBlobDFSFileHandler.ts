import { BlobServiceClient } from "npm:@azure/storage-blob@12.26.0";
import { getFileCheckPathsToProcess, withDFSCache } from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

export const buildAzureBlobDFSFileHandler = (
  containerClient: ReturnType<BlobServiceClient["getContainerClient"]>,
  fileRoot: string,
): DFSFileHandler => {
  return {
    async GetFileInfo(
      filePath: string,
      revision: string,
      defaultFileName?: string,
      extensions?: string[],
      useCascading?: boolean,
      cacheDb?: Deno.Kv,
      cacheSeconds?: number,
    ): Promise<DFSFileInfo | undefined> {
      let finalFilePath = filePath;

      return await withDFSCache(
        finalFilePath,
        async () => {
          // Get all possible paths to check
          const fileCheckPaths = getFileCheckPathsToProcess(
            filePath,
            defaultFileName,
            extensions,
            useCascading,
          );

          for (const checkPath of fileCheckPaths) {
            const fullPath = fileRoot ? `${fileRoot}/${checkPath}` : checkPath;
            const blobClient = containerClient.getBlobClient(fullPath);

            try {
              const properties = await blobClient.getProperties();
              finalFilePath = checkPath;

              return {
                Path: finalFilePath,
                Headers: {
                  "last-modified": properties.lastModified?.toISOString() || "",
                  "content-length": properties.contentLength?.toString() || "0",
                },
                Contents: (await blobClient.download()).readableStreamBody!,
              };
              // deno-lint-ignore no-explicit-any
            } catch (error: any) {
              if (error.statusCode !== 404) {
                throw error;
              }
            }
          }

          return undefined;
        },
        revision,
        cacheDb,
        cacheSeconds,
      );
    },

    async LoadAllPaths(_revision: string) {
      const filePaths: string[] = [];

      for await (const blob of containerClient.listBlobsFlat()) {
        if (fileRoot && !blob.name.startsWith(fileRoot)) continue;
        filePaths.push(blob.name);
      }

      return filePaths.map((filePath) =>
        fileRoot && filePath.startsWith(fileRoot)
          ? filePath.replace(fileRoot, "")
          : filePath
      );
    },

    get Root(): string {
      return fileRoot;
    },

    async RemoveFile(filePath: string, _revision: string, _cacheDb?: Deno.Kv) {
      const fullPath = fileRoot ? `${fileRoot}/${filePath}` : filePath;
      const blobClient = containerClient.getBlobClient(fullPath);
      await blobClient.deleteIfExists();
    },

    async WriteFile(
      filePath: string,
      _revision: string,
      stream: ReadableStream<Uint8Array>,
      _ttlSeconds?: number,
      _headers?: Headers,
      _maxChunkSize = 8000,
      _cacheDb?: Deno.Kv,
    ) {
      const fullPath = fileRoot ? `${fileRoot}/${filePath}` : filePath;
      const blockBlobClient = containerClient.getBlockBlobClient(fullPath);
      await blockBlobClient.uploadStream(stream);
    },
  };
};
