import { BaseJSRFetchDFSFileHandler, DFSFileInfo } from "./.deps.ts";
import { EaCJSRDistributedFileSystemDetails } from "../_/EaCJSRDistributedFileSystemDetails.ts";
import { withDFSCache } from "../utils/withDFSCache.ts";
import { EaCFetchDFSFileHandler } from "./EaCFetchDFSFileHandler.ts";

/**
 * EaC JSR Fetch DFS File Handler.
 * Composes `JSRFetchDFSFileHandler` from `@fathym/dfs` with revision and caching support.
 */
export class EaCJSRFetchDFSFileHandler
  extends EaCFetchDFSFileHandler<EaCJSRDistributedFileSystemDetails> {
  protected readonly baseHandler: BaseJSRFetchDFSFileHandler;

  public constructor(
    dfsLookup: string,
    details: EaCJSRDistributedFileSystemDetails,
  ) {
    super(dfsLookup, details);

    // Delegate to base handler from @fathym/dfs
    this.baseHandler = new BaseJSRFetchDFSFileHandler({
      Package: details.Package,
      Version: details.Version,
      FileRoot: details.FileRoot,
    });
  }

  /**
   * Override GetFileInfo to ensure caching wraps the base handler's JSR-specific logic.
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
