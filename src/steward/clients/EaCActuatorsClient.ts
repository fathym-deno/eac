import { EaCBaseClient } from "./EaCBaseClient.ts";

export class EaCActuatorsClient extends EaCBaseClient {
  constructor(baseUrl: URL, apiToken: string) {
    super(baseUrl, apiToken);
  }
}
