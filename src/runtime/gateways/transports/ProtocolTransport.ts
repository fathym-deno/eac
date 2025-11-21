import { EaCRuntime } from "../../_/EaCRuntime.ts";
import { ExecutionHandler } from "../../execution/handlers/.exports.ts";

export abstract class ProtocolTransport {
  /** Determines if this transport can handle the connection */
  abstract CanHandleConnection(conn: Deno.Conn): boolean;

  /** Returns an ExecutionHandler that will manage messages on this connection */
  abstract HandleConnection(
    conn: Deno.Conn,
    runtime: EaCRuntime,
  ): Promise<ExecutionHandler | undefined>;
}
