import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemWorkerClient,
} from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

/**
 * Implements `DFSFileHandler` for worker-based DFS execution.
 */
export class WorkerDFSFileHandler extends DFSFileHandler {
  private readonly dfsWorkerClient: EaCDistributedFileSystemWorkerClient;

  public Root: string;

  constructor(workerPath: string) {
    super();

    this.dfsWorkerClient = new EaCDistributedFileSystemWorkerClient(
      workerPath!,
    );

    this.Root = workerPath;
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
