import {
  DFSFileHandler,
  DFSFileHandlerResolver,
  LocalDFSFileHandler,
} from "./.deps.ts";

export const UnknownEaCDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    Resolve(_ioc, _dfs): Promise<DFSFileHandler | undefined> {
      return Promise.resolve(new LocalDFSFileHandler("."));
    },
  };
