import {
  DFSFileHandlerResolver,
  EaCDenoKVDistributedFileSystemHandlerResolver,
} from "./.deps.ts";
import { EaCDistributedFileSystemWorker } from "./EaCDistributedFileSystemWorker.ts";

export class EaCDenoKVDistributedFileSystemWorker
  extends EaCDistributedFileSystemWorker {
  protected loadDFSHandlerResolver(): DFSFileHandlerResolver {
    return EaCDenoKVDistributedFileSystemHandlerResolver;
  }
}

// deno-lint-ignore no-explicit-any
new EaCDenoKVDistributedFileSystemWorker(self as any);
