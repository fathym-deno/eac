import {
  getPackageLogger,
  type IDFSFileHandler,
  IoCContainer,
} from "./.deps.ts";
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
  const logger = await getPackageLogger(import.meta);

  logger.debug(`[load-dfs] loading lookup=${dfsLookup}`);

  const dfs = dfss[dfsLookup]?.Details;

  if (!dfs) {
    logger.error(
      `[load-dfs] not found lookup=${dfsLookup} available=${
        Object.keys(dfss).join(",")
      }`,
    );
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
  const logger = await getPackageLogger(import.meta);

  logger.debug(`[load-handler] resolving lookup=${dfsLookup} type=${dfs.Type}`);

  const defaultDFSFileHandlerResolver = await ioc.Resolve<
    DFSHandlerResolver
  >(ioc.Symbol("DFSFileHandler"));

  if (!defaultDFSFileHandlerResolver) {
    logger.error(
      `[load-handler] no DFSFileHandler resolver in IoC lookup=${dfsLookup}`,
    );
    throw new Error(
      `No DFSFileHandler resolver registered in IoC for: ${dfsLookup}`,
    );
  }

  const fileHandler = await defaultDFSFileHandlerResolver.Resolve(
    ioc,
    dfsLookup,
    dfs,
    options,
  );

  if (!fileHandler) {
    logger.warn(
      `[load-handler] resolver returned undefined lookup=${dfsLookup}`,
    );
  } else {
    logger.debug(`[load-handler] resolved lookup=${dfsLookup}`);
  }

  return fileHandler;
}
