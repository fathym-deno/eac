import { IoCContainer } from "./.deps.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { isEaCESMDistributedFileSystemDetails } from "../_/EaCESMDistributedFileSystemDetails.ts";
import { isEaCJSRDistributedFileSystemDetails } from "../_/EaCJSRDistributedFileSystemDetails.ts";
import { isEaCLocalDistributedFileSystemDetails } from "../_/EaCLocalDistributedFileSystemDetails.ts";
import { isEaCNPMDistributedFileSystemDetails } from "../_/EaCNPMDistributedFileSystemDetails.ts";
import { isEaCRemoteDistributedFileSystemDetails } from "../_/EaCRemoteDistributedFileSystemDetails.ts";
import { isEaCVirtualCompositeDistributedFileSystemDetails } from "../_/EaCVirtualCompositeDistributedFileSystemDetails.ts";
import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";
import {
  DFSFileHandlerResolver,
  DFSFileHandlerResolverOptions,
} from "../handlers/DFSFileHandlerResolver.ts";

/**
 * Default DFS File Handler Resolver.
 * Dispatches to the appropriate specific resolver based on the DFS type.
 * Provider-specific handlers (Azure, DenoKV) are registered via their respective packages.
 */
export class DefaultDFSFileHandlerResolver implements DFSFileHandlerResolver {
  public async Resolve(
    ioc: IoCContainer,
    dfsLookup: string,
    dfs: EaCDistributedFileSystemDetails,
    options?: DFSFileHandlerResolverOptions,
  ): Promise<DFSFileHandler | undefined> {
    let toResolveName: string = "";

    if (!options?.PreventWorkers && dfs.WorkerPath) {
      toResolveName = "EaCWorkerDistributedFileSystem";
    } else if (isEaCESMDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCESMDistributedFileSystem";
    } else if (isEaCJSRDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCJSRDistributedFileSystem";
    } else if (isEaCLocalDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCLocalDistributedFileSystem";
    } else if (isEaCNPMDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCNPMDistributedFileSystem";
    } else if (isEaCRemoteDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCRemoteDistributedFileSystem";
    } else if (isEaCVirtualCompositeDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCVirtualCompositeDistributedFileSystem";
    } else {
      toResolveName = "UnknownEaCDistributedFileSystem";
    }

    const resolver = await ioc.Resolve<DFSFileHandlerResolver>(
      ioc.Symbol("DFSFileHandler"),
      toResolveName,
    );

    return await resolver.Resolve(ioc, dfsLookup, dfs, options);
  }
}
