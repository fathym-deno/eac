import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "npm:@azure/storage-blob@12.26.0";
import { Readable } from "node:stream";
import { Buffer } from "node:buffer";
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
  private initialize: Promise<void>;
  private blobPaths: string[] = [];

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

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      connectionString,
    );
    this.containerClient = blobServiceClient.getContainerClient(containerName);

    // Prefetch blob list at startup
    this.initialize = this.initializeBlobList();
  }

  /**
   * Retrieves file information but only if it exists in the blob list.
   * @returns A `DFSFileInfo` object if found, otherwise `undefined`.
   */ public async GetFileInfo(
    filePath: string,
    revision: string,
    defaultFileName?: string,
    extensions?: string[],
    useCascading?: boolean,
    cacheDb?: Deno.Kv,
    cacheSeconds?: number,
  ): Promise<DFSFileInfo | undefined> {
    await this.initialize;

    // Ensure requested file exists in the blob list
    if (!this.blobPaths.includes(filePath)) {
      return undefined;
    }

    return await withDFSCache(
      filePath,
      async () => {
        const fileCheckPaths = getFileCheckPathsToProcess(
          filePath,
          defaultFileName,
          extensions,
          useCascading,
        );

        for (const checkPath of fileCheckPaths) {
          const fullPath = this.formatPath(checkPath);
          const blobClient = this.containerClient.getBlobClient(fullPath);

          try {
            const response = await fetch(blobClient.url);

            if (response.ok && response.body) {
              // ✅ Ensure proper ReadableStream handling
              const stream = new ReadableStream<Uint8Array>({
                start(controller) {
                  (async () => {
                    try {
                      const reader = response.body!.getReader();
                      let done = false;
                      while (!done) {
                        const { value, done: readDone } = await reader.read();
                        if (readDone) break;
                        if (value) controller.enqueue(value);
                      }
                      controller.close();
                    } catch (err) {
                      controller.error(err);
                    }
                  })();
                },
              });

              return {
                Path: checkPath,
                Headers: this.extractHeaders(response),
                Contents: stream,
              };
            } else if (response.body) {
              await response.body?.cancel();
            }
          } catch (error) {
            console.error(`Failed to fetch file: ${fullPath}`, error);
          }
        }

        return undefined;
      },
      revision,
      cacheDb,
      cacheSeconds,
    );
  }

  /**
   * Returns the preloaded list of file paths.
   */
  public async LoadAllPaths(_revision: string): Promise<string[]> {
    await this.initialize;
    return this.blobPaths;
  }

  /**
   * Deletes a file from blob storage.
   */
  public async RemoveFile(
    filePath: string,
    _revision: string,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    const fullPath = this.formatPath(filePath);

    const blobClient = this.containerClient.getBlobClient(fullPath);

    await blobClient.deleteIfExists();

    this.blobPaths = this.blobPaths.filter((p) => p !== filePath);
  }

  /**
   * Writes a file to Azure Blob Storage.
   */
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

    // Convert Deno ReadableStream to Node.js Readable Stream
    const nodeStream = this.convertToNodeReadable(stream);

    // Upload the Node.js readable stream to Azure Blob Storage
    await blockBlobClient.uploadStream(nodeStream);

    if (!this.blobPaths.includes(filePath)) {
      this.blobPaths.push(filePath);
    }
  }

  /**
   * Converts a Deno ReadableStream<Uint8Array> into a Node.js Readable stream.
   */
  protected convertToNodeReadable(
    stream: ReadableStream<Uint8Array>,
  ): Readable {
    const reader = stream.getReader();

    return Readable.from(
      (async function* () {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          yield Buffer.from(value); // Convert Uint8Array to Buffer
        }
      })(),
    );
  }

  /**
   * Loads all paths from Azure Blob Storage once at startup.
   */
  private async initializeBlobList(): Promise<void> {
    const filePaths: string[] = [];

    for await (const blob of this.containerClient.listBlobsFlat()) {
      if (this.Root && !blob.name.startsWith(this.Root)) continue;
      filePaths.push(`${blob.name.slice(this.Root.length)}`);
    }

    this.blobPaths = filePaths.map((filePath) =>
      this.Root && filePath.startsWith(this.Root)
        ? filePath.replace(this.Root, "")
        : filePath
    );
  }

  /**
   * Formats the file path correctly.
   */
  private formatPath(filePath: string): string {
    return this.Root ? `${this.Root}${filePath}`.replace("//", "/") : filePath;
  }

  /**
   * Parses the connection string for storage credentials.
   */
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

  /**
   * Generates a SAS token for secure access.
   */
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
