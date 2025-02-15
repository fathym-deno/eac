import { EaCRuntime, EverythingAsCode, LoggingProvider } from "./.deps.ts";
import { EaCRuntimeSetupConfig } from "./EaCRuntimeSetupConfig.ts";

export type EaCRuntimeConfig<TEaC extends EverythingAsCode = EverythingAsCode> =
  & {
    LoggingProvider: LoggingProvider;

    Runtime: (cfg: EaCRuntimeConfig<TEaC>) => EaCRuntime<TEaC>;

    Server: {
      StartRange?: [number, number];
    } & Deno.ServeTcpOptions;
  }
  & EaCRuntimeSetupConfig<TEaC>;
