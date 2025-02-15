import { getPackageLogger, path } from "./.deps.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";
import { FetchDFSFileHandler } from "./FetchDFSFileHandler.ts";

/**
 * Specialized DFS handler for JSR-backed file systems.
 * Handles version resolution and file retrieval from jsr.io.
 */
export class JSRFetchDFSFileHandler extends FetchDFSFileHandler {
  private version?: string;
  private readonly packageName: string;
  private readonly fileRoot?: string;

  constructor(packageName: string, version?: string, fileRoot?: string) {
    const baseUrl = new URL(`${packageName}/`, "https://jsr.io/");
    super(baseUrl.href);

    this.packageName = packageName;
    this.version = version;
    this.fileRoot = fileRoot;
  }

  /**
   * Ensures the correct version of the JSR package is resolved.
   * Fetches the latest version if none is provided.
   */
  public async ResolveVersion(): Promise<void> {
    if (!this.version) {
      const metaPath = new URL(
        `meta.json`,
        new URL(`${this.packageName}/`, "https://jsr.io/"),
      );
      const metaResp = await fetch(metaPath);

      const meta = (await metaResp.json()) as { latest: string };
      this.version = meta.latest;
    }

    // Update Root URL with resolved version
    this.Root = new URL(
      `${this.version}/`,
      new URL(`${this.packageName}/`, "https://jsr.io/"),
    ).href;
  }

  /**
   * Loads all file paths for the given JSR package version.
   */
  public override async LoadAllPaths(_revision: string): Promise<string[]> {
    const logger = await getPackageLogger(import.meta);

    const metaPath = `${this.Root.slice(0, -1)}_meta.json`;

    const metaResp = await fetch(metaPath);

    try {
      const meta = (await metaResp.clone().json()) as {
        manifest: { [filePath: string]: unknown };
      };

      return Object.keys(meta.manifest)
        .filter((fp) => (this.fileRoot ? fp.startsWith(this.fileRoot) : true))
        .map((fp) => `/${fp}`);
    } catch (err) {
      logger.error(
        `Error loading paths from ${metaPath}`,
        await metaResp.clone().text(),
      );
      throw err;
    }
  }

  /**
   * Retrieves file information, resolving paths with `fileRoot`.
   */
  public override GetFileInfo(
    filePath: string,
    revision: string,
    defaultFileName?: string,
    extensions?: string[],
    useCascading?: boolean,
    cacheDb?: Deno.Kv,
    cacheSeconds?: number,
  ): Promise<DFSFileInfo | undefined> {
    return super.GetFileInfo(
      path.join(this.fileRoot || "", filePath),
      revision,
      defaultFileName,
      extensions,
      useCascading,
      cacheDb,
      cacheSeconds,
    );
  }

  /**
   * Removes a file, resolving paths with `fileRoot`.
   */
  public override RemoveFile(
    filePath: string,
    revision: string,
    cacheDb?: Deno.Kv,
  ): Promise<void> {
    return super.RemoveFile(
      path.join(this.fileRoot || "", filePath),
      revision,
      cacheDb,
    );
  }

  /**
   * Writes a file, resolving paths with `fileRoot`.
   */
  public override WriteFile(
    filePath: string,
    revision: string,
    stream: ReadableStream<Uint8Array>,
    ttlSeconds?: number,
    headers?: Headers,
    maxChunkSize?: number,
    cacheDb?: Deno.Kv,
  ): Promise<void> {
    return super.WriteFile(
      path.join(this.fileRoot || "", filePath),
      revision,
      stream,
      ttlSeconds,
      headers,
      maxChunkSize,
      cacheDb,
    );
  }
}
