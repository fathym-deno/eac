import { colors, TelemetryLogger } from "./.deps.ts";
import { ProtocolGateway } from "./ProtocolGateway.ts";
import { fathymGreen } from "../config/constants.ts";
import { EaCRuntime } from "../_/EaCRuntime.ts";
import { EaCRuntimeConfig } from "../config/EaCRuntimeConfig.ts";

export class DenoServeProtocolGateway implements ProtocolGateway {
  protected get logger(): TelemetryLogger {
    return this.config.LoggingProvider.Package;
  }
  constructor(
    protected config: EaCRuntimeConfig,
    protected runtime: EaCRuntime,
  ) {}

  public async Start(): Promise<void> {
    if (!this.config.Servers?.length) {
      this.logger.error("No Server configuration found. Skipping start.");

      return;
    }

    await Promise.all(
      this.config.Servers.map(async (server) => {
        if (!server.port || server.port <= 0) {
          this.logger.warn(
            `Skipping server with invalid port: ${server.Lookup || "Unnamed"}`,
          );
          return;
        }

        this.logger.info(
          `Starting server on port ${server.port} (${
            server.Lookup || "default"
          })`,
        );

        const startServer:
          | Deno.ServeTcpOptions
          | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem) = {
            port: server.port,
            hostname: server.hostname ?? "0.0.0.0",
            ...(server.TLS ?? {}),

            onListen: (params) => {
              const logger = this.logger;

              const address = colors.green(`http://localhost:${params.port}`);

              logger.info("");
              logger.info(
                colors.bgRgb24(" 🐙 EaC Runtime Ready ", fathymGreen),
              );
              logger.info(colors.rgb24(`\t${address}`, fathymGreen));
              logger.info("");
            },
          };

        await Deno.serve(
          startServer,
          (req, info) => this.runtime.Handle(req, info),
        ).finished;
      }),
    );
  }
}
