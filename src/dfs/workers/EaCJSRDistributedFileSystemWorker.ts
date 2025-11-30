import { EaCDFSFileHandlerResolver } from "../handlers/EaCDFSFileHandlerResolver.ts";
import { EaCJSRDFSHandlerResolver } from "../resolvers/EaCJSRDFSHandlerResolver.ts";
import { EaCDistributedFileSystemWorker } from "./EaCDistributedFileSystemWorker.ts";

export class EaCJSRDistributedFileSystemWorker
  extends EaCDistributedFileSystemWorker {
  protected loadDFSHandlerResolver(): EaCDFSFileHandlerResolver {
    return EaCJSRDFSHandlerResolver;
  }
}

// deno-lint-ignore no-explicit-any
new EaCJSRDistributedFileSystemWorker(self as any);
