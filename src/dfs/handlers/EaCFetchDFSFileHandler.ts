import {
  BaseFetchDFSFileHandler,
  BaseFetchDFSFileHandlerDetails,
  DFSFileInfo,
} from "./.deps.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { withDFSCache } from "../utils/withDFSCache.ts";
import { IEaCDFSFileHandler } from "./IEaCDFSFileHandler.ts";

/**
 * EaC Fetch DFS File Handler (Abstract).
 * Composes `FetchDFSFileHandler` from `@fathym/dfs` with revision and caching support.
 * Subclasses must provide the concrete base handler implementation.
 */
export abstract class EaCFetchDFSFileHandler<
  TDetails extends EaCDistributedFileSystemDetails,
> implements IEaCDFSFileHandler {
  /**
   * The base fetch handler from @fathym/dfs that handles the actual fetching.
   * Subclasses must initialize this with the appropriate concrete handler.
   */
  protected abstract readonly baseHandler: BaseFetchDFSFileHandler<
    BaseFetchDFSFileHandlerDetails
  >;

  public get Root(): string {
    return this.baseHandler.Root;
  }

  public constructor(
    protected readonly dfsLookup: string,
    protected readonly details: TDetails,
  ) {}

  /**
   * Retrieves file information via HTTP(S) or file fetching.
   * Delegates to base handler and wraps with caching.
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

  /**
   * Fetch-based DFS does not support listing all paths.
   * Delegates to base handler which throws `Deno.errors.NotSupported`.
   */
  public async LoadAllPaths(_revision: string): Promise<string[]> {
    return this.baseHandler.LoadAllPaths();
  }

  /**
   * Fetch-based DFS does not support file removal.
   * Delegates to base handler which throws `Deno.errors.NotSupported`.
   */
  public async RemoveFile(
    filePath: string,
    _revision: string,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    return this.baseHandler.RemoveFile(filePath);
  }

  /**
   * Fetch-based DFS does not support writing files.
   * Delegates to base handler which throws `Deno.errors.NotSupported`.
   */
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
