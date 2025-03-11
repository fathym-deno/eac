import {
  EaCCommitResponse,
  EaCStatus,
  EaCStatusProcessingTypes,
  EaCUserRecord,
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
        this.loadClientUrl(`enterprise?processingSeconds=${processingSeconds}`),
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
        this.loadClientUrl(`enterprise/connections`),
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
          `enterprise?archive=${archive}&processingSeconds=${processingSeconds}`,
        ),
        {
          method: "DELETE",
          headers: this.loadHeaders(),
          body: JSON.stringify(eac),
        },
      );

      return await this.json(response);
    },

    Get: async <T extends EverythingAsCode>(): Promise<T> => {
      const response = await fetch(this.loadClientUrl(`enterprise`), {
        headers: this.loadHeaders(),
      });

      return await this.json(response);
    },

    JWT: async (
      entLookup: string,
      username: string,
      expTime?: number,
    ): Promise<{
      Token: string;
    }> => {
      const response = await fetch(
        this.loadClientUrl(
          `jwt?entLookup=${entLookup}&username=${username}&expTime=${
            expTime || ""
          }`,
        ),
        {
          headers: this.loadHeaders(),
        },
      );

      return await this.json(response);
    },

    ListForUser: async (
      username: string,
      parentEntLookup?: string,
    ): Promise<EaCUserRecord[]> => {
      const parentEntLookupQuery = parentEntLookup
        ? `parentEntLookup=${parentEntLookup}`
        : "";

      const response = await fetch(
        this.loadClientUrl(`list?username=${username}&${parentEntLookupQuery}`),
        {
          headers: this.loadHeaders(),
        },
      );

      return await this.json<EaCUserRecord[]>(response, []);
    },
  };

  public Status = {
    CurrentStatus: async (): Promise<EaCStatus> => {
      const response = await fetch(
        this.loadClientUrl(`enterprise/status/current`),
        {
          headers: this.loadHeaders(),
        },
      );

      return await this.json(response);
    },

    Get: async (commitId: string): Promise<EaCStatus> => {
      const response = await fetch(
        this.loadClientUrl(`enterprise/status/${commitId}`),
        {
          headers: this.loadHeaders(),
        },
      );

      return await this.json(response);
    },

    ListStati: async (
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
          `enterprise/status?${takeParam}&${statusTypeParams}`,
        ),
        {
          headers: this.loadHeaders(),
        },
      );

      return await this.json<EaCStatus[]>(response, []);
    },
  };

  public Users = {
    Get: async (): Promise<EaCUserRecord> => {
      const response = await fetch(
        this.loadClientUrl(`enterprise/user/eac`),
        {
          headers: this.loadHeaders(),
        },
      );

      return await this.json(response);
    },

    Invite: async (userEaC: EaCUserRecord): Promise<EaCCommitResponse> => {
      const response = await fetch(this.loadClientUrl(`enterprise/users`), {
        method: "POST",
        headers: this.loadHeaders(),
        body: JSON.stringify(userEaC),
      });

      return await this.json(response);
    },

    List: async (): Promise<EaCUserRecord[]> => {
      const response = await fetch(this.loadClientUrl(`enterprise/users`), {
        headers: this.loadHeaders(),
      });

      return await this.json<EaCUserRecord[]>(response, []);
    },
  };
}
