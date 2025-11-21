import { DFSFileInfo, FathymWorkerClient } from "./.deps.ts";
import {
  EaCDistributedFileSystemWorkerConfig,
  EaCDistributedFileSystemWorkerMessage,
  EaCDistributedFileSystemWorkerMessageGetFileInfoPayload,
  EaCDistributedFileSystemWorkerMessageLoadAllPathsPayload,
  EaCDistributedFileSystemWorkerMessageRemoveFilePayload,
  EaCDistributedFileSystemWorkerMessageWriteFilePayload,
} from "./EaCDistributedFileSystemWorkerMessage.ts";
import { EaCDistributedFileSystemWorkerMessageTypes } from "./EaCDistributedFileSystemWorkerMessageTypes.ts";

export class EaCDistributedFileSystemWorkerClient extends FathymWorkerClient<
  EaCDistributedFileSystemWorkerConfig,
  // deno-lint-ignore no-explicit-any
  EaCDistributedFileSystemWorkerMessage<any>
> {
  constructor(workerPath: string) {
    super(workerPath);
  }

  public async GetFileInfo(
    payload: EaCDistributedFileSystemWorkerMessageGetFileInfoPayload,
  ): Promise<DFSFileInfo | undefined> {
    const resp = await this.Send<
      {
        FileInfo:
          | {
            Contents: ArrayBuffer;

            Headers?: Record<string, string>;

            Path: string;
          }
          | undefined;
      },
      EaCDistributedFileSystemWorkerMessageGetFileInfoPayload
    >({
      Type: EaCDistributedFileSystemWorkerMessageTypes.GetFileInfo,
      Payload: payload,
    });

    return resp.FileInfo
      ? {
        ...resp.FileInfo,
        Contents: new Blob([resp.FileInfo!.Contents]).stream(),
      }
      : undefined;
  }

  public async LoadAllPaths(revision: string): Promise<string[]> {
    const resp = await this.Send<
      { FilePaths: string[] },
      EaCDistributedFileSystemWorkerMessageLoadAllPathsPayload
    >({
      Type: EaCDistributedFileSystemWorkerMessageTypes.LoadAllPaths,
      Payload: {
        Revision: revision,
      },
    });

    return resp.FilePaths;
  }

  public async RemoveFile(
    payload: EaCDistributedFileSystemWorkerMessageRemoveFilePayload,
  ): Promise<DFSFileInfo | undefined> {
    const resp = await this.Send<
      { FileInfo: DFSFileInfo | undefined },
      EaCDistributedFileSystemWorkerMessageRemoveFilePayload
    >({
      Type: EaCDistributedFileSystemWorkerMessageTypes.RemoveFile,
      Payload: payload,
    });

    return resp.FileInfo;
  }

  public async WriteFile(
    payload: EaCDistributedFileSystemWorkerMessageWriteFilePayload,
  ): Promise<DFSFileInfo | undefined> {
    const resp = await this.Send<
      { FileInfo: DFSFileInfo | undefined },
      EaCDistributedFileSystemWorkerMessageWriteFilePayload
    >({
      Type: EaCDistributedFileSystemWorkerMessageTypes.WriteFile,
      Payload: payload,
    });

    return resp.FileInfo;
  }
}
