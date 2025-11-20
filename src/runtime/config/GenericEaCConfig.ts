import { colors, EaCLoggingProvider, EaCRuntime, getPackageLoggerSync, LoggingProvider } from "./.deps.ts";
import { fathymGreen } from "./constants.ts";
import { EaCRuntimeConfig } from "./EaCRuntimeConfig.ts";

export const GenericEaCConfig = (
  runtime: (cgg: EaCRuntimeConfig) => EaCRuntime,
  loggingProvider: LoggingProvider,
) => ({
  LoggingProvider: loggingProvider,
  Runtime: (cfg: EaCRuntimeConfig) => runtime(cfg),
  EaC: { EnterpriseLookup: "default-eac" },
  Servers: [
    {
      Lookup: "",
    },
  ],
} as EaCRuntimeConfig);
