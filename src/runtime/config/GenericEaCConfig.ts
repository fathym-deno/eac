import { colors, EaCLoggingProvider, EaCRuntime } from "./.deps.ts";
import { fathymGreen } from "./constants.ts";
import { EaCRuntimeConfig } from "./EaCRuntimeConfig.ts";

const loggingProvider = new EaCLoggingProvider();

export const GenericEaCConfig = (runtime: EaCRuntime) => ({
  LoggingProvider: loggingProvider,
  Middleware: [],
  Plugins: [], //[new FathymCorePlugin()],
  Runtime: (cfg: EaCRuntimeConfig) => runtime,
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
