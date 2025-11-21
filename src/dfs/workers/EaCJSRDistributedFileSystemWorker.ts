import { DFSFileHandlerResolver } from "../handlers/DFSFileHandlerResolver.ts";
import { EaCJSRDistributedFileSystemHandlerResolver } from "../resolvers/EaCJSRDistributedFileSystemHandlerResolver.ts";
import { EaCDistributedFileSystemWorker } from "./EaCDistributedFileSystemWorker.ts";

export class EaCJSRDistributedFileSystemWorker
  extends EaCDistributedFileSystemWorker {
  protected loadDFSHandlerResolver(): DFSFileHandlerResolver {
    return EaCJSRDistributedFileSystemHandlerResolver;
  }
}

// deno-lint-ignore no-explicit-any
new EaCJSRDistributedFileSystemWorker(self as any);
