import {
  DFSFileHandlerResolver,
  EaCAzureBlobStorageDistributedFileSystemHandlerResolver,
} from "./.deps.ts";
import { EaCDistributedFileSystemWorker } from "./EaCDistributedFileSystemWorker.ts";

export class EaCAzureBlobStorageDistributedFileSystemWorker
  extends EaCDistributedFileSystemWorker {
  protected loadDFSHandlerResolver(): DFSFileHandlerResolver {
    return EaCAzureBlobStorageDistributedFileSystemHandlerResolver;
  }
}

// deno-lint-ignore no-explicit-any
new EaCAzureBlobStorageDistributedFileSystemWorker(self as any);
