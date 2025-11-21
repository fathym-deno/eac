import { TelemetryLogger } from "./.deps.ts";
import { EaCRuntimeHandlerSet } from "../../runtime/pipelines/EaCRuntimeHandlerSet.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";
import { loadEaCRuntimeHandlers } from "./loadEaCRuntimeHandlers.ts";

export async function loadMiddleware(
  logger: TelemetryLogger,
  fileHandler: DFSFileHandler,
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
