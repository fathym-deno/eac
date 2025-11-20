import { denoGraph, EaCDistributedFileSystemAsCode, EaCESMDistributedFileSystemDetails, loadDenoConfig, path } from "./.deps.ts";
import { FetchDFSFileHandler } from "./FetchDFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

/**
 * Implements `DFSFileHandler` for ESM-based file systems.
 */
export class ESMFetchDFSFileHandler extends FetchDFSFileHandler<EaCESMDistributedFileSystemDetails> {
  private initialize: Promise<void>;
  private modulePaths: string[] = [];

  public override get Root(): string {
    return this.details?.Root;
  }

  /**
   * Creates an instance of `ESMFetchDFSFileHandler`.
   * @param root - The root URL for the module.
   * @param entryPoints - The entry points to analyze.
   * @param includeDependencies - Whether to include dependencies in file resolution.
   */
  public constructor(
    dfsLookup: string,
    details: EaCESMDistributedFileSystemDetails,
  ) {
    super(dfsLookup, details);

    if (!this.details.EntryPoints?.length) {
      throw new Error("No entry points provided.");
    }

    this.initialize = this.initializeModulePaths();
  }

  /**
   * Retrieves file information but only for valid ESM-resolved paths.
   * @returns A `DFSFileInfo` object if found, otherwise `undefined`.
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
    await this.initialize;

    // Otherwise, fetch as normal
    const fileInfo = await super.GetFileInfo(
      filePath,
      revision,
      defaultFileName,
      extensions,
      useCascading,
      cacheDb,
      cacheSeconds,
    );

    if (!fileInfo || !this.modulePaths.includes(fileInfo.Path)) {
      fileInfo?.Contents?.cancel();

      return undefined;
    }

    return fileInfo;
  }

  /**
   * Returns the cached module paths.
   */
  public override async LoadAllPaths(_revision: string): Promise<string[]> {
    await this.initialize;
    return this.modulePaths;
  }

  /**
   * Fetch-based DFS does not support file removal.
   * @throws `Deno.errors.NotSupported`
   */
  public override async RemoveFile(
    filePath: string,
    revision: string,
    cacheDb?: Deno.Kv,
  ): Promise<void> {
    await this.initialize;
    return super.RemoveFile(filePath, revision, cacheDb);
  }

  /**
   * Fetch-based DFS does not support writing files.
   * @throws `Deno.errors.NotSupported`
   */
  public override async WriteFile(
    filePath: string,
    revision: string,
    stream: ReadableStream<Uint8Array>,
    ttlSeconds?: number,
    headers?: Headers,
    maxChunkSize = 8000,
    cacheDb?: Deno.Kv,
  ): Promise<void> {
    await this.initialize;
    return super.WriteFile(
      filePath,
      revision,
      stream,
      ttlSeconds,
      headers,
      maxChunkSize,
      cacheDb,
    );
  }

  /**
   * Initializes the module paths by analyzing the module graph.
   * This is computed once in the constructor.
   */
  private async initializeModulePaths(): Promise<void> {
    if (this.modulePaths.length > 0) return;

    let resolvedRoot = await this.resolveRoot();

    // Resolve entry points relative to the root
    const roots = this.details.EntryPoints.map((ep) => new URL(ep, resolvedRoot).href);

    // Generate dependency graph
    const graph = await denoGraph.createGraph(roots, {});
    const modules = graph.modules.map((m) => m.specifier);

    this.modulePaths = modules
      .filter((specifier) =>
        // this.includeDependencies ||
        specifier.startsWith(resolvedRoot)
      )
      .map((specifier) => {
        // if (!this.includeDependencies) {
        let filePath = specifier.replace(resolvedRoot, "");
        if (filePath.startsWith("/")) {
          filePath = filePath.substring(1);
        }
        return `/${filePath}`;
        // }
        // return specifier;
      });
  }

  /**
   * Resolves the root path, handling import maps and local paths.
   */
  protected async resolveRoot(): Promise<string> {
    let resolvedRoot = this.Root;

    // Load and resolve import maps
    const { Config: denoCfg } = await loadDenoConfig();
    const importKeys = Object.keys(denoCfg.imports || {});

    if (
      importKeys.some(
        (imp) => imp.endsWith("/") && resolvedRoot.startsWith(imp),
      )
    ) {
      const importRoot = importKeys.find(
        (imp) => imp.endsWith("/") && resolvedRoot.startsWith(imp),
      )!;
      resolvedRoot = denoCfg.imports![importRoot] +
        resolvedRoot.replace(importRoot, "");
    }

    // Ensure proper resolution of local paths
    if (resolvedRoot.startsWith("./") || resolvedRoot.startsWith("../")) {
      resolvedRoot = `file:///${path.resolve(Deno.cwd(), resolvedRoot)}\\`;
    }

    return resolvedRoot;
  }
}
