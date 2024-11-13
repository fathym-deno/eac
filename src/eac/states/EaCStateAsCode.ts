import { EaCDetails } from "../../eac/EaCDetails.ts";
import { EaCStateDetails, isEaCStateDetails } from "./EaCStateDetails.ts";
import { EaCStateResolverConfiguration } from "./EaCStateResolverConfiguration.ts";

export type EaCStateAsCode = {
  ResolverConfigs: Record<string, EaCStateResolverConfiguration>;
} & EaCDetails<EaCStateDetails>;

export function isEaCStateAsCode(eac: unknown): eac is EaCStateAsCode {
  const proj = eac as EaCStateAsCode;

  return (
    proj &&
    proj.Details !== undefined &&
    isEaCStateDetails(proj.Details) &&
    proj.ResolverConfigs !== undefined
  );
}
