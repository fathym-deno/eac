import { DFSFileInfo } from "./DFSFileInfo.ts";

export type DFSFileHandler = {
  GetFileInfo: (
    filePath: string,
    revision: string,
    defaultFileName?: string,
    extensions?: string[],
    useCascading?: boolean,
    cacheDb?: Deno.Kv,
    cacheSeconds?: number,
  ) => Promise<DFSFileInfo | undefined>;

  LoadAllPaths(revision: string): Promise<string[]>;

  readonly Root: string;

  RemoveFile(
    filePath: string,
    revision: string,
    cacheDb?: Deno.Kv,
  ): Promise<void>;

  WriteFile(
    filePath: string,
    revision: string,
    stream: ReadableStream<Uint8Array>,
    ttlSeconds?: number,
    headers?: Headers,
    maxChunkSize?: number,
    cacheDb?: Deno.Kv,
  ): Promise<void>;
};
