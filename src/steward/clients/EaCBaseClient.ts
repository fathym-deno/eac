import { Logger } from "./.deps.ts";

export class EaCBaseClient {
  /** */
  constructor(protected baseUrl: URL, protected apiToken: string) {}

  //#region API Methods
  //#endregion

  //#region Helpers
  protected loadClientUrl(refPath: string | URL): string | URL {
    const clientUrl = new URL(refPath, this.baseUrl);

    return clientUrl;
  }

  protected loadHeaders(
    headers: HeadersInit | undefined = undefined,
  ): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
      ...(headers || {}),
    };
  }

  protected async json<T extends unknown>(
    response: Response,
    defaultResp: T = {} as T,
  ): Promise<T> {
    const text = await response.text();

    try {
      return JSON.parse(text) as T;
    } catch (err) {
      throw new Error(text);
    }
  }
  //#endregion
}
