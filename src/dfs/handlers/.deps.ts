export * as denoGraph from "jsr:@deno/graph@0.88.0";

export { Logger } from "jsr:@std/log@0.224.14/logger";
export * as path from "jsr:@std/path@1.0.8";

export { loadDenoConfig } from "jsr:@fathym/common@0.2.299/build";
export {
  DFSFileHandler as BaseDFSFileHandler,
  type DFSFileInfo,
  type IDFSFileHandler as BaseIDFSFileHandler,
} from "jsr:@fathym/dfs@0.0.48";
export {
  CompositeDFSFileHandler as BaseCompositeDFSFileHandler,
  LocalDFSFileHandler as BaseLocalDFSFileHandler,
  type LocalDFSFileHandlerDetails as BaseLocalDFSFileHandlerDetails,
} from "jsr:@fathym/dfs@0.0.48/handlers";
export {
  ESMFetchDFSFileHandler as BaseESMFetchDFSFileHandler,
  type ESMFetchDFSFileHandlerDetails as BaseESMFetchDFSFileHandlerDetails,
  FetchDFSFileHandler as BaseFetchDFSFileHandler,
  type FetchDFSFileHandlerDetails as BaseFetchDFSFileHandlerDetails,
  JSRFetchDFSFileHandler as BaseJSRFetchDFSFileHandler,
  type JSRFetchDFSFileHandlerDetails as BaseJSRFetchDFSFileHandlerDetails,
  NPMFetchDFSFileHandler as BaseNPMFetchDFSFileHandler,
  type NPMFetchDFSFileHandlerDetails as BaseNPMFetchDFSFileHandlerDetails,
  RemoteFetchDFSFileHandler as BaseRemoteFetchDFSFileHandler,
  type RemoteFetchDFSFileHandlerDetails as BaseRemoteFetchDFSFileHandlerDetails,
} from "jsr:@fathym/dfs@0.0.48/handlers/fetch";
export { getFileCheckPathsToProcess } from "jsr:@fathym/dfs@0.0.48/utils";
export {
  getPackageLogger,
  getPackageLoggerSync,
  LoggingProvider,
} from "jsr:@fathym/common@0.2.299/log";
export {
  telemetryForSync,
  type TelemetryLogger,
} from "jsr:@fathym/common@0.2.299/telemetry";
export { existsSync, getFilesList } from "jsr:@fathym/common@0.2.299/path";

export { IoCContainer } from "jsr:@fathym/ioc@0.0.21";

// DenoKVFileStream stays in EaC utils (used for caching and revision management)
export {
  DenoKVFileStream,
  type DenoKVFileStreamData,
} from "../utils/DenoKVFileStream.ts";
