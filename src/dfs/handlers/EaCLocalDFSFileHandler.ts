import { BaseLocalDFSFileHandler, DFSFileInfo } from "./.deps.ts";
import { EaCLocalDistributedFileSystemDetails } from "../_/EaCLocalDistributedFileSystemDetails.ts";
import { withDFSCache } from "../utils/withDFSCache.ts";
import { IEaCDFSFileHandler } from "./IEaCDFSFileHandler.ts";

/**
 * EaC Local DFS File Handler.
 * Composes `LocalDFSFileHandler` from `@fathym/dfs` with revision and caching support.
 */
export class EaCLocalDFSFileHandler implements IEaCDFSFileHandler {
  private readonly baseHandler: BaseLocalDFSFileHandler;

  public get Root(): string {
    return this.baseHandler.Root;
  }

  constructor(
    protected readonly dfsLookup: string,
    protected readonly details: EaCLocalDistributedFileSystemDetails,
    pathResolver?: (filePath: string) => string,
  ) {
    // Delegate to base handler from @fathym/dfs
    this.baseHandler = new BaseLocalDFSFileHandler(
      { FileRoot: details.FileRoot },
      pathResolver,
    );
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
    return await withDFSCache(
      filePath,
      () =>
        this.baseHandler.GetFileInfo(
          filePath,
          defaultFileName,
          extensions,
          useCascading,
        ),
      revision,
      cacheDb,
      cacheSeconds,
    );
  }

  public async LoadAllPaths(_revision: string): Promise<string[]> {
    return this.baseHandler.LoadAllPaths();
  }

  public async RemoveFile(
    filePath: string,
    _revision: string,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    return this.baseHandler.RemoveFile(filePath);
  }

  public async WriteFile(
    filePath: string,
    _revision: string,
    stream: ReadableStream<Uint8Array>,
    ttlSeconds?: number,
    headers?: Headers,
    maxChunkSize?: number,
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
