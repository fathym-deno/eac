import { EaCStewardClient } from "../clients/EaCStewardClient.ts";
import { EaCStatus } from "./EaCStatus.ts";
import { withStatusCheck } from "./withStatusCheck.ts";

export async function waitForStatus(
  eacSvc: EaCStewardClient,
  entLookup: string,
  commitId: string,
  sleepFor = 400,
): Promise<EaCStatus> {
  return await withStatusCheck(async () => {
    return await eacSvc.Status.Get(commitId);
  }, sleepFor);
}
