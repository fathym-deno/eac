import { EaCVertexDetails } from "../../eac/EaCVertexDetails.ts";

export type EaCStateDetails = {
  DFSLookup: string;

  EntitiesDFSLookup: string;

  Priority: number;
} & EaCVertexDetails;

export function isEaCStateDetails(
  details: unknown,
): details is EaCStateDetails {
  const stateDetails = details as EaCStateDetails;

  return (
    stateDetails &&
    stateDetails.DFSLookup !== undefined &&
    typeof stateDetails.DFSLookup !== "string"
  );
}
