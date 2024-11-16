export type EaCActuatorCheckResponse = {
  CorelationID: string;

  Complete: boolean;

  HasError: boolean;

  Messages: Record<string, unknown>;
};

export function isEaCActuatorCheckResponse(
  res: unknown,
): res is EaCActuatorCheckResponse {
  const x = res as EaCActuatorCheckResponse;

  return (
    x.Complete !== undefined &&
    typeof x.Complete === "boolean" &&
    x.HasError !== undefined &&
    typeof x.HasError === "boolean" &&
    x.Messages !== undefined
  );
}
