import {
  DFSFileHandlerResolver,
  EaCESMDistributedFileSystemHandlerResolver,
} from "./.deps.ts";
import { EaCDistributedFileSystemWorker } from "./EaCDistributedFileSystemWorker.ts";

export class EaCESMDistributedFileSystemWorker
  extends EaCDistributedFileSystemWorker {
  protected loadDFSHandlerResolver(): DFSFileHandlerResolver {
    return EaCESMDistributedFileSystemHandlerResolver;
  }
}

// deno-lint-ignore no-explicit-any
new EaCESMDistributedFileSystemWorker(self as any);
