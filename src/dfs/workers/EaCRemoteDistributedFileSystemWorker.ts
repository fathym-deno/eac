import {
  DFSFileHandlerResolver,
  EaCRemoteDistributedFileSystemHandlerResolver,
} from "./.deps.ts";
import { EaCDistributedFileSystemWorker } from "./EaCDistributedFileSystemWorker.ts";

export class EaCRemoteDistributedFileSystemWorker
  extends EaCDistributedFileSystemWorker {
  protected loadDFSHandlerResolver(): DFSFileHandlerResolver {
    return EaCRemoteDistributedFileSystemHandlerResolver;
  }
}

// deno-lint-ignore no-explicit-any
new EaCRemoteDistributedFileSystemWorker(self as any);
