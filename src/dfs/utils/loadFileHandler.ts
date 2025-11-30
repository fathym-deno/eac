import { IoCContainer } from "./.deps.ts";
import { IEaCDFSFileHandler } from "../handlers/IEaCDFSFileHandler.ts";
import {
  EaCDFSFileHandlerResolver,
  EaCDFSFileHandlerResolverOptions,
} from "../handlers/EaCDFSFileHandlerResolver.ts";
import { EaCDistributedFileSystemAsCode } from "../_/EaCDistributedFileSystemAsCode.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";

export async function loadDFSFileHandler(
  ioc: IoCContainer,
  dfss: Record<string, EaCDistributedFileSystemAsCode>,
  options: EaCDFSFileHandlerResolverOptions,
  dfsLookup: string,
): Promise<IEaCDFSFileHandler | undefined> {
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
  options: EaCDFSFileHandlerResolverOptions,
): Promise<IEaCDFSFileHandler | undefined> {
  const defaultDFSFileHandlerResolver = await ioc.Resolve<
    EaCDFSFileHandlerResolver
  >(ioc.Symbol("EaCDFSFileHandler"));

  const fileHandler = await defaultDFSFileHandlerResolver.Resolve(
    ioc,
    dfsLookup,
    dfs,
    options,
  );

  return fileHandler;
}
