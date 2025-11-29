export * as denoGraph from "jsr:@deno/graph@0.88.0";

export { Logger } from "jsr:@std/log@0.224.14/logger";
export * as path from "jsr:@std/path@1.0.8";

export { loadDenoConfig } from "jsr:@fathym/common@0.2.299/build";
export {
  DFSFileHandler as BaseDFSFileHandler,
  type DFSFileInfo,
  type IDFSFileHandler as BaseIDFSFileHandler,
} from "jsr:@fathym/dfs@0.0.43";
export { LocalDFSFileHandler as BaseLocalDFSFileHandler } from "jsr:@fathym/dfs@0.0.43/handlers";
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

// Azure handler re-export from eac-azure package
export {
  AzureBlobDFSFileHandler as BaseAzureBlobDFSFileHandler,
} from "jsr:@fathym/eac-azure@0.0.0/dfs";

// DenoKV handler re-export from eac-deno-kv package
export {
  DenoKVDFSFileHandler as BaseDenoKVDFSFileHandler,
} from "jsr:@fathym/eac-deno-kv@0.0.0/dfs";

// DenoKVFileStream stays in EaC utils (used for caching and revision management)
export {
  DenoKVFileStream,
  type DenoKVFileStreamData,
} from "../utils/DenoKVFileStream.ts";
