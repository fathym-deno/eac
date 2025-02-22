import {
  DenoKVFileStream,
  DenoKVFileStreamData,
  EaCDenoKVDistributedFileSystemDetails,
  EaCDistributedFileSystemAsCode,
  getFileCheckPathsToProcess,
  IoCContainer,
  withDFSCache,
} from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

/**
 * Implements `DFSFileHandler` for Deno KV-backed storage.
 */
export class DenoKVDFSFileHandler extends DFSFileHandler {
  private readonly fileStream: DenoKVFileStream;
  private readonly rootKey: Deno.KvKey;
  private readonly pathResolver?: (filePath: string) => string;

  protected get details(): EaCDenoKVDistributedFileSystemDetails {
    return this.dfs.Details as EaCDenoKVDistributedFileSystemDetails;
  }

  public get Root(): string {
    return this.details.FileRoot || "";
  }

  /**
   * Creates an instance of `DenoKVDFSFileHandler`.
   * @param denoKv - The Deno KV instance.
   * @param rootKey - The root key prefix for storage.
   * @param Root - The root path for DFS.
   * @param segmentPath - Optional segment path for namespace partitioning.
   * @param pathResolver - Optional resolver for mapping file paths.
   */
  public constructor(
    dfsLookup: string,
    dfs: EaCDistributedFileSystemAsCode,
    protected readonly denoKv: Deno.Kv,
    pathResolver?: (filePath: string) => string,
  ) {
    super(dfsLookup, dfs);

    this.fileStream = new DenoKVFileStream(denoKv);

    this.rootKey = [...(this.details.RootKey || ["DFS"]), "Root", this.Root];

    this.pathResolver = pathResolver;
  }

  /**
   * Retrieves file information from Deno KV storage.
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
        const fileCheckPaths = getFileCheckPathsToProcess(
          filePath,
          defaultFileName,
          extensions,
          useCascading,
        );

        const fileChecks = fileCheckPaths.map(async (fcp) => {
          const resolvedPath = this.pathResolver ? this.pathResolver(fcp) : fcp;

          if (resolvedPath) {
            const fullFileKey = this.getFullFileKey(revision, resolvedPath);
            return this.fileStream.Read(fullFileKey);
          }
          return undefined;
        });

        const fileResps = await Promise.all(fileChecks);
        const activeFileResp = fileResps.find((fileResp) => fileResp?.Contents);

        if (activeFileResp) {
          return {
            ...activeFileResp,
            Path: finalFilePath,
          };
        }

        throw new Error(
          `Unable to locate a DenoKV file at path ${filePath}${
            defaultFileName
              ? `, and no default file was found for ${defaultFileName}.`
              : "."
          }`,
        );
      },
      revision,
      cacheDb,
      cacheSeconds,
    );
  }

  /**
   * Loads all available file paths from Deno KV storage.
   * @param revision - The revision identifier.
   * @returns An array of file paths.
   */
  public async LoadAllPaths(revision: string): Promise<string[]> {
    const filesRootKey = [...this.rootKey];
    const filesRevisionRootKey = [...filesRootKey, "Revision", revision];

    const fileRevisionEntries = this.denoKv.list<
      DenoKVFileStreamData<Uint8Array | Record<string, unknown>>
    >({
      prefix: filesRevisionRootKey,
    });

    const filteredEntries = [];
    for await (const entry of fileRevisionEntries) {
      const keyString = entry.key.join("/");
      if (keyString.endsWith("Mark")) {
        filteredEntries.push(entry);
      }
    }

    const paths: string[] = [];

    for await (const fileRevisionEntry of filteredEntries) {
      const filePath = fileRevisionEntry.key
        .slice(
          filesRevisionRootKey.length + 2,
          fileRevisionEntry.key.length - 1,
        )
        .join("/");

      paths.push(`/${filePath}`);
    }

    this.cleanupOldRevisions(filesRootKey, filesRevisionRootKey).then();

    return paths;
  }

  /**
   * Removes a file from Deno KV storage.
   * @param filePath - The path of the file to remove.
   */
  public async RemoveFile(filePath: string, revision: string): Promise<void> {
    const fullFileKey = this.getFullFileKey(revision, filePath);
    await this.fileStream.Remove(fullFileKey);
  }

  /**
   * Writes a file to Deno KV storage.
   * @param filePath - The path where the file should be stored.
   * @param stream - The file content as a readable stream.
   */
  public async WriteFile(
    filePath: string,
    revision: string,
    stream: ReadableStream<Uint8Array>,
    ttlSeconds?: number,
    headers?: Headers,
    maxChunkSize = 8000,
    _cacheDb?: Deno.Kv,
  ): Promise<void> {
    const fullFileKey = this.getFullFileKey(revision, filePath);
    await this.fileStream.Write(
      fullFileKey,
      stream,
      ttlSeconds,
      headers,
      maxChunkSize,
    );
  }

  // ---------------- PRIVATE METHODS ----------------

  /**
   * Constructs the full Deno KV key based on root, revision, and file path.
   * @param revision - The revision identifier.
   * @param filePath - The file path to construct the key for.
   * @returns A `Deno.KvKey` representing the full key.
   */
  private getFullFileKey(revision: string, filePath: string): Deno.KvKey {
    const keyedUrl = new URL(
      [
        ...this.rootKey,
        "Revision",
        revision,
        "Path",
        ...(this.details.SegmentPath?.split("/") || []).filter((fp) => fp),
        ...filePath.split("/").filter((fp) => fp),
      ].join("/"),
      new URL("https://notused.com/"),
    ).pathname.replace("//", "/");

    return keyedUrl.split("/").filter((fp) => fp);
  }

  /**
   * Cleans up old revisions by removing outdated keys.
   * @param filesRootKey - The root key prefix for stored files.
   * @param filesRevisionRootKey - The specific revision's root key.
   */
  private async cleanupOldRevisions(
    filesRootKey: Deno.KvKey,
    filesRevisionRootKey: Deno.KvKey,
  ): Promise<void> {
    const fileEntries = await this.denoKv.list<
      DenoKVFileStreamData<Uint8Array | Record<string, unknown>>
    >({
      prefix: filesRootKey,
    });

    const deleteCalls: Promise<void>[] = [];

    for await (const fileEntry of fileEntries) {
      const curKey = fileEntry.key.join("/");
      const revisionRoot = filesRevisionRootKey.join("/");

      if (!curKey.startsWith(revisionRoot)) {
        deleteCalls.push(this.denoKv.delete(fileEntry.key));
      }
    }

    await Promise.all(deleteCalls);
  }
}
