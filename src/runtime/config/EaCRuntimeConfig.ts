import { EaCRuntime, EverythingAsCode, LoggingProvider } from "./.deps.ts";
import { EaCRuntimeServer } from "./EaCRuntimeServer.ts";
import { EaCRuntimeSetupConfig } from "./EaCRuntimeSetupConfig.ts";

export type EaCRuntimeConfig<TEaC extends EverythingAsCode = EverythingAsCode> =
  & {
    LoggingProvider: LoggingProvider;

    Runtime: (cfg: EaCRuntimeConfig<TEaC>) => EaCRuntime<TEaC>;

    Servers?: EaCRuntimeServer[];
  }
  & EaCRuntimeSetupConfig<TEaC>;
