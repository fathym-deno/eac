import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";
import { DFSFileHandlerResolver } from "../handlers/DFSFileHandlerResolver.ts";
import { LocalDFSFileHandler } from "../handlers/LocalDFSFileHandler.ts";

export const UnknownEaCDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    Resolve(_ioc, dfsLookup, _dfs): Promise<DFSFileHandler | undefined> {
      return Promise.resolve(
        new LocalDFSFileHandler(dfsLookup, {
          Type: "Local",
          FileRoot: ".",
        }),
      );
    },
  };
