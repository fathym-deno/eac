import {
  colors,
  EaCLoggingProvider,
  EaCRuntime,
  getPackageLoggerSync,
} from "./.deps.ts";
import { fathymGreen } from "./constants.ts";
import { EaCRuntimeConfig } from "./EaCRuntimeConfig.ts";

export const GenericEaCConfig = (
  runtime: (cgg: EaCRuntimeConfig) => EaCRuntime,
) => ({
  LoggingProvider: new EaCLoggingProvider(),
  Middleware: [],
  Plugins: [], //[new FathymCorePlugin()],
  Runtime: (cfg: EaCRuntimeConfig) => runtime(cfg),
  EaC: { EnterpriseLookup: "default-eac" },
  Server: {
    onListen: (params) => {
      const logger = getPackageLoggerSync(import.meta);

      const address = colors.green(`http://localhost:${params.port}`);

      logger.info("");
      logger.info(colors.bgRgb24(" 🐙 EaC Runtime Ready ", fathymGreen));
      logger.info(colors.rgb24(`\t${address}`, fathymGreen));
      logger.info("");
    },
  },
} as EaCRuntimeConfig);
