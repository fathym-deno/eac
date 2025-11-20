// deno-lint-ignore-file no-empty
import { EaCDistributedFileSystemDetails, EaCRemoteDistributedFileSystemDetails, getFileCheckPathsToProcess, Logger, withDFSCache } from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

/**
 * Implements `DFSFileHandler` using HTTP(S) and local file fetching.
 */
export abstract class FetchDFSFileHandler<
  TDetails extends EaCDistributedFileSystemDetails,
> extends DFSFileHandler<TDetails> {
  protected readonly pathResolver?: (filePath: string) => string;

  public constructor(
    dfsLookup: string,
    details: TDetails,
    pathResolver?: (filePath: string) => string,
  ) {
    super(dfsLookup, details);

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

        const fileCheckPaths = isDirectFetch ? [filePath] : getFileCheckPathsToProcess(
          filePath,
          defaultFileName,
          extensions,
          useCascading,
        );

        let fileInfo: DFSFileInfo | undefined = undefined;

        for (const fcp of fileCheckPaths) {
          const resolvedPath = this.pathResolver ? this.pathResolver(fcp) : fcp;
          if (!resolvedPath) continue;

          try {
            const fullFilePath = isDirectFetch ? new URL(resolvedPath) : new URL(`.${resolvedPath}`, this.Root);

            const response = await fetch(fullFilePath);

            if (response.ok && response.body) {
              let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

              const stream = new ReadableStream<Uint8Array>({
                async pull(controller) {
                  try {
                    if (!reader) {
                      reader = response.body!.getReader(); // Lazy load
                    }

                    const { value, done } = await reader.read();

                    if (done) {
                      controller.close();
                      reader.releaseLock();
                      return;
                    }

                    controller.enqueue(value);
                  } catch (err) {
                    try {
                      controller.error(err);
                    } catch {}
                    reader?.releaseLock();
                  }
                },

                cancel() {
                  try {
                    reader?.cancel();
                  } catch {
                    // Already released
                  }
                },
              });

              fileInfo = {
                Path: resolvedPath,
                Headers: this.extractHeaders(response),
                Contents: stream,
              };

              break;
            } else if (response.body) {
              await response.body.cancel(); // Ensure cleanup if response failed
            }
          } catch {}
        }

        if (!fileInfo) {
          this.logger.debug(
            `Unable to locate a fetch file at path ${filePath}${defaultFileName ? `, and no default file was found for ${defaultFileName}.` : "."}`,
          );
        }

        return fileInfo;
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
