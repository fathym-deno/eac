import {
  ConsoleHandler,
  LevelName,
  LogConfig,
  LoggerConfig,
  LoggingProvider,
} from "./.deps.ts";

export class DefaultLoggingProvider extends LoggingProvider {
  constructor() {
    const loggingPackages = [
      "@fathym/default",
      "@fathym/common/build",
      "@fathym/common/deno-kv",
      "@fathym/common/path",
      "@fathym/eac",
      "@fathym/eac-api",
      "@fathym/eac-api/client",
      "@fathym/eac-api/status",
      "@fathym/eac-runtime",
      "@fathym/atomic-icons",
      "@fathym/msal",
    ];

    const setupConfig = {
      handlers: {
        console: new ConsoleHandler("DEBUG"),
      },
      loggers: {
        default: {
          level: (Deno.env.get("LOGGING_DEFAULT_LEVEL") as LevelName) ??
            "DEBUG",
          handlers: ["console"],
        },

        ...loggingPackages.reduce((acc, name) => {
          const logLevelName = Deno.env.get("LOGGING_PACKAGE_LEVEL") ??
            Deno.env.get("LOGGING_DEFAULT_LEVEL") ??
            "DEBUG";

          acc[name] = {
            level: logLevelName as LevelName,
            handlers: ["console"],
          };
          return acc;
        }, {} as Record<string, LoggerConfig>),
      },
    } as LogConfig;

    super(import.meta, setupConfig);
  }
}
