import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "npm:@azure/storage-blob@12.26.0";
import { getFileCheckPathsToProcess, withDFSCache } from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

export const buildAzureBlobDFSFileHandler = (
  connectionString: string,
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
          const fileCheckPaths = getFileCheckPathsToProcess(
            filePath,
            defaultFileName,
            extensions,
            useCascading,
          );
          const fileChecks: Promise<{
            path: string;
            exists: boolean;
            info?: DFSFileInfo;
          }>[] = [];

          fileCheckPaths.forEach((checkPath) => {
            const fullPath = fileRoot
              ? `${fileRoot}${checkPath}`.slice(2).replace("//", "/")
              : checkPath;
            const blobClient = containerClient.getBlobClient(fullPath);

            fileChecks.push(
              (async () => {
                try {
                  // **Fast Existence Check**
                  // if (!(await blobClient.exists())) {
                  //   return { path: checkPath, exists: false };
                  // }

                  // **Directly Download Contents Without Metadata**
                  const sasToken = getSasToken(
                    connectionString,
                    containerClient.containerName,
                    blobClient.name,
                  );

                  // const resp = await fetch(`${blobClient.url}?${sasToken}`);
                  const resp = await fetch(blobClient.url);

                  if (!resp.ok) {
                    return { path: checkPath, exists: false };
                  }

                  return {
                    path: checkPath,
                    exists: true,
                    info: {
                      Path: checkPath,
                      Headers: {
                        // 'content-length':
                        //   downloadResponse.contentLength?.toString() || '0',
                      },
                      Contents: resp.body!,
                    },
                  };
                  // deno-lint-ignore no-explicit-any
                } catch (error: any) {
                  if (error.statusCode === 404) {
                    return { path: checkPath, exists: false };
                  }
                  throw error;
                }
              })(),
            );
          });

          const fileResults = await Promise.all(fileChecks);
          const foundFile = fileResults.find((res) => res.exists);

          if (foundFile) {
            finalFilePath = foundFile.path;
            return foundFile.info;
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
      const fullPath = fileRoot
        ? `${fileRoot}${filePath}`.slice(2).replace("//", "/")
        : filePath;
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
      const fullPath = fileRoot
        ? `${fileRoot}${filePath}`.slice(2).replace("//", "/")
        : filePath;
      const blockBlobClient = containerClient.getBlockBlobClient(fullPath);
      await blockBlobClient.uploadStream(stream);
    },
  };
};

function parseConnectionString(connectionString: string) {
  const matches = connectionString.match(
    /AccountName=([^;]+);AccountKey=([^;]+)/,
  );
  if (!matches) {
    throw new Error("Invalid Azure Storage connection string format.");
  }

  return {
    accountName: matches[1],
    accountKey: matches[2],
  };
}

async function getSasToken(
  connectionString: string,
  containerName: string,
  blobName: string,
  expiryMinutes = 60,
): Promise<string> {
  const { accountName, accountKey } = parseConnectionString(connectionString);

  // ✅ Create a shared key credential
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey,
  );

  // ✅ Define permissions (read-only access)
  const permissions = new BlobSASPermissions();
  permissions.read = true;

  // ✅ Generate SAS token
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions,
      expiresOn: new Date(new Date().valueOf() + expiryMinutes * 60 * 1000), // 1 hour expiry
    },
    sharedKeyCredential,
  ).toString();

  return sasToken;
}
