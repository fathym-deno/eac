import {
  correlateResult,
  DFSFileHandler,
  DFSFileHandlerResolver,
  FathymWorker,
  IoCContainer,
  toArrayBuffer,
} from "./.deps.ts";
import { EaCDistributedFileSystemWorkerMessageTypes } from "./EaCDistributedFileSystemWorkerMessageTypes.ts";
import {
  EaCDistributedFileSystemWorkerConfig,
  EaCDistributedFileSystemWorkerMessage,
  EaCDistributedFileSystemWorkerMessageGetFileInfoPayload,
  EaCDistributedFileSystemWorkerMessageLoadAllPathsPayload,
  EaCDistributedFileSystemWorkerMessageRemoveFilePayload,
  EaCDistributedFileSystemWorkerMessageWriteFilePayload,
} from "./EaCDistributedFileSystemWorkerMessage.ts";

export abstract class EaCDistributedFileSystemWorker extends FathymWorker<
  EaCDistributedFileSystemWorkerConfig,
  EaCDistributedFileSystemWorkerMessage,
  EaCDistributedFileSystemWorkerMessageTypes
> {
  protected loadAllPaths?: Promise<string[]>;

  protected dfsHandler?: DFSFileHandler;

  protected fileGetters?: Record<
    string,
    Promise<
      | {
        Contents: ArrayBuffer;

        Headers?: Record<string, string>;

        Path: string;
      }
      | undefined
    >
  >;

  protected override async handleInitConfig(): Promise<
    | {
      Root: string;
    }
    | undefined
  > {
    this.fileGetters = {};

    const resolver = this.loadDFSHandlerResolver();

    this.dfsHandler = await resolver.Resolve(
      new IoCContainer(),
      this.config.DFS,
    );

    return this.dfsHandler
      ? {
        Root: this.dfsHandler.Root,
      }
      : undefined;
  }

  protected async handleWorkerGetFileInfo(
    msg: EaCDistributedFileSystemWorkerMessage<
      EaCDistributedFileSystemWorkerMessageGetFileInfoPayload
    >,
  ): Promise<void> {
    if (msg.Payload) {
      const filePath = msg.Payload.FilePath;

      if (!(filePath in (this.fileGetters || {}))) {
        this.fileGetters![filePath] = new Promise((resolve) => {
          const loadFile = async () => {
            if (this.dfsHandler) {
              const fileInfo = await this.dfsHandler.GetFileInfo(
                filePath,
                msg.Payload!.Revision,
                msg.Payload!.DefaultFileName,
                msg.Payload!.Extensions,
                msg.Payload!.UseCascading,
                msg.Payload!.CacheDB,
                msg.Payload!.CacheSeconds,
              );

              return fileInfo
                ? {
                  ...fileInfo,
                  Contents: await toArrayBuffer(fileInfo.Contents!),
                }
                : undefined;
            } else {
              return undefined;
            }
          };

          loadFile().then((fileInfo) => {
            resolve(fileInfo);
          });
        });
      }

      const fileInfo = await this.fileGetters![filePath];

      correlateResult(this.worker, msg.CorrelationID, {
        FileInfo: fileInfo,
      });
    } else {
      correlateResult(this.worker, msg.CorrelationID, {
        FileInfo: undefined,
      });
    }
  }

  protected async handleWorkerLoadAllPaths(
    msg: EaCDistributedFileSystemWorkerMessage<
      EaCDistributedFileSystemWorkerMessageLoadAllPathsPayload
    >,
  ): Promise<void> {
    if (!this.loadAllPaths) {
      this.loadAllPaths = new Promise((resolve) => {
        if (this.dfsHandler) {
          this.dfsHandler
            .LoadAllPaths(msg.Payload?.Revision ?? Date.now().toString())
            .then((paths) => {
              resolve(paths);
            });
        } else {
          resolve([]);
        }
      });
    }

    const filePaths = await this.loadAllPaths;

    correlateResult(this.worker, msg.CorrelationID, {
      FilePaths: filePaths,
    });
  }

  protected async handleWorkerRemoveFile(
    msg: EaCDistributedFileSystemWorkerMessage<
      EaCDistributedFileSystemWorkerMessageRemoveFilePayload
    >,
  ): Promise<void> {
    if (msg.Payload && this.dfsHandler) {
      await this.dfsHandler.RemoveFile(
        msg.Payload.FilePath,
        msg.Payload.Revision,
        msg.Payload.CacheDB,
      );
    }

    correlateResult(this.worker, msg.CorrelationID);
  }

  protected async handleWorkerWriteFile(
    msg: EaCDistributedFileSystemWorkerMessage<
      EaCDistributedFileSystemWorkerMessageWriteFilePayload
    >,
  ): Promise<void> {
    if (msg.Payload && this.dfsHandler) {
      await this.dfsHandler.WriteFile(
        msg.Payload.FilePath,
        msg.Payload.Revision,
        msg.Payload.Stream,
        msg.Payload.TTLSeconds,
        msg.Payload.Headers ? new Headers(msg.Payload!.Headers) : undefined,
        msg.Payload.MaxChunkSize,
        msg.Payload.CacheDB,
      );
    }

    correlateResult(this.worker, msg.CorrelationID);
  }

  protected abstract loadDFSHandlerResolver(): DFSFileHandlerResolver;

  protected override loadWorkerMessageHandlers(): typeof this.workerMessageHandlers {
    return {
      ...super.loadWorkerMessageHandlers(),
      [EaCDistributedFileSystemWorkerMessageTypes.GetFileInfo]: this
        .handleWorkerGetFileInfo.bind(this),
      [EaCDistributedFileSystemWorkerMessageTypes.LoadAllPaths]: this
        .handleWorkerLoadAllPaths.bind(this),
      [EaCDistributedFileSystemWorkerMessageTypes.RemoveFile]: this
        .handleWorkerRemoveFile.bind(this),
      [EaCDistributedFileSystemWorkerMessageTypes.WriteFile]: this
        .handleWorkerWriteFile.bind(this),
    } as typeof this.workerMessageHandlers;
  }
}
