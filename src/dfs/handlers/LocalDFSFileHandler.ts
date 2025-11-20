// deno-lint-ignore-file no-empty
import { delay } from "jsr:@std/async@1.0.10/delay";
import { EaCDistributedFileSystemAsCode, EaCLocalDistributedFileSystemDetails, existsSync, getFileCheckPathsToProcess, getFilesList, path, withDFSCache } from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

/**
 * Implements `DFSFileHandler` for local file system storage.
 */
export class LocalDFSFileHandler extends DFSFileHandler<EaCLocalDistributedFileSystemDetails> {
  public override get Root(): string {
    return this.details?.FileRoot?.endsWith("/") ? this.details.FileRoot : `${this.details.FileRoot}/`;
  }

  constructor(
    dfsLookup: string,
    details: EaCLocalDistributedFileSystemDetails,
    protected readonly pathResolver?: (filePath: string) => string,
  ) {
    super(dfsLookup, details);
  }

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
        const fileCheckPaths = getFileCheckPathsToProcess(
          filePath,
          defaultFileName,
          extensions,
          useCascading,
        );

        let fileInfo: DFSFileInfo | undefined = undefined;

        for (const fcp of fileCheckPaths) {
          const resolvedPath = this.pathResolver ? this.pathResolver(fcp) : fcp;

          if (!resolvedPath) continue;

          const fullFilePath = path.join(
            this.Root.includes(":/") || this.Root.includes(":\\") ? "" : Deno.cwd(),
            this.Root || "",
            resolvedPath,
          );

          if (!existsSync(fullFilePath)) continue;

          try {
            const file = await Deno.open(fullFilePath, { read: true });
            const stream = file.readable;

            fileInfo = { Path: resolvedPath, Contents: stream };

            break;
          } catch {}
        }

        if (!fileInfo) {
          console.log(
            `Unable to locate a local file at path ${filePath}${defaultFileName ? `, and no default file was found for ${defaultFileName}.` : "."}`,
          );
        }

        return fileInfo;
      },
      revision,
      cacheDb,
      cacheSeconds,
    );
  }

  public async LoadAllPaths(_revision: string): Promise<string[]> {
    const dir = await getFilesList({ Directory: this.Root });

    return Array.from(dir).map((entry) => entry.startsWith(this.Root) ? `./${entry.substring(this.Root.length)}` : entry);
  }

  public async RemoveFile(
    _filePath: string,
    _revision: string,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    throw new Deno.errors.NotSupported("File removal not yet supported.");
  }

  public async WriteFile(
    _filePath: string,
    _revision: string,
    _stream: ReadableStream<Uint8Array>,
    _ttlSeconds?: number,
    _headers?: Headers,
    _maxChunkSize = 8000,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    throw new Deno.errors.NotSupported("File writing not yet supported.");
  }
}
