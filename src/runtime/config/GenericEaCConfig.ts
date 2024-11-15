import {
  colors,
  DefaultLoggingProvider,
  EaCRuntime,
  getPackageLoggerSync,
} from "./.deps.ts";
import { fathymGreen } from "./constants.ts";
import { EaCRuntimeConfig } from "./EaCRuntimeConfig.ts";

export const GenericEaCConfig = (runtime: EaCRuntime) => ({
  LoggingProvider: new DefaultLoggingProvider(),
  Middleware: [],
  Plugins: [], //[new FathymCorePlugin()],
  Runtime: (cfg: EaCRuntimeConfig) => runtime,
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
