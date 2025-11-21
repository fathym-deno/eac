import { DFSFileHandlerResolver } from "../handlers/DFSFileHandlerResolver.ts";
import { EaCLocalDistributedFileSystemHandlerResolver } from "../resolvers/EaCLocalDistributedFileSystemHandlerResolver.ts";
import { EaCDistributedFileSystemWorker } from "./EaCDistributedFileSystemWorker.ts";

export class EaCLocalDistributedFileSystemWorker
  extends EaCDistributedFileSystemWorker {
  protected loadDFSHandlerResolver(): DFSFileHandlerResolver {
    return EaCLocalDistributedFileSystemHandlerResolver;
  }
}

// deno-lint-ignore no-explicit-any
new EaCLocalDistributedFileSystemWorker(self as any);
