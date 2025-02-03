import {
  buildFetchDFSFileHandler,
  DFSFileHandler,
  DFSFileHandlerResolver,
  isEaCNPMDistributedFileSystemDetails,
} from "./.deps.ts";

export const EaCNPMDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    Resolve(_ioc, dfs): Promise<DFSFileHandler | undefined> {
      if (!isEaCNPMDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCNPMDistributedFileSystemHandlerResolver.",
        );
      }

      const fileRoot = new URL(`${dfs.Package}/`, "https://cdn.skypack.dev/");

      return Promise.resolve(buildFetchDFSFileHandler(fileRoot.href));
    },
  };
