import { EaCBaseClient } from "./EaCBaseClient.ts";

export class EaCInformantsClient extends EaCBaseClient {
  constructor(baseUrl: URL, apiToken: string) {
    super(baseUrl, apiToken);
  }
}
