import {
  buildLocalDFSFileHandler,
  DFSFileHandler,
  DFSFileHandlerResolver,
  isEaCLocalDistributedFileSystemDetails,
} from "./.deps.ts";

export const EaCLocalDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    Resolve(_ioc, dfs): Promise<DFSFileHandler | undefined> {
      if (!isEaCLocalDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCLocalDistributedFileSystemHandlerResolver.",
        );
      }

      return Promise.resolve(buildLocalDFSFileHandler(dfs.FileRoot));
    },
  };
