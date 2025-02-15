import { DistributedFileSystemOptions } from "../_/DistributedFileSystemOptions.ts";
import {
  DFSFileHandler,
  DFSFileHandlerResolver,
  EaCDistributedFileSystemDetails,
  IoCContainer,
  isEaCAzureBlobStorageDistributedFileSystemDetails,
  isEaCDenoKVDistributedFileSystemDetails,
  isEaCESMDistributedFileSystemDetails,
  isEaCJSRDistributedFileSystemDetails,
  isEaCLocalDistributedFileSystemDetails,
  isEaCNPMDistributedFileSystemDetails,
  isEaCRemoteDistributedFileSystemDetails,
} from "./.deps.ts";

export class DefaultDFSFileHandlerResolver implements DFSFileHandlerResolver {
  public async Resolve(
    ioc: IoCContainer,
    dfs: EaCDistributedFileSystemDetails,
    options?: DistributedFileSystemOptions,
  ): Promise<DFSFileHandler | undefined> {
    let toResolveName: string = "";

    if (!options?.PreventWorkers && dfs.WorkerPath) {
      toResolveName = "EaCWorkerDistributedFileSystem";
    } else if (isEaCAzureBlobStorageDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCAzureBlobStorageDistributedFileSystem";
    } else if (isEaCDenoKVDistributedFileSystemDetails(dfs)) {
      toResolveName = "EaCDenoKVDistributedFileSystem";
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
    } else {
      toResolveName = "UnknownEaCDistributedFileSystem";
    }

    const resolver = await ioc.Resolve<DFSFileHandlerResolver>(
      ioc.Symbol("DFSFileHandler"),
      toResolveName,
    );

    return await resolver.Resolve(ioc, dfs, options);
  }
}
