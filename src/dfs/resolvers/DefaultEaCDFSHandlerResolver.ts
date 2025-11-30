import { type IDFSFileHandler, IoCContainer } from "./.deps.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { isEaCESMDistributedFileSystemDetails } from "../_/EaCESMDistributedFileSystemDetails.ts";
import { isEaCJSRDistributedFileSystemDetails } from "../_/EaCJSRDistributedFileSystemDetails.ts";
import { isEaCLocalDistributedFileSystemDetails } from "../_/EaCLocalDistributedFileSystemDetails.ts";
import { isEaCNPMDistributedFileSystemDetails } from "../_/EaCNPMDistributedFileSystemDetails.ts";
import { isEaCRemoteDistributedFileSystemDetails } from "../_/EaCRemoteDistributedFileSystemDetails.ts";
import { isEaCVirtualCompositeDistributedFileSystemDetails } from "../_/EaCVirtualCompositeDistributedFileSystemDetails.ts";
import {
  DFSHandlerResolver,
  DFSHandlerResolverOptions,
} from "./DFSHandlerResolver.ts";

/**
 * Default DFS File Handler Resolver.
 * Dispatches to the appropriate specific resolver based on the DFS type.
 * Returns base IDFSFileHandler from @fathym/dfs.
 * Provider-specific handlers (Azure, DenoKV) are registered via their respective packages.
 */
export class DefaultEaCDFSHandlerResolver implements DFSHandlerResolver {
  public async Resolve(
    ioc: IoCContainer,
    dfsLookup: string,
    dfs: EaCDistributedFileSystemDetails,
    options?: DFSHandlerResolverOptions,
  ): Promise<IDFSFileHandler | undefined> {
    let toResolveName: string = "";

    if (!options?.PreventWorkers && dfs.WorkerPath) {
      toResolveName = "EaCWorkerDFS";
    } else if (isEaCESMDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCESMDFS";
    } else if (isEaCJSRDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCJSRDFS";
    } else if (isEaCLocalDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCLocalDFS";
    } else if (isEaCNPMDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCNPMDFS";
    } else if (isEaCRemoteDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCRemoteDFS";
    } else if (isEaCVirtualCompositeDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCVirtualCompositeDFS";
    } else {
      toResolveName = "UnknownEaCDFS";
    }

    const resolver = await ioc.Resolve<DFSHandlerResolver>(
      ioc.Symbol("DFSFileHandler"),
      toResolveName,
    );

    return await resolver.Resolve(ioc, dfsLookup, dfs, options);
  }
}
