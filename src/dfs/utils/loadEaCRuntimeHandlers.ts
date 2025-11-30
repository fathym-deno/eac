import { TelemetryLogger } from "./.deps.ts";
import { EaCRuntimeHandlerSet } from "../../runtime/pipelines/EaCRuntimeHandlerSet.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { EaCDFSFileHandler } from "../handlers/EaCDFSFileHandler.ts";
import { importDFSTypescriptModule } from "./importDFSTypescriptModule.ts";

export async function loadEaCRuntimeHandlers(
  logger: TelemetryLogger,
  fileHandler: EaCDFSFileHandler,
  filePath: string,
  dfs: EaCDistributedFileSystemDetails,
  dfsLookup: string,
): Promise<EaCRuntimeHandlerSet | undefined> {
  const apiModule = await importDFSTypescriptModule(
    logger,
    fileHandler,
    filePath,
    dfs,
    dfsLookup,
    "ts",
  );

  if (apiModule) {
    const handlers = apiModule.module.handler as EaCRuntimeHandlerSet;

    const defaultHandlers = apiModule.module.default as EaCRuntimeHandlerSet;

    return handlers || defaultHandlers;
    // const pipeline = new EaCRuntimeHandlerPipeline();

    // console.log(filePath);
    // console.log(pipeline.pipeline);
    // pipeline.Append(handlers, defaultHandlers);
    // console.log(pipeline.pipeline);

    // return (req, ctx) => pipeline.Execute(req, ctx);
  } else {
    return undefined;
  }
}
