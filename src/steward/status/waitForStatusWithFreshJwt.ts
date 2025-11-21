import { EaCStewardClient } from "../clients/EaCStewardClient.ts";
import { loadEaCStewardSvc } from "../clients/loadEaCStewardSvc.ts";
import { EaCStatus } from "./EaCStatus.ts";
import { EaCStatusProcessingTypes } from "./EaCStatusProcessingTypes.ts";
import { withStatusCheck } from "./withStatusCheck.ts";

export async function waitForStatusWithFreshJwt(
  parentEaCSvc: EaCStewardClient,
  entLookup: string,
  commitId: string,
  username: string,
  sleepFor = 400,
): Promise<EaCStatus> {
  return await withStatusCheck(async () => {
    const eacJwt = await parentEaCSvc.EaC.JWT(entLookup, username);

    if (!eacJwt.Token) {
      return {
        EnterpriseLookup: entLookup,
        ID: commitId,
        Messages: { Operation: "Waiting for valid JWT" },
        Processing: EaCStatusProcessingTypes.QUEUED,
        StartTime: new Date(),
        Username: username,
      };
    }

    const eacSvc = await loadEaCStewardSvc(eacJwt.Token);

    return await eacSvc.Status.Get(commitId);
  }, sleepFor);
}
