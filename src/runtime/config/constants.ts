import { colors } from "./.deps.ts";

export const EAC_RUNTIME_DEV = (): boolean =>
  JSON.parse(Deno.env.get("EAC_RUNTIME_DEV") || "false");

export const fathymGreen: colors.Rgb = { r: 74, g: 145, b: 142 };

export const IS_BUILDING: boolean = Deno.args.includes("build");

export const IS_DENO_DEPLOY = (): boolean =>
  Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;

export const SUPPORTS_WORKERS = (): boolean =>
  JSON.parse(Deno.env.get("SUPPORTS_WORKERS") || "false");

/**
 * Fast revision mode for testing and development.
 *
 * When set, skips the slow directory hash computation in GenericEaCRuntime.
 *
 * Values:
 * - "timestamp": Uses timestamp-based revision (fast, still invalidates on restart)
 * - Any other string: Uses that string as the fixed revision (fastest, for tests)
 * - Not set: Uses full directory hash (slow but accurate, for production)
 *
 * @example
 * ```bash
 * # For tests - use fixed revision
 * FAST_REVISION=test deno test
 *
 * # For development - use timestamp
 * FAST_REVISION=timestamp deno task dev
 * ```
 */
export const FAST_REVISION = (): string | null =>
  Deno.env.get("FAST_REVISION") || null;
