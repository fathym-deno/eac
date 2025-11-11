import { DFSFileHandlerResolverOptions } from "../handlers/DFSFileHandlerResolver.ts";
import {
  DFSFileHandler,
  DFSFileHandlerResolver,
  EaCDistributedFileSystemDetails,
  EaCVirtualCompositeDistributedFileSystemDetails,
  IoCContainer,
  isEaCVirtualCompositeDistributedFileSystemDetails,
  VirtualCompositeDFSHandler,
} from "./.deps.ts";

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

      const baseHandlers = [];

      for (const baseLookup of baseLookups) {
        const resolver = await ioc.Resolve<DFSFileHandlerResolver>(
          ioc.Symbol("DFSFileHandler"),
        );

        const baseDFS = options?.EaC.DFSs?.[baseLookup];
        const baseDetails = baseDFS?.Details;

        if (!baseDetails) {
          throw new Error(
            `Missing DFS definition for base lookup '${baseLookup}' while configuring virtual composite DFS '${dfsLookup}'.`,
          );
        }

        const handler = await resolver.Resolve(
          ioc,
          baseLookup,
          baseDetails,
          options ?? {} as DFSFileHandlerResolverOptions,
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
