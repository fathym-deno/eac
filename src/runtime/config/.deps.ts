export * as colors from "jsr:@std/fmt@1.0.5/colors";

export { merge, mergeWithArrays } from "jsr:@fathym/common@0.2.272/merge";
export {
  getPackageLoggerSync,
  LoggingProvider,
} from "jsr:@fathym/common@0.2.272/log";

export { IoCContainer } from "jsr:@fathym/ioc@0.0.14";

export type { EverythingAsCode } from "../../eac/.exports.ts";

export { type EaCRuntime, GenericEaCRuntime } from "../_/.exports.ts";

export { EaCLoggingProvider } from "../logging/.exports.ts";

export type {
  EaCRuntimeHandler,
  EaCRuntimeHandlers,
  EaCRuntimeHandlerSet,
} from "../pipelines/.exports.ts";

export type { EaCRuntimePluginDef } from "../plugins/.exports.ts";
