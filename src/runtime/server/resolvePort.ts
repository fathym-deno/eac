import { findAvailablePort } from "./findAvailablePort.ts";

/** Generalized function for resolving ports */
export async function resolvePort(
  envVar: string,
  serverConfig?: { port?: number; PortRange?: number },
): Promise<number> {
  // Check if port is set via environment variable
  const envPort = Deno.env.get(envVar);

  if (envPort) {
    if (!serverConfig) {
      serverConfig = {};
    }

    serverConfig.port = parseInt(envPort);
  }

  if (serverConfig?.port) {
    const startPort = serverConfig.port;

    const endPort = serverConfig.PortRange ? startPort + serverConfig.PortRange : startPort;

    return (await findAvailablePort(startPort, endPort)) ?? 0;
  }

  return 0;
}
