import {
  buildFetchDFSFileHandler,
  DFSFileHandler,
  DFSFileHandlerResolver,
  isEaCRemoteDistributedFileSystemDetails,
} from "./.deps.ts";

export const EaCRemoteDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    Resolve(_ioc, dfs): Promise<DFSFileHandler | undefined> {
      if (!isEaCRemoteDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCRemoteDistributedFileSystemHandlerResolver.",
        );
      }

      const fileRoot = new URL(dfs.RemoteRoot);

      return Promise.resolve(buildFetchDFSFileHandler(fileRoot.href));
    },
  };
