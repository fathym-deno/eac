import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "npm:@azure/storage-blob@12.26.0";
import { getFileCheckPathsToProcess, withDFSCache } from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

/**
 * Implements `DFSFileHandler` for Azure Blob Storage.
 */
export class AzureBlobDFSFileHandler extends DFSFileHandler {
  private readonly containerClient: ReturnType<
    BlobServiceClient["getContainerClient"]
  >;
  private readonly connectionString: string;

  /**
   * Creates an instance of `AzureBlobDFSFileHandler` and initializes the container client.
   * @param connectionString - The Azure Storage connection string.
   * @param containerName - The name of the blob storage container.
   * @param Root - The root path within the container.
   */
  public constructor(
    connectionString: string,
    containerName: string,
    public readonly Root: string,
  ) {
    super();
    this.connectionString = connectionString;

    // Initialize the Blob Storage client and container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      connectionString,
    );
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }

  public async GetFileInfo(
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

        const fileChecks = fileCheckPaths.map(async (checkPath) => {
          const fullPath = this.formatPath(checkPath);
          const blobClient = this.containerClient.getBlobClient(fullPath);

          try {
            const resp = await fetch(blobClient.url);
            if (!resp.ok) {
              return { path: checkPath, exists: false };
            }

            return {
              path: checkPath,
              exists: true,
              info: {
                Path: checkPath,
                Headers: {},
                Contents: resp.body!,
              },
            };
          } catch (error: unknown) {
            if ((error as { statusCode?: number }).statusCode === 404) {
              return { path: checkPath, exists: false };
            }
            throw error;
          }
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
  }

  public async LoadAllPaths(_revision: string): Promise<string[]> {
    const filePaths: string[] = [];

    for await (const blob of this.containerClient.listBlobsFlat()) {
      if (this.Root && !blob.name.startsWith(this.Root)) continue;
      filePaths.push(blob.name);
    }

    return filePaths.map((filePath) =>
      this.Root && filePath.startsWith(this.Root)
        ? filePath.replace(this.Root, "")
        : filePath
    );
  }

  public async RemoveFile(
    filePath: string,
    _revision: string,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    const fullPath = this.formatPath(filePath);
    const blobClient = this.containerClient.getBlobClient(fullPath);
    await blobClient.deleteIfExists();
  }

  public async WriteFile(
    filePath: string,
    _revision: string,
    stream: ReadableStream<Uint8Array>,
    _ttlSeconds?: number,
    _headers?: Headers,
    _maxChunkSize = 8000,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    const fullPath = this.formatPath(filePath);
    const blockBlobClient = this.containerClient.getBlockBlobClient(fullPath);
    await blockBlobClient.uploadStream(stream);
  }

  // ---------------- PRIVATE METHODS ----------------

  private formatPath(filePath: string): string {
    return this.Root
      ? `${this.Root}${filePath}`.slice(2).replace("//", "/")
      : filePath;
  }

  private static parseConnectionString(connectionString: string) {
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

  private async getSasToken(
    containerName: string,
    blobName: string,
    expiryMinutes = 60,
  ): Promise<string> {
    const { accountName, accountKey } = AzureBlobDFSFileHandler
      .parseConnectionString(this.connectionString);

    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    );
    const permissions = new BlobSASPermissions();
    permissions.read = true;

    return generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions,
        expiresOn: new Date(new Date().valueOf() + expiryMinutes * 60 * 1000),
      },
      sharedKeyCredential,
    ).toString();
  }
}
