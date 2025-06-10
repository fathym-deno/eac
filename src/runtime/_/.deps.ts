import "jsr:@std/dotenv@0.225.3/load";

export { STATUS_CODE } from "jsr:@std/http@1.0.9/status";
export { Logger } from "jsr:@std/log@0.224.14";

export { buildURLMatch, type URLMatch } from "jsr:@fathym/common@0.2.261/http";
export { LoggingProvider } from "jsr:@fathym/common@0.2.261/log";
export { merge } from "jsr:@fathym/common@0.2.261/merge";
export { generateDirectoryHash } from "jsr:@fathym/common@0.2.261/path";

export { IoCContainer } from "jsr:@fathym/ioc@0.0.14";

export { IS_DENO_DEPLOY } from "../config/.exports.ts";
export type { ESBuild } from "../../esbuild/.exports.ts";

export type { EverythingAsCode } from "../../eac/.exports.ts";

export {
  type EaCRuntimeConfig,
  type EaCRuntimePluginConfig,
  IS_BUILDING,
} from "../config/.exports.ts";

export {
  DenoServeProtocolGateway as DenoServeEaCProtocolGateway,
  type ProtocolGateway as EaCProtocolGateway,
} from "../gateways/.exports.ts";

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
