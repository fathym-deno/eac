import { EaCRuntimeSetupConfig, EverythingAsCode } from "./.deps.ts";

export type EaCRuntimePluginConfig<
  TEaC extends EverythingAsCode = EverythingAsCode,
> = {
  Name: string;
} & EaCRuntimeSetupConfig<TEaC>;
