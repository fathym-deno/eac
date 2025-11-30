import { type IDFSFileHandler, IoCContainer } from "./.deps.ts";
import {
  DFSHandlerResolver,
  DFSHandlerResolverOptions,
} from "../resolvers/DFSHandlerResolver.ts";
import { EaCDistributedFileSystemAsCode } from "../_/EaCDistributedFileSystemAsCode.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";

/**
 * Load a DFS file handler by lookup name.
 * Returns base IDFSFileHandler from @fathym/dfs.
 */
export async function loadDFSFileHandler(
  ioc: IoCContainer,
  dfss: Record<string, EaCDistributedFileSystemAsCode>,
  options: DFSHandlerResolverOptions,
  dfsLookup: string,
): Promise<IDFSFileHandler | undefined> {
  const dfs = dfss[dfsLookup]?.Details;

  if (!dfs) {
    throw new Error(`Distributed file system not found: ${dfsLookup}`);
  }

  return loadFileHandler(ioc, dfsLookup, dfs, options);
}

/**
 * Load a DFS file handler from DFS details.
 * Returns base IDFSFileHandler from @fathym/dfs.
 */
export async function loadFileHandler(
  ioc: IoCContainer,
  dfsLookup: string,
  dfs: EaCDistributedFileSystemDetails,
  options: DFSHandlerResolverOptions,
): Promise<IDFSFileHandler | undefined> {
  const defaultDFSFileHandlerResolver = await ioc.Resolve<
    DFSHandlerResolver
  >(ioc.Symbol("DFSFileHandler"));

  const fileHandler = await defaultDFSFileHandlerResolver.Resolve(
    ioc,
    dfsLookup,
    dfs,
    options,
  );

  return fileHandler;
}
