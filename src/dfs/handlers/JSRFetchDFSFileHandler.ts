import {
  EaCDistributedFileSystemAsCode,
  EaCJSRDistributedFileSystemDetails,
  getPackageLogger,
  path,
} from "./.deps.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";
import { FetchDFSFileHandler } from "./FetchDFSFileHandler.ts";

/**
 * Specialized DFS handler for JSR-backed file systems.
 * Handles version resolution and file retrieval from jsr.io.
 */
export class JSRFetchDFSFileHandler extends FetchDFSFileHandler {
  private initialize: Promise<void>;
  private modulePaths: string[] = [];

  protected get detailsJSR(): EaCJSRDistributedFileSystemDetails {
    return this.dfs.Details as EaCJSRDistributedFileSystemDetails;
  }

  public override get Root(): string {
    return this.detailsJSR
      ? new URL(
        `${this.detailsJSR.Version}/`,
        new URL(`${this.detailsJSR.Package}/`, "https://jsr.io/"),
      ).href
      : "";
  }

  constructor(dfsLookup: string, dfs: EaCDistributedFileSystemAsCode) {
    super(dfsLookup, dfs);

    this.initialize = this.initializeModulePaths();
  }

  /**
   * Retrieves file information but only for valid JSR-resolved paths.
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
      path.join(this.detailsJSR.FileRoot || "", filePath),
      revision,
      defaultFileName,
      extensions,
      useCascading,
      cacheDb,
      cacheSeconds,
    );

    if (fileInfo) {
      fileInfo.ImportPath = fileInfo?.Path;

      if (this.detailsJSR.FileRoot) {
        fileInfo.Path = fileInfo.Path.slice(
          this.detailsJSR.FileRoot.length - 1,
        );
      }
    }

    if (!fileInfo || !this.modulePaths.includes(fileInfo.Path)) {
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
    return super.RemoveFile(
      path.join(this.detailsJSR.FileRoot || "", filePath),
      revision,
      cacheDb,
    );
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
    maxChunkSize?: number,
    cacheDb?: Deno.Kv,
  ): Promise<void> {
    await this.initialize;
    return super.WriteFile(
      path.join(this.detailsJSR.FileRoot || "", filePath),
      revision,
      stream,
      ttlSeconds,
      headers,
      maxChunkSize,
      cacheDb,
    );
  }

  /**
   * Ensures the JSR package exists before resolving the version.
   * If the package is invalid, an error is thrown.
   */
  protected async checkPackageExists(): Promise<void> {
    const metaPath = new URL(
      `meta.json`,
      new URL(`${this.detailsJSR.Package}/`, "https://jsr.io/"),
    );
    const metaResp = await fetch(metaPath);

    if (!metaResp.ok) {
      await metaResp.body?.cancel();

      throw new Error(
        `Package "${this.detailsJSR.Package}" does not exist or is unavailable.`,
      );
    }

    await metaResp.text();
  }

  /**
   * Initializes the module paths by analyzing the JSR package manifest.
   * This is computed once in the constructor.
   */
  protected async initializeModulePaths(): Promise<void> {
    await this.checkPackageExists();

    await this.resolveVersion();

    const logger = await getPackageLogger(import.meta);
    const metaPath = `${this.Root.slice(0, -1)}_meta.json`;

    try {
      const metaResp = await fetch(metaPath);
      const meta = (await metaResp.json()) as {
        manifest: { [filePath: string]: unknown };
      };

      this.modulePaths = Object.keys(meta.manifest)
        .filter((fp) =>
          this.detailsJSR.FileRoot
            ? fp.startsWith(this.detailsJSR.FileRoot)
            : true
        )
        .map((fp) =>
          this.detailsJSR.FileRoot
            ? fp.slice(this.detailsJSR.FileRoot!.length - 1)
            : fp
        );
    } catch (err) {
      logger.error(`Error loading paths from ${metaPath}`);
      throw err;
    }
  }

  /**
   * Ensures the correct version of the JSR package is resolved.
   * Fetches the latest version if none is provided.
   */
  protected async resolveVersion(): Promise<void> {
    if (!this.detailsJSR.Version) {
      const metaPath = new URL(
        `meta.json`,
        new URL(`${this.detailsJSR.Package}/`, "https://jsr.io/"),
      );
      const metaResp = await fetch(metaPath);

      const meta = (await metaResp.json()) as { latest: string };
      this.detailsJSR.Version = meta.latest;
    }
  }
}
