export type EaCCommitResponse = {
  CommitID: string;

  EnterpriseLookup: string;

  Message: string;
};

export function isEaCCommitResponse(res: unknown): res is EaCCommitResponse {
  const commitResponse = res as EaCCommitResponse;

  return (
    commitResponse.CommitID !== undefined &&
    typeof commitResponse.CommitID === "string" &&
    commitResponse.Message !== undefined &&
    typeof commitResponse.Message === "string"
  );
}
