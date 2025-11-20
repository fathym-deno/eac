import { denoGraph, EaCDistributedFileSystemAsCode, EaCESMDistributedFileSystemDetails, EaCRemoteDistributedFileSystemDetails, loadDenoConfig, path } from "./.deps.ts";
import { FetchDFSFileHandler } from "./FetchDFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

/**
 * Implements `DFSFileHandler` for ESM-based file systems.
 */
export class RemoteFetchDFSFileHandler extends FetchDFSFileHandler<EaCRemoteDistributedFileSystemDetails> {
  public get Root(): string {
    let fileRoot: string;
    try {
      fileRoot = this.details ? new URL(this.details.RemoteRoot).href : "";
    } catch (error) {
      throw new Error(`Invalid RemoteRoot URL: ${this.details.RemoteRoot}`);
    }

    return fileRoot;
  }

  /**
   * Creates an instance of `ESMFetchDFSFileHandler`.
   * @param root - The root URL for the module.
   * @param entryPoints - The entry points to analyze.
   * @param includeDependencies - Whether to include dependencies in file resolution.
   */
  public constructor(
    dfsLookup: string,
    details: EaCRemoteDistributedFileSystemDetails,
  ) {
    super(dfsLookup, details);
  }

  /**
   * Retrieves file information but only for valid ESM-resolved paths.
   * @returns A `DFSFileInfo` object if found, otherwise `undefined`.
   */
  public override async GetFileInfo(
    filePath: string,
    revision: string,
    defaultFileName?: string,
    extensions?: string[],
    useCascading?: boolean,
    cacheDb?: Deno.Kv,
    cacheSeconds?: number,
  ): Promise<DFSFileInfo | undefined> {
    // Otherwise, fetch as normal
    const fileInfo = await super.GetFileInfo(
      filePath,
      revision,
      defaultFileName,
      extensions,
      useCascading,
      cacheDb,
      cacheSeconds,
    );

    return fileInfo;
  }
}
