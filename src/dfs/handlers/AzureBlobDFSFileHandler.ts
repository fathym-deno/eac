import { BaseAzureBlobDFSFileHandler, type DFSFileInfo } from "./.deps.ts";
import { EaCAzureBlobStorageDistributedFileSystemDetails } from "../_/EaCAzureBlobStorageDistributedFileSystemDetails.ts";
import { withDFSCache } from "../utils/withDFSCache.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";

/**
 * EaC wrapper for Azure Blob Storage DFS handler.
 * Adds revision and caching support on top of the base handler.
 */
export class AzureBlobDFSFileHandler
  extends DFSFileHandler<EaCAzureBlobStorageDistributedFileSystemDetails> {
  private readonly baseHandler: BaseAzureBlobDFSFileHandler;

  public get Root(): string {
    return this.baseHandler.Root;
  }

  public constructor(
    dfsLookup: string,
    details: EaCAzureBlobStorageDistributedFileSystemDetails,
  ) {
    super(dfsLookup, details);

    this.baseHandler = new BaseAzureBlobDFSFileHandler({
      ConnectionString: details.ConnectionString,
      Container: details.Container,
      FileRoot: details.FileRoot,
      DefaultFile: details.DefaultFile,
      Extensions: details.Extensions,
      UseCascading: details.UseCascading,
    });
  }

  /**
   * Retrieves file information with caching support.
   */
  public async GetFileInfo(
    filePath: string,
    revision: string,
    defaultFileName?: string,
    extensions?: string[],
    useCascading?: boolean,
    cacheDb?: Deno.Kv,
    cacheSeconds?: number,
  ): Promise<DFSFileInfo | undefined> {
    return await withDFSCache(
      filePath,
      async () => {
        return this.baseHandler.GetFileInfo(
          filePath,
          defaultFileName,
          extensions,
          useCascading,
        );
      },
      revision,
      cacheDb,
      cacheSeconds,
    );
  }

  /**
   * Returns all file paths.
   */
  public async LoadAllPaths(_revision: string): Promise<string[]> {
    return this.baseHandler.LoadAllPaths();
  }

  /**
   * Removes a file.
   */
  public async RemoveFile(
    filePath: string,
    _revision: string,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    return this.baseHandler.RemoveFile(filePath);
  }

  /**
   * Writes a file.
   */
  public async WriteFile(
    filePath: string,
    _revision: string,
    stream: ReadableStream<Uint8Array>,
    ttlSeconds?: number,
    headers?: Headers,
    maxChunkSize = 8000,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    return this.baseHandler.WriteFile(
      filePath,
      stream,
      ttlSeconds,
      headers,
      maxChunkSize,
    );
  }
}
