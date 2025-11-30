import { BaseESMFetchDFSFileHandler, DFSFileInfo } from "./.deps.ts";
import { EaCESMDistributedFileSystemDetails } from "../_/EaCESMDistributedFileSystemDetails.ts";
import { withDFSCache } from "../utils/withDFSCache.ts";
import { EaCFetchDFSFileHandler } from "./EaCFetchDFSFileHandler.ts";

/**
 * EaC ESM Fetch DFS File Handler.
 * Composes `ESMFetchDFSFileHandler` from `@fathym/dfs` with revision and caching support.
 */
export class EaCESMFetchDFSFileHandler
  extends EaCFetchDFSFileHandler<EaCESMDistributedFileSystemDetails> {
  protected readonly baseHandler: BaseESMFetchDFSFileHandler;

  public constructor(
    dfsLookup: string,
    details: EaCESMDistributedFileSystemDetails,
  ) {
    super(dfsLookup, details);

    // Delegate to base handler from @fathym/dfs
    this.baseHandler = new BaseESMFetchDFSFileHandler({
      Root: details.Root,
      EntryPoints: details.EntryPoints,
    });
  }

  /**
   * Override GetFileInfo to ensure caching wraps the base handler's ESM-specific logic.
   */
  public override async GetFileInfo(
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
   * Returns the cached module paths from the base handler.
   */
  public override async LoadAllPaths(_revision: string): Promise<string[]> {
    return this.baseHandler.LoadAllPaths();
  }
}
