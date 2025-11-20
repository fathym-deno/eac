import { EaCVirtualCompositeDistributedFileSystemDetails, getFileCheckPathsToProcess, withDFSCache } from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

type OverlayEntry = {
  contents: Uint8Array;
  headers?: Record<string, string>;
};

export class VirtualCompositeDFSHandler extends DFSFileHandler<EaCVirtualCompositeDistributedFileSystemDetails> {
  public override get Root(): string {
    return this.baseHandlers[0]?.Root ?? "";
  }

  private readonly overlays = new Map<string, OverlayEntry>();

  constructor(
    dfsLookup: string,
    details: EaCVirtualCompositeDistributedFileSystemDetails,
    private readonly baseHandlers: DFSFileHandler[],
  ) {
    super(dfsLookup, details);
  }

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
      async () => {
        const fileCheckPaths = getFileCheckPathsToProcess(
          filePath,
          defaultFileName ?? this.details.DefaultFile,
          extensions ?? this.details.Extensions,
          useCascading ?? this.details.UseCascading,
        );

        for (const candidate of fileCheckPaths) {
          const normalized = this.normalizePath(candidate);
          const overlay = this.overlays.get(normalized);

          if (overlay) {
            return {
              Path: this.decoratePath(normalized, candidate),
              ImportPath: candidate,
              Contents: this.createStream(overlay.contents),
              Headers: overlay.headers,
            };
          }
        }

        for (const handler of this.baseHandlers) {
          const result = await handler.GetFileInfo(
            filePath,
            revision,
            defaultFileName,
            extensions,
            useCascading,
            cacheDb,
            cacheSeconds,
          );

          if (result) {
            return result;
          }
        }

        return undefined;
      },
      revision,
      cacheDb,
      cacheSeconds,
    );
  }

  public override async LoadAllPaths(revision: string): Promise<string[]> {
    const overlayPaths = Array
      .from(this.overlays.keys())
      .map((path) => this.decoratePath(path));

    const basePathLists = await Promise.all(
      this.baseHandlers.map((handler) => handler.LoadAllPaths(revision)),
    );

    const merged = new Set<string>(overlayPaths);

    for (const list of basePathLists) {
      list.forEach((entry) => merged.add(entry));
    }

    return Array.from(merged);
  }

  public override async RemoveFile(
    filePath: string,
    revision: string,
    cacheDb?: Deno.Kv,
  ): Promise<void> {
    const normalized = this.normalizePath(filePath);

    if (this.overlays.delete(normalized)) {
      return;
    }

    for (const handler of this.baseHandlers) {
      try {
        await handler.RemoveFile(filePath, revision, cacheDb);
        return;
      } catch (err) {
        if (
          err instanceof Deno.errors.NotSupported ||
          err instanceof Deno.errors.NotFound
        ) {
          continue;
        }

        throw err;
      }
    }

    throw new Deno.errors.NotSupported(
      "RemoveFile is not supported by any base DFS handler in the composite stack.",
    );
  }

  public override async WriteFile(
    filePath: string,
    _revision: string,
    stream: ReadableStream<Uint8Array>,
    _ttlSeconds?: number,
    headers?: Headers,
    _maxChunkSize?: number,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    const buffer = await new Response(stream).arrayBuffer();
    const normalized = this.normalizePath(filePath);

    const headerRecord = headers
      ? Object.fromEntries(
        headers as unknown as Iterable<[string, string]>,
      )
      : undefined;

    this.overlays.set(normalized, {
      contents: new Uint8Array(buffer),
      headers: headerRecord,
    });
  }

  private createStream(contents: Uint8Array): ReadableStream<Uint8Array> {
    return ReadableStream.from([contents]);
  }

  private decoratePath(
    normalized: string,
    preferred?: string,
  ): string {
    if (preferred) return preferred;
    return normalized.startsWith("./") ? normalized : `./${normalized}`;
  }

  private normalizePath(filePath: string): string {
    return filePath.replace(/^(\.\/|\/)+/, "");
  }
}
