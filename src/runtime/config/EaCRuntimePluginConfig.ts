import { EaCRuntimeHandlerRouteGroup } from "../pipelines/.exports.ts";
import { EaCRuntimeSetupConfig, EverythingAsCode } from "../plugins/.deps.ts";

export type EaCRuntimePluginConfig<
  TEaC extends EverythingAsCode = EverythingAsCode,
> = {
  Name: string;
} & EaCRuntimeSetupConfig<TEaC>;
