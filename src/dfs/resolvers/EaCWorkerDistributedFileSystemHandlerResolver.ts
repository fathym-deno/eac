import {
  buildWorkerDFSFileHandler,
  DFSFileHandler,
  DFSFileHandlerResolver,
} from "./.deps.ts";

export const EaCWorkerDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    Resolve(_ioc, dfs): Promise<DFSFileHandler | undefined> {
      if (!dfs.WorkerPath) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCWorkerDistributedFileSystemHandlerResolver.",
        );
      }

      return Promise.resolve(buildWorkerDFSFileHandler(dfs));
    },
  };
