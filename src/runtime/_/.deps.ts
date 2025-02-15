import "jsr:@std/dotenv@0.225.2/load";
export { Logger } from "jsr:@std/log@0.224.9";

export { type URLMatch } from "jsr:@fathym/common@0.2.175/http";
export { LoggingProvider } from "jsr:@fathym/common@0.2.175/log";
export { merge } from "jsr:@fathym/common@0.2.175/merge";
export { generateDirectoryHash } from "jsr:@fathym/common@0.2.175/path";

export { IoCContainer } from "jsr:@fathym/ioc@0.0.13";

export type { EverythingAsCode } from "../../eac/.exports.ts";

export {
  type EaCRuntimeConfig,
  type EaCRuntimePluginConfig,
  IS_BUILDING,
} from "../config/.exports.ts";

export { EaCLoggingProvider } from "../logging/.exports.ts";

export type { EaCRuntimePluginDef } from "../plugins/.exports.ts";

export {
  type EaCRuntimeHandler,
  EaCRuntimeHandlerPipeline,
  type EaCRuntimeHandlerRoute,
  type EaCRuntimeHandlerRouteGroup,
  type EaCRuntimeHandlers,
  type EaCRuntimeHandlerSet,
} from "../pipelines/.exports.ts";

export type { EaCRuntimePlugin } from "../plugins/.exports.ts";
