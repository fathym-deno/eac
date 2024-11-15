import { EaCRuntime, mergeWithArrays } from "./.deps.ts";
import { GenericEaCConfig } from "./GenericEaCConfig.ts";
import { EaCRuntimeConfig } from "./EaCRuntimeConfig.ts";

export async function defineEaCConfig(
  runtime: EaCRuntime,
  config: Partial<EaCRuntimeConfig> | Promise<Partial<EaCRuntimeConfig>>,
): Promise<EaCRuntimeConfig> {
  return mergeWithArrays(GenericEaCConfig(runtime), await config);
}
