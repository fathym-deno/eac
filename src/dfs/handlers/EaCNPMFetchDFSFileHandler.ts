import { BaseNPMFetchDFSFileHandler, DFSFileInfo } from "./.deps.ts";
import { EaCNPMDistributedFileSystemDetails } from "../_/EaCNPMDistributedFileSystemDetails.ts";
import { withDFSCache } from "../utils/withDFSCache.ts";
import { EaCFetchDFSFileHandler } from "./EaCFetchDFSFileHandler.ts";

/**
 * EaC NPM Fetch DFS File Handler.
 * Composes `NPMFetchDFSFileHandler` from `@fathym/dfs` with revision and caching support.
 */
export class EaCNPMFetchDFSFileHandler
  extends EaCFetchDFSFileHandler<EaCNPMDistributedFileSystemDetails> {
  protected readonly baseHandler: BaseNPMFetchDFSFileHandler;

  public constructor(
    dfsLookup: string,
    details: EaCNPMDistributedFileSystemDetails,
  ) {
    super(dfsLookup, details);

    // Delegate to base handler from @fathym/dfs
    this.baseHandler = new BaseNPMFetchDFSFileHandler({
      Package: details.Package,
      Version: details.Version,
    });
  }

  /**
   * Override GetFileInfo to ensure caching wraps the base handler's NPM/Skypack-specific logic.
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
}
