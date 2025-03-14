// import { EaCRuntime } from '../.deps.ts';
// import { ProtocolTransport } from './ProtocolTransport.ts';
// import { ExecutionHandler } from '../../execution/handlers/ExecutionHandler.ts';

// export class MQTTProtocolTransport extends ProtocolTransport {
//   CanHandleConnection(conn: Deno.Conn): boolean {
//     // TODO:  How to determine if the connection is an MQTT connection?
//     return true;
//   }

//   async HandleConnection(
//     conn: Deno.Conn,
//     runtime: EaCRuntime
//   ): Promise<ExecutionHandler | null> {
//     try {

//     } catch (error) {
//       console.error("Failed to upgrade HTTP connection:", error);
//       conn.close();
//       return null;
//     }
//   }
// }
