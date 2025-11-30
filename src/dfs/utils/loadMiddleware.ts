import { TelemetryLogger } from "./.deps.ts";
import { EaCRuntimeHandlerSet } from "../../runtime/pipelines/EaCRuntimeHandlerSet.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { EaCDFSFileHandler } from "../handlers/EaCDFSFileHandler.ts";
import { loadEaCRuntimeHandlers } from "./loadEaCRuntimeHandlers.ts";

export async function loadMiddleware(
  logger: TelemetryLogger,
  fileHandler: EaCDFSFileHandler,
  filePath: string,
  dfs: EaCDistributedFileSystemDetails,
  dfsLookup: string,
): Promise<[string, EaCRuntimeHandlerSet] | undefined> {
  const handler = await loadEaCRuntimeHandlers(
    logger,
    fileHandler,
    filePath,
    dfs,
    dfsLookup,
  );

  if (handler) {
    const root = filePath.replace("_middleware.ts", "");

    return [root, handler];
  } else {
    return undefined;
  }
}
