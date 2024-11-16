import { delay } from "./.deps.ts";
import { EaCStatus } from "./EaCStatus.ts";
import { EaCStatusProcessingTypes } from "./EaCStatusProcessingTypes.ts";

export async function withStatusCheck(
  action: () => Promise<EaCStatus | null>,
  sleepFor = 400,
): Promise<EaCStatus> {
  let status: EaCStatus | null = null;

  do {
    status = (await action()) || status;

    await delay(sleepFor);
  } while (
    status?.Processing != EaCStatusProcessingTypes.COMPLETE &&
    status?.Processing != EaCStatusProcessingTypes.ERROR
  );

  return status;
}
