import { IEaCDFSFileHandler } from "../handlers/IEaCDFSFileHandler.ts";
import { EaCDFSFileHandlerResolver } from "../handlers/EaCDFSFileHandlerResolver.ts";
import { EaCLocalDFSFileHandler } from "../handlers/EaCLocalDFSFileHandler.ts";

export const UnknownEaCDFSHandlerResolver: EaCDFSFileHandlerResolver = {
  Resolve(_ioc, dfsLookup, _dfs): Promise<IEaCDFSFileHandler | undefined> {
    return Promise.resolve(
      new EaCLocalDFSFileHandler(dfsLookup, {
        Type: "Local",
        FileRoot: ".",
      }),
    );
  },
};
