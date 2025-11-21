import { colors } from "./.deps.ts";

export const EAC_RUNTIME_DEV = (): boolean =>
  JSON.parse(Deno.env.get("EAC_RUNTIME_DEV") || "false");

export const fathymGreen: colors.Rgb = { r: 74, g: 145, b: 142 };

export const IS_BUILDING: boolean = Deno.args.includes("build");

export const IS_DENO_DEPLOY = (): boolean =>
  Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;

export const SUPPORTS_WORKERS = (): boolean =>
  JSON.parse(Deno.env.get("SUPPORTS_WORKERS") || "false");
