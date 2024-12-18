import "jsr:@std/dotenv@0.225.2/load";
export { Logger } from "jsr:@std/log@0.224.9";

export { type URLMatch } from "jsr:@fathym/common@0.2.168/http";
export { LoggingProvider } from "jsr:@fathym/common@0.2.168/log";
export { merge } from "jsr:@fathym/common@0.2.168/merge";
export { generateDirectoryHash } from "jsr:@fathym/common@0.2.168/path";

export { IoCContainer } from "jsr:@fathym/ioc@0.0.13";

export type { EverythingAsCode } from "../../eac/.exports.ts";

export { type EaCRuntimeConfig, IS_BUILDING } from "../config/.exports.ts";

export { EaCLoggingProvider } from "../logging/.exports.ts";

export type { EaCRuntimePluginDef } from "../plugins/.exports.ts";

export {
  type EaCRuntimeHandler,
  EaCRuntimeHandlerPipeline,
  type EaCRuntimeHandlers,
  type EaCRuntimeHandlerSet,
  type EaCRuntimeHandlerRoute,
  type EaCRuntimeHandlerRouteGroup,
} from "../pipelines/.exports.ts";

export type {
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
} from "../plugins/.exports.ts";
