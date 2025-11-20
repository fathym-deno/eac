import { EaCRuntime, EaCRuntimeConfig } from "./.deps.ts";
import { resolvePort } from "./resolvePort.ts";
import { startServer } from "./startServer.ts";

export async function start(
  config: EaCRuntimeConfig,
  options?: Parameters<EaCRuntime["Configure"]>[0],
): Promise<void> {
  const logger = config?.LoggingProvider.Package;

  logger.info(`Starting server with Deno version: ${Deno.version.deno}`);

  if (!config.Servers || config.Servers.length === 0) {
    console.error("No servers configured. Skipping start.");
    return;
  }

  const resolvedPorts = await Promise.all(
    config.Servers.map((server) => resolvePort(server.Lookup ? `PORT_${server.Lookup}` : "PORT", server)),
  );

  // Assign resolved ports
  config.Servers.forEach((server, index) => {
    server.port = resolvedPorts[index];
  });

  await startServer(config, options);
}
