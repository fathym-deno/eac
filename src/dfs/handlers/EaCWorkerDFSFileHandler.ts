import { DFSFileInfo } from "./.deps.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { EaCDistributedFileSystemWorkerClient } from "../workers/EaCDistributedFileSystemWorkerClient.ts";
import { EaCDFSFileHandler } from "./EaCDFSFileHandler.ts";

/**
 * Implements `EaCDFSFileHandler` for worker-based DFS execution.
 */
export class EaCWorkerDFSFileHandler extends EaCDFSFileHandler {
  private readonly dfsWorkerClient: EaCDistributedFileSystemWorkerClient;

  public override get Root(): string {
    return this.details.WorkerPath || "";
  }

  constructor(dfsLookup: string, details: EaCDistributedFileSystemDetails) {
    super(dfsLookup, details);

    this.dfsWorkerClient = new EaCDistributedFileSystemWorkerClient(
      details.WorkerPath!,
    );
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
    return await this.dfsWorkerClient.GetFileInfo({
      FilePath: filePath,
      Revision: revision,
      DefaultFileName: defaultFileName,
      Extensions: extensions,
      UseCascading: useCascading,
      CacheDB: cacheDb,
      CacheSeconds: cacheSeconds,
    });
  }

  public async LoadAllPaths(revision: string): Promise<string[]> {
    return await this.dfsWorkerClient.LoadAllPaths(revision);
  }

  public async RemoveFile(
    filePath: string,
    revision: string,
    cacheDb?: Deno.Kv,
  ): Promise<void> {
    await this.dfsWorkerClient.RemoveFile({
      FilePath: filePath,
      Revision: revision,
      CacheDB: cacheDb,
    });
  }

  public async WriteFile(
    filePath: string,
    revision: string,
    stream: ReadableStream<Uint8Array>,
    ttlSeconds?: number,
    headers?: Headers,
    maxChunkSize = 8000,
    cacheDb?: Deno.Kv,
  ): Promise<void> {
    const headersInit: Record<string, string> = {};
    headers?.forEach((val, key) => {
      headersInit[key] = val;
    });

    await this.dfsWorkerClient.WriteFile({
      FilePath: filePath,
      Revision: revision,
      Stream: stream,
      TTLSeconds: ttlSeconds,
      Headers: headersInit,
      MaxChunkSize: maxChunkSize,
      CacheDB: cacheDb,
    });
  }
}
