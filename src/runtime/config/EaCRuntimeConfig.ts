import { LoggingProvider } from "./.deps.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { EaCRuntime } from "../_/EaCRuntime.ts";
import { EaCRuntimeServer } from "./EaCRuntimeServer.ts";
import { EaCRuntimeSetupConfig } from "./EaCRuntimeSetupConfig.ts";

export type EaCRuntimeConfig<TEaC extends EverythingAsCode = EverythingAsCode> =
  & {
    LoggingProvider: LoggingProvider;

    Runtime: (cfg: EaCRuntimeConfig<TEaC>) => EaCRuntime<TEaC>;

    Servers?: EaCRuntimeServer[];
  }
  & EaCRuntimeSetupConfig<TEaC>;
