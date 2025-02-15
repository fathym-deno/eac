import {
  DenoKVDFSFileHandler,
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

      // Resolve Deno.Kv instance from IoC
      const denoKv = await ioc.Resolve(Deno.Kv, dfs.DatabaseLookup);

      // Directly create an instance of DenoKVDFSFileHandler
      return new DenoKVDFSFileHandler(
        denoKv,
        dfs.RootKey || ["DFS"],
        dfs.FileRoot,
        dfs.SegmentPath,
      );
    },
  };
