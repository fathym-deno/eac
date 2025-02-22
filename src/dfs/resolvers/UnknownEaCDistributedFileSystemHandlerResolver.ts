import { EaCLocalDistributedFileSystemDetails } from "../handlers/.deps.ts";
import {
  DFSFileHandler,
  DFSFileHandlerResolver,
  LocalDFSFileHandler,
} from "./.deps.ts";

export const UnknownEaCDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    Resolve(_ioc, dfsLookup, _dfs): Promise<DFSFileHandler | undefined> {
      return Promise.resolve(
        new LocalDFSFileHandler(dfsLookup, {
          Details: {
            Type: "Local",
            FileRoot: ".",
          } as EaCLocalDistributedFileSystemDetails,
        }),
      );
    },
  };
