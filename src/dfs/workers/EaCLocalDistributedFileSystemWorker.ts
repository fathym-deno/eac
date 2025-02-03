import {
  DFSFileHandlerResolver,
  EaCLocalDistributedFileSystemHandlerResolver,
} from "./.deps.ts";
import { EaCDistributedFileSystemWorker } from "./EaCDistributedFileSystemWorker.ts";

export class EaCLocalDistributedFileSystemWorker
  extends EaCDistributedFileSystemWorker {
  protected loadDFSHandlerResolver(): DFSFileHandlerResolver {
    return EaCLocalDistributedFileSystemHandlerResolver;
  }
}

// deno-lint-ignore no-explicit-any
new EaCLocalDistributedFileSystemWorker(self as any);
