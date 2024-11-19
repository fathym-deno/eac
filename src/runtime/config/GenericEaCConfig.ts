import {
  colors,
  EaCLoggingProvider,
  EaCRuntime,
  getPackageLoggerSync,
  LoggingProvider,
} from "./.deps.ts";
import { fathymGreen } from "./constants.ts";
import { EaCRuntimeConfig } from "./EaCRuntimeConfig.ts";

export const GenericEaCConfig = (
  runtime: (cgg: EaCRuntimeConfig) => EaCRuntime,
  loggingProvider: LoggingProvider,
) => ({
  LoggingProvider: loggingProvider,
  Runtime: (cfg: EaCRuntimeConfig) => runtime(cfg),
  EaC: { EnterpriseLookup: "default-eac" },
  Server: {
    onListen: (params) => {
      const logger = loggingProvider.Package;

      const address = colors.green(`http://localhost:${params.port}`);

      logger.info("");
      logger.info(colors.bgRgb24(" 🐙 EaC Runtime Ready ", fathymGreen));
      logger.info(colors.rgb24(`\t${address}`, fathymGreen));
      logger.info("");
    },
  },
} as EaCRuntimeConfig);
