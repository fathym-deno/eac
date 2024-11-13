import { EaCDetails } from "../../eac/EaCDetails.ts";
import {
  EaCStateEntityDetails,
  isEaCStateEntityDetails,
} from "./EaCStateEntityDetails.ts";
import { EaCStateResolverConfiguration } from "./EaCStateResolverConfiguration.ts";

export type EaCStateEntityAsCode = {
  ModifierResolvers?: Record<string, EaCStateResolverConfiguration>;
} & EaCDetails<EaCStateEntityDetails>;

export function isEaCStateEntityAsCode(
  eac: unknown,
): eac is EaCStateEntityAsCode {
  const ent = eac as EaCStateEntityAsCode;

  return (
    ent &&
    ent.Details !== undefined &&
    isEaCStateEntityDetails(ent.Details)
  );
}
