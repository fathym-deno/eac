import { loadJwtConfig } from "./.deps.ts";
import { EaCStewardClient } from "./EaCStewardClient.ts";

export async function loadEaCStewardSvc(): Promise<EaCStewardClient>;

export async function loadEaCStewardSvc(
  eacApiKey: string,
): Promise<EaCStewardClient>;

export async function loadEaCStewardSvc(
  entLookup: string,
  username: string,
): Promise<EaCStewardClient>;

export async function loadEaCStewardSvc(
  eacApiKeyEntLookup?: string,
  username?: string,
): Promise<EaCStewardClient> {
  if (!eacApiKeyEntLookup) {
    eacApiKeyEntLookup = Deno.env.get("EAC_API_KEY");

    if (!eacApiKeyEntLookup) {
      eacApiKeyEntLookup = Deno.env.get("EAC_API_ENTERPRISE_LOOKUP");

      if (eacApiKeyEntLookup) {
        username = Deno.env.get("EAC_API_USERNAME");
      }
    }
  }

  if (username) {
    eacApiKeyEntLookup = await loadJwtConfig().Create(
      {
        EnterpriseLookup: eacApiKeyEntLookup,
        Username: username!,
      },
      60 * 60 * 1,
    );
  }

  const eacBaseUrl = Deno.env.get("EAC_API_BASE_URL")!;

  return new EaCStewardClient(new URL(eacBaseUrl), eacApiKeyEntLookup ?? "");
}
