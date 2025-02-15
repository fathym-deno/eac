import { getFileCheckPathsToProcess, withDFSCache } from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

/**
 * Implements `DFSFileHandler` using HTTP(S) and local file fetching.
 */
export class FetchDFSFileHandler extends DFSFileHandler {
  private readonly pathResolver?: (filePath: string) => string;

  /**
   * Creates an instance of `FetchDFSFileHandler`.
   * @param root - The base URL or directory to resolve paths.
   * @param pathResolver - Optional function to transform file paths before fetching.
   */
  public constructor(
    public Root: string,
    pathResolver?: (filePath: string) => string,
  ) {
    super();
    this.pathResolver = pathResolver;
  }

  /**
   * Retrieves file information via HTTP(S) or file fetching.
   * @returns A `DFSFileInfo` object if found, otherwise `undefined`.
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
    let finalFilePath = filePath;

    return await withDFSCache(
      finalFilePath,
      async () => {
        const isDirectFetch = filePath.startsWith("http://") ||
          filePath.startsWith("https://") ||
          filePath.startsWith("file:///");

        const fileCheckPaths = isDirectFetch
          ? [filePath]
          : getFileCheckPathsToProcess(
            filePath,
            defaultFileName,
            extensions,
            useCascading,
          );

        const fileChecks: Promise<Response>[] = [];
        const usedFileCheckPaths: string[] = [];

        fileCheckPaths.forEach((fcp) => {
          const resolvedPath = this.pathResolver ? this.pathResolver(fcp) : fcp;

          if (resolvedPath && !resolvedPath.startsWith("@")) {
            try {
              const fullFilePath = isDirectFetch
                ? new URL(resolvedPath)
                : new URL(`.${resolvedPath}`, this.Root);

              usedFileCheckPaths.push(resolvedPath);
              fileChecks.push(fetch(fullFilePath));
            } catch (err) {
              if (!(err instanceof TypeError)) {
                throw err;
              }
            }
          }
        });

        const fileResps = await Promise.all(fileChecks);
        const activeFileResp = fileResps.find((fileResp, i) => {
          if (fileResp.ok) {
            finalFilePath = usedFileCheckPaths[i];
          }
          return fileResp.ok;
        });

        if (activeFileResp) {
          const headers = this.extractHeaders(activeFileResp);

          return {
            Contents: activeFileResp.clone().body!,
            Headers: headers,
            Path: finalFilePath,
          };
        }

        return undefined;
      },
      revision,
      cacheDb,
      cacheSeconds,
    );
  }

  /**
   * Fetch-based DFS does not support listing all paths.
   * @throws `Deno.errors.NotSupported`
   */
  public async LoadAllPaths(_revision: string): Promise<string[]> {
    throw new Deno.errors.NotSupported(
      "Retrieval of fetch paths is not supported.",
    );
  }

  /**
   * Fetch-based DFS does not support file removal.
   * @throws `Deno.errors.NotSupported`
   */
  public async RemoveFile(
    _filePath: string,
    _revision: string,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    throw new Deno.errors.NotSupported("File removal is not supported.");
  }

  /**
   * Fetch-based DFS does not support writing files.
   * @throws `Deno.errors.NotSupported`
   */
  public async WriteFile(
    _filePath: string,
    _revision: string,
    _stream: ReadableStream<Uint8Array>,
    _ttlSeconds?: number,
    _headers?: Headers,
    _maxChunkSize = 8000,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    throw new Deno.errors.NotSupported("File writing is not supported.");
  }

  // ---------------- PRIVATE METHODS ----------------

  /**
   * Extracts headers from a response, excluding unnecessary ones.
   * @param response - The `Response` object from fetch.
   * @returns A filtered record of headers.
   */
  private extractHeaders(response: Response): Record<string, string> {
    const excludeHeaders = new Set(["content-type"]);
    const headers: Record<string, string> = {};

    response.headers.forEach((value, key) => {
      if (!excludeHeaders.has(key)) {
        headers[key] = value;
      }
    });

    return headers;
  }
}
