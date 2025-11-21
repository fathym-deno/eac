import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { EaCRuntimeSetupConfig } from "./EaCRuntimeSetupConfig.ts";

export type EaCRuntimePluginConfig<
  TEaC extends EverythingAsCode = EverythingAsCode,
> = {
  Name: string;
} & EaCRuntimeSetupConfig<TEaC>;
