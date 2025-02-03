import {
  EaCDistributedFileSystemDetails,
  FathymWorkerConfig,
  FathymWorkerMessage,
} from "./.deps.ts";

export type EaCDistributedFileSystemWorkerConfig = {
  DFS: EaCDistributedFileSystemDetails;
} & FathymWorkerConfig;

export type EaCDistributedFileSystemWorkerMessageGetFileInfoPayload = {
  CacheDB?: Deno.Kv;

  CacheSeconds?: number;

  DefaultFileName?: string;

  Extensions?: string[];

  FilePath: string;

  Revision: string;

  UseCascading?: boolean;
};

export type EaCDistributedFileSystemWorkerMessageLoadAllPathsPayload = {
  Revision?: string;
};

export type EaCDistributedFileSystemWorkerMessageRemoveFilePayload = {
  CacheDB?: Deno.Kv;

  FilePath: string;

  Revision: string;
};

export type EaCDistributedFileSystemWorkerMessageWriteFilePayload = {
  CacheDB?: Deno.Kv;

  FilePath: string;

  Headers?: Record<string, string>;

  MaxChunkSize?: number;

  Revision: string;

  Stream: ReadableStream<Uint8Array>;

  TTLSeconds?: number;
};

export type EaCDistributedFileSystemWorkerMessage<
  TPayload extends
    | undefined
    | EaCDistributedFileSystemWorkerMessageGetFileInfoPayload
    | EaCDistributedFileSystemWorkerMessageLoadAllPathsPayload
    | EaCDistributedFileSystemWorkerMessageRemoveFilePayload
    | EaCDistributedFileSystemWorkerMessageWriteFilePayload = undefined,
> = FathymWorkerMessage<TPayload>;
