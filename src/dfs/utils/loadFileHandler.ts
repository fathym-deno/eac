import {
  DFSFileHandler,
  DFSFileHandlerResolver,
  type EaCDistributedFileSystemDetails,
  IoCContainer,
} from "./.deps.ts";

export async function loadFileHandler(
  ioc: IoCContainer,
  dfs: EaCDistributedFileSystemDetails,
): Promise<DFSFileHandler | undefined> {
  const defaultDFSFileHandlerResolver = await ioc.Resolve<
    DFSFileHandlerResolver
  >(ioc.Symbol("DFSFileHandler"));

  const fileHandler = await defaultDFSFileHandlerResolver.Resolve(ioc, dfs);

  return fileHandler;
}
