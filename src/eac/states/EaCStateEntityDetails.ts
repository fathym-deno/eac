import { EaCVertexDetails } from "../../eac/EaCVertexDetails.ts";

export type EaCStateEntityDetails = {
  DFSLookup: string;
} & EaCVertexDetails;

export function isEaCStateEntityDetails(
  details: unknown,
): details is EaCStateEntityDetails {
  const stateDetails = details as EaCStateEntityDetails;

  return (
    stateDetails &&
    stateDetails.DFSLookup !== undefined &&
    typeof stateDetails.DFSLookup !== "string"
  );
}
