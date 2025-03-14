// import { EaCRuntimeServer } from "../config/EaCRuntimeServer.ts";
// import { EaCRuntimeConfig, EaCRuntime } from "./.deps.ts";
// import { EaCProtocolGateway } from "./EaCProtocolGateway.ts";
// import { ProtocolTransport } from "./transports/ProtocolTransport.ts";

// export class MultiTransportEaCProtocolGateway implements EaCProtocolGateway {
//   protected protocolTransports: ProtocolTransport[] = [];

//   constructor(
//     protected config: EaCRuntimeConfig,
//     protected runtime: EaCRuntime
//   ) {}

//   public RegisterProtocolTransport(transport: ProtocolTransport): void {
//     this.protocolTransports.push(transport);
//   }

//   public async Start(): Promise<void> {
//     if (!this.config.Servers?.length) {
//       console.error("No Server configurations found. Skipping start.");
//       return;
//     }

//     await Promise.all(
//       this.config.Servers.map(async (server) => {
//         if (!server.port || server.port <= 0) {
//           console.warn(`Skipping server with invalid port: ${server.Lookup || "Unnamed"}`);
//           return;
//         }

//         console.log(`Starting server on port ${server.port} (${server.Lookup || "default"})`);

//         if (server.TLS) {
//           await this.startTlsListener(server);
//         } else {
//           await this.startTcpListener(server);
//         }
//       })
//     );
//   }

//   private async startTcpListener(server: EaCRuntimeServer) {
//     console.log(`Starting TCP listener on port ${server.port} (${server.Lookup || "default"})`);

//     const options: Deno.ListenOptions = {
//       port: server.port,
//       hostname: server.hostname ?? "0.0.0.0",
//     };

//     const serverListener = Deno.listen(options);

//     for await (const conn of serverListener) {
//       this.handleConnection(conn);
//     }
//   }

//   private async startTlsListener(server: EaCRuntimeServer) {
//     console.log(`Starting TLS listener on port ${server.port} (${server.Lookup || "default"})`);

//     const options: Deno.ListenTlsOptions & Deno.TlsCertifiedKeyPem = {
//       port: server.port,
//       hostname: server.hostname ?? "0.0.0.0",
//       cert: server.TLS!.cert,
//       key: server.TLS!.key,
//       reusePort: server.reusePort ?? false,
//     };

//     const serverListener = Deno.listenTls(options);

//     for await (const conn of serverListener) {
//       this.handleConnection(conn);
//     }
//   }

//   protected async handleConnection(conn: Deno.Conn) {
//     const transport = this.protocolTransports.find((t) =>
//       t.CanHandleConnection(conn)
//     );

//     if (!transport) {
//       console.error("No matching protocol transport found.");

//       conn.close();

//       return;
//     }

//     const handler = await transport.HandleConnection(conn, this.runtime);

//     if (!handler) {
//       console.error("No ExecutionHandler returned from transport.");
//       conn.close();
//       return;
//     }

//     await handler.Execute(this.runtime);
//   }
// }
