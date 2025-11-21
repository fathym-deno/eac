import { isEaCDenoKVDistributedFileSystemDetails } from "../_/EaCDenoKVDistributedFileSystemDetails.ts";
import { DenoKVDFSFileHandler } from "../handlers/DenoKVDFSFileHandler.ts";
import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";
import { DFSFileHandlerResolver } from "../handlers/DFSFileHandlerResolver.ts";

export const EaCDenoKVDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(ioc, dfsLookup, dfs): Promise<DFSFileHandler | undefined> {
      if (!isEaCDenoKVDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCDenoKVDistributedFileSystemHandlerResolver.",
        );
      }

      // Resolve Deno.Kv instance from IoC
      const denoKv = await ioc.Resolve(Deno.Kv, dfs.DatabaseLookup);

      // Directly create an instance of DenoKVDFSFileHandler
      return new DenoKVDFSFileHandler(dfsLookup, dfs, denoKv);
    },
  };
