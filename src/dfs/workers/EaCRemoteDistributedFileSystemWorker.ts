import { DFSFileHandlerResolver } from "../handlers/DFSFileHandlerResolver.ts";
import { EaCRemoteDistributedFileSystemHandlerResolver } from "../resolvers/EaCRemoteDistributedFileSystemHandlerResolver.ts";
import { EaCDistributedFileSystemWorker } from "./EaCDistributedFileSystemWorker.ts";

export class EaCRemoteDistributedFileSystemWorker
  extends EaCDistributedFileSystemWorker {
  protected loadDFSHandlerResolver(): DFSFileHandlerResolver {
    return EaCRemoteDistributedFileSystemHandlerResolver;
  }
}

// deno-lint-ignore no-explicit-any
new EaCRemoteDistributedFileSystemWorker(self as any);
