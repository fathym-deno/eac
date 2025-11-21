import { IoCContainer } from "./.deps.ts";
import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";
import {
  DFSFileHandlerResolver,
  DFSFileHandlerResolverOptions,
} from "../handlers/DFSFileHandlerResolver.ts";
import { EaCDistributedFileSystemAsCode } from "../_/EaCDistributedFileSystemAsCode.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";

export async function loadDFSFileHandler(
  ioc: IoCContainer,
  dfss: Record<string, EaCDistributedFileSystemAsCode>,
  options: DFSFileHandlerResolverOptions,
  dfsLookup: string,
): Promise<DFSFileHandler | undefined> {
  const dfs = dfss[dfsLookup]?.Details;

  if (!dfs) {
    throw new Error(`Distributed file system not found: ${dfsLookup}`);
  }

  return loadFileHandler(ioc, dfsLookup, dfs, options);
}

export async function loadFileHandler(
  ioc: IoCContainer,
  dfsLookup: string,
  dfs: EaCDistributedFileSystemDetails,
  options: DFSFileHandlerResolverOptions,
): Promise<DFSFileHandler | undefined> {
  const defaultDFSFileHandlerResolver = await ioc.Resolve<
    DFSFileHandlerResolver
  >(ioc.Symbol("DFSFileHandler"));

  const fileHandler = await defaultDFSFileHandlerResolver.Resolve(
    ioc,
    dfsLookup,
    dfs,
    options,
  );

  return fileHandler;
}
