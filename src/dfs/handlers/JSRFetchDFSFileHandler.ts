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
export class JSRFetchDFSFileHandler
  extends FetchDFSFileHandler<EaCJSRDistributedFileSystemDetails> {
  private initialize: Promise<void>;
  private modulePaths: string[] = [];

  public override get Root(): string {
    return this.details
      ? new URL(
        `${this.details.Version}/`,
        new URL(`${this.details.Package}/`, "https://jsr.io/"),
      ).href
      : "";
  }

  constructor(dfsLookup: string, details: EaCJSRDistributedFileSystemDetails) {
    super(dfsLookup, details);

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
      path.join(this.details.FileRoot || "", filePath),
      revision,
      defaultFileName,
      extensions,
      useCascading,
      cacheDb,
      cacheSeconds,
    );

    if (fileInfo) {
      fileInfo.ImportPath = fileInfo?.Path;

      if (this.details.FileRoot) {
        fileInfo.Path = fileInfo.Path.slice(
          this.details.FileRoot.length - 1,
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
      path.join(this.details.FileRoot || "", filePath),
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
      path.join(this.details.FileRoot || "", filePath),
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
      new URL(`${this.details.Package}/`, "https://jsr.io/"),
    );
    const metaResp = await fetch(metaPath);

    if (!metaResp.ok) {
      await metaResp.body?.cancel();

      throw new Error(
        `Package "${this.details.Package}" does not exist or is unavailable.`,
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
          this.details.FileRoot ? fp.startsWith(this.details.FileRoot) : true
        )
        .map((fp) =>
          this.details.FileRoot
            ? fp.slice(this.details.FileRoot!.length - 1)
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
    if (!this.details.Version) {
      const metaPath = new URL(
        `meta.json`,
        new URL(`${this.details.Package}/`, "https://jsr.io/"),
      );
      const metaResp = await fetch(metaPath);

      const meta = (await metaResp.json()) as { latest: string };
      this.details.Version = meta.latest;
    }
  }
}
