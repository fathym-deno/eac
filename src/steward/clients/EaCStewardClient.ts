import {
  EaCCommitResponse,
  EaCStatus,
  EaCStatusProcessingTypes,
  EverythingAsCode,
  Logger,
  NullableArrayOrObject,
} from "./.deps.ts";
import { EaCBaseClient } from "./EaCBaseClient.ts";

export class EaCStewardClient extends EaCBaseClient {
  constructor(baseUrl: URL, apiToken: string) {
    super(baseUrl, apiToken);
  }

  public EaC = {
    Commit: async <T extends EverythingAsCode>(
      eac: T,
      processingSeconds: number,
    ): Promise<EaCCommitResponse> => {
      const response = await fetch(
        this.loadClientUrl(
          `${eac.EnterpriseLookup}?processingSeconds=${processingSeconds}`,
        ),
        {
          method: "POST",
          headers: this.loadHeaders(),
          body: JSON.stringify(eac),
        },
      );

      return await this.json(response);
    },

    Connections: async <T extends EverythingAsCode>(eac: T): Promise<T> => {
      const response = await fetch(
        this.loadClientUrl(`${eac.EnterpriseLookup}/connections`),
        {
          method: "POST",
          headers: this.loadHeaders(),
          body: JSON.stringify(eac),
        },
      );

      return await this.json(response);
    },

    Create: async <T extends EverythingAsCode>(
      eac: T,
      username: string,
      processingSeconds: number,
    ): Promise<EaCCommitResponse> => {
      const response = await fetch(
        this.loadClientUrl(
          `?processingSeconds=${processingSeconds}&username=${username}`,
        ),
        {
          method: "POST",
          headers: this.loadHeaders(),
          body: JSON.stringify(eac),
        },
      );

      return await this.json(response);
    },

    Delete: async <TEaC extends EverythingAsCode = EverythingAsCode>(
      eac: NullableArrayOrObject<TEaC>,
      archive: boolean,
      processingSeconds: number,
    ): Promise<EaCCommitResponse> => {
      const response = await fetch(
        this.loadClientUrl(
          `${eac.EnterpriseLookup}?archive=${archive}&processingSeconds=${processingSeconds}`,
        ),
        {
          method: "DELETE",
          headers: this.loadHeaders(),
          body: JSON.stringify(eac),
        },
      );

      return await this.json(response);
    },

    Get: async <T extends EverythingAsCode>(entLookup: string): Promise<T> => {
      const response = await fetch(this.loadClientUrl(`${entLookup}`), {
        headers: this.loadHeaders(),
      });

      return await this.json(response);
    },

    JWT: async (
      entLookup: string | undefined,
      username: string,
      expTime?: number,
    ): Promise<{
      Token: string;
    }> => {
      const response = await fetch(
        this.loadClientUrl(
          `${entLookup}/jwt?username=${username}&expTime=${expTime || ""}`,
        ),
        {
          headers: this.loadHeaders(),
        },
      );

      return await this.json(response);
    },
  };

  public Status = {
    CurrentStatus: async (entLookup: string): Promise<EaCStatus> => {
      const response = await fetch(
        this.loadClientUrl(`${entLookup}/status/current`),
        {
          headers: this.loadHeaders(),
        },
      );

      return await this.json(response);
    },

    Get: async (entLookup: string, commitId: string): Promise<EaCStatus> => {
      const response = await fetch(
        this.loadClientUrl(`${entLookup}/status/${commitId}`),
        {
          headers: this.loadHeaders(),
        },
      );

      return await this.json(response);
    },

    ListStati: async (
      entLookup: string,
      take?: number,
      statusTypes?: EaCStatusProcessingTypes[],
    ): Promise<EaCStatus[]> => {
      const takeParam = take ? `take=${take}` : "";

      const statusTypeParams = statusTypes
        ?.map((st) => {
          return `statusType=${st}`;
        })
        .join("&") || "";

      const response = await fetch(
        this.loadClientUrl(
          `${entLookup}/status?${takeParam}&${statusTypeParams}`,
        ),
        {
          headers: this.loadHeaders(),
        },
      );

      return await this.json<EaCStatus[]>(response, []);
    },
  };
}
