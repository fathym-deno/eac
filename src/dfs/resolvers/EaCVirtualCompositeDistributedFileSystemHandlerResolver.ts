import { IoCContainer } from "./.deps.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import {
  EaCVirtualCompositeDistributedFileSystemDetails,
  isEaCVirtualCompositeDistributedFileSystemDetails,
} from "../_/EaCVirtualCompositeDistributedFileSystemDetails.ts";
import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";
import {
  DFSFileHandlerResolver,
  DFSFileHandlerResolverOptions,
} from "../handlers/DFSFileHandlerResolver.ts";
import { VirtualCompositeDFSHandler } from "../handlers/VirtualCompositeDFSHandler.ts";
import { loadDFSFileHandler } from "../utils/loadFileHandler.ts";

export const EaCVirtualCompositeDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(
      ioc: IoCContainer,
      dfsLookup: string,
      dfs: EaCDistributedFileSystemDetails,
      options?: DFSFileHandlerResolverOptions,
    ): Promise<DFSFileHandler | undefined> {
      if (!isEaCVirtualCompositeDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCVirtualCompositeDistributedFileSystemHandlerResolver.",
        );
      }

      const virtual = dfs as EaCVirtualCompositeDistributedFileSystemDetails;

      const baseLookups = virtual.BaseDFSLookups ?? [];

      if (!baseLookups.length) {
        throw new Error(
          `Virtual composite DFS '${dfsLookup}' must specify at least one base DFS lookup.`,
        );
      }

      const resolverOptions = options;

      if (!resolverOptions?.EaC?.DFSs) {
        throw new Error(
          `Missing DFS definitions while configuring virtual composite DFS '${dfsLookup}'.`,
        );
      }

      const baseHandlers = [];

      for (const baseLookup of baseLookups) {
        const handler = await loadDFSFileHandler(
          ioc,
          resolverOptions.EaC.DFSs,
          resolverOptions,
          baseLookup,
        );

        if (!handler) {
          throw new Error(
            `Failed to resolve DFS handler for base lookup '${baseLookup}' while configuring virtual composite DFS '${dfsLookup}'.`,
          );
        }

        baseHandlers.push(handler);
      }

      return new VirtualCompositeDFSHandler(dfsLookup, virtual, baseHandlers);
    },
  };
