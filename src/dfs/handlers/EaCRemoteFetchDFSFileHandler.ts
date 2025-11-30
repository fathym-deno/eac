import {
  BaseFetchDFSFileHandlerDetails,
  BaseRemoteFetchDFSFileHandler,
} from "./.deps.ts";
import { EaCRemoteDistributedFileSystemDetails } from "../_/EaCRemoteDistributedFileSystemDetails.ts";
import { EaCFetchDFSFileHandler } from "./EaCFetchDFSFileHandler.ts";

/**
 * EaC Remote Fetch DFS File Handler.
 * Composes `RemoteFetchDFSFileHandler` from `@fathym/dfs` with revision and caching support.
 */
export class EaCRemoteFetchDFSFileHandler
  extends EaCFetchDFSFileHandler<EaCRemoteDistributedFileSystemDetails> {
  protected readonly baseHandler: BaseRemoteFetchDFSFileHandler;

  public constructor(
    dfsLookup: string,
    details: EaCRemoteDistributedFileSystemDetails,
  ) {
    super(dfsLookup, details);

    // Delegate to base handler from @fathym/dfs
    this.baseHandler = new BaseRemoteFetchDFSFileHandler({
      RemoteRoot: details.RemoteRoot,
    });
  }
}
