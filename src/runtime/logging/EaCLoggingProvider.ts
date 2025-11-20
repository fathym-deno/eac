import { ConsoleHandler, LevelName, LogConfig, LoggerConfig, LoggingProvider } from "./.deps.ts";

export class EaCLoggingProvider extends LoggingProvider {
  constructor(loggingPackages?: string[], override?: boolean) {
    const defaults = [
      "@fathym/default",
      "@fathym/common/build",
      "@fathym/common/deno-kv",
      "@fathym/common/path",
      "@fathym/eac",
      "@fathym/msal",
    ];

    loggingPackages ??= [];

    if (!override) {
      loggingPackages = [...defaults, ...loggingPackages];
    }

    const setupConfig = {
      handlers: {
        console: new ConsoleHandler("DEBUG"),
      },
      loggers: {
        default: {
          level: (Deno.env.get("LOGGING_DEFAULT_LEVEL") as LevelName) ||
            "DEBUG",
          handlers: ["console"],
        },

        ...loggingPackages.reduce((acc, name) => {
          const logLevelName = Deno.env.get("LOGGING_PACKAGE_LEVEL") ||
            Deno.env.get("LOGGING_DEFAULT_LEVEL") ||
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
