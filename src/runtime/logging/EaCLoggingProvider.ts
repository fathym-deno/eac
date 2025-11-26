import { LoggingProvider } from "./.deps.ts";
import type { TelemetryConfig, TelemetryLogger } from "./.deps.ts";

export class EaCLoggingProvider extends LoggingProvider {
  constructor(
    loggingPackages?: string[],
    override?: boolean,
    telemetry?: TelemetryConfig,
  ) {
    const defaults = [
      "@fathym/default",
      "@fathym/common/build",
      "@fathym/runtime/deno-kv",
      "@fathym/common/path",
      "@fathym/eac",
      "@fathym/msal",
    ];

    const packages = override
      ? loggingPackages ?? []
      : [...defaults, ...(loggingPackages ?? [])];

    super(import.meta, {
      ...telemetry,
      defaultAttributes: {
        ...(telemetry?.defaultAttributes ?? {}),
        loggingPackages: packages,
      },
    });
  }
}
