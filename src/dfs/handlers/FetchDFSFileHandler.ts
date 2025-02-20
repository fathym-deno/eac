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
    return await withDFSCache(
      filePath,
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

        for (const fcp of fileCheckPaths) {
          const resolvedPath = this.pathResolver ? this.pathResolver(fcp) : fcp;
          if (!resolvedPath) continue;

          try {
            const fullFilePath = isDirectFetch
              ? new URL(resolvedPath)
              : new URL(`.${resolvedPath}`, this.Root);

            const response = await fetch(fullFilePath);

            if (response.ok && response.body) {
              // ✅ Create a ReadableStream to ensure we process and close the response correctly
              const stream = new ReadableStream<Uint8Array>({
                start(controller) {
                  (async () => {
                    try {
                      const reader = response.body!.getReader();
                      let done = false;
                      while (!done) {
                        const { value, done: readDone } = await reader.read();
                        if (readDone) break;
                        if (value) controller.enqueue(value);
                      }
                      controller.close();
                    } catch (err) {
                      controller.error(err);
                    }
                  })();
                },
              });

              return {
                Path: resolvedPath,
                Headers: this.extractHeaders(response),
                Contents: stream,
              };
            } else if (response.body) {
              await response.body?.cancel();
            }
            // deno-lint-ignore no-empty
          } catch {}
        }

        console.debug(
          `Unable to locate a local file at path ${filePath}${
            defaultFileName
              ? `, and no default file was found for ${defaultFileName}.`
              : "."
          }`,
        );

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
}
