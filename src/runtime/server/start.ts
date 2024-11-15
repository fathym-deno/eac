import { EaCRuntime, EaCRuntimeConfig } from "./.deps.ts";
import { startServer } from "./startServer.ts";

export async function start(
  config: EaCRuntimeConfig,
  options?: Parameters<EaCRuntime["Configure"]>[0],
): Promise<void> {
  const logger = config?.LoggingProvider.Package;

  logger.info(`Starting server with Deno version: ${Deno.version.deno}`);

  const portEnv = Deno.env.get("PORT");

  if (portEnv) {
    config.Server.port = parseInt(portEnv);
  }

  if (config.Server.port) {
    await startServer(config, options);
  } else {
    const [startPort, endPort] = config.Server.StartRange || [8000, 8020];

    // No port specified, check for a free port. Instead of picking just
    // any port we'll check if the next one is free for UX reasons.
    // That way the user only needs to increment a number when running
    // multiple apps vs having to remember completely different ports.
    let firstError;
    for (let port = startPort; port < endPort; port++) {
      try {
        await (
          await Deno.serve({ port }, () => {
            throw new Error();
          })
        ).shutdown();

        config.Server.port = port;

        await startServer(config, options);

        firstError = undefined;

        break;
      } catch (err) {
        if (err instanceof Deno.errors.AddrInUse) {
          // Throw first EADDRINUSE error
          // if no port is free
          if (!firstError) {
            firstError = err;
          }

          continue;
        }

        throw err;
      }
    }

    if (firstError) {
      throw firstError;
    }
  }
}
