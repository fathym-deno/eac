import { EaCLoggingProvider, EaCRuntime, LoggingProvider, mergeWithArrays } from "./.deps.ts";
import { GenericEaCConfig } from "./GenericEaCConfig.ts";
import { EaCRuntimeConfig } from "./EaCRuntimeConfig.ts";

export async function defineEaCConfig(
  runtime: (cgg: EaCRuntimeConfig) => EaCRuntime,
  loggingProvider: LoggingProvider = new EaCLoggingProvider(),
  config: Partial<EaCRuntimeConfig> | Promise<Partial<EaCRuntimeConfig>>,
): Promise<EaCRuntimeConfig> {
  return mergeWithArrays(
    GenericEaCConfig(runtime, loggingProvider),
    await config,
  );
}
