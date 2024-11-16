export type EaCActuatorErrorResponse = {
  HasError: true;

  Messages: Record<string, unknown>;
};

export function isEaCActuatorErrorResponse(
  res: unknown,
): res is EaCActuatorErrorResponse {
  const x = res as EaCActuatorErrorResponse;

  return (
    x.HasError !== undefined &&
    x.HasError &&
    typeof x.HasError === "boolean" &&
    x.Messages !== undefined
  );
}
