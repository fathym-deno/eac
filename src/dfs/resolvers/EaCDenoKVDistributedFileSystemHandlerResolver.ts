import {
  buildDenoKVDFSFileHandler,
  DFSFileHandler,
  DFSFileHandlerResolver,
  isEaCDenoKVDistributedFileSystemDetails,
} from "./.deps.ts";

export const EaCDenoKVDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(ioc, dfs): Promise<DFSFileHandler | undefined> {
      if (!isEaCDenoKVDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCDenoKVDistributedFileSystemHandlerResolver.",
        );
      }

      const denoKv = await ioc.Resolve(Deno.Kv, dfs.DatabaseLookup);

      return buildDenoKVDFSFileHandler(
        denoKv,
        dfs.RootKey || ["DFS"],
        dfs.FileRoot,
        dfs.SegmentPath,
      );
    },
  };
