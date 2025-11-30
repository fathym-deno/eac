import { EaCDFSFileHandlerResolver } from "../handlers/EaCDFSFileHandlerResolver.ts";
import { EaCRemoteDFSHandlerResolver } from "../resolvers/EaCRemoteDFSHandlerResolver.ts";
import { EaCDistributedFileSystemWorker } from "./EaCDistributedFileSystemWorker.ts";

export class EaCRemoteDistributedFileSystemWorker
  extends EaCDistributedFileSystemWorker {
  protected loadDFSHandlerResolver(): EaCDFSFileHandlerResolver {
    return EaCRemoteDFSHandlerResolver;
  }
}

// deno-lint-ignore no-explicit-any
new EaCRemoteDistributedFileSystemWorker(self as any);
