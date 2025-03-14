// import { EaCRuntime } from '../.deps.ts';
// import { ProtocolTransport } from './ProtocolTransport.ts';
// import { ExecutionHandler } from '../../execution/handlers/ExecutionHandler.ts';

// export class HttpProtocolTransport extends ProtocolTransport {
//   CanHandleConnection(conn: Deno.Conn): boolean {
//     try {
//       // Attempt to serve the connection as HTTP
//       Deno.serveHttp(conn);

//       return true;
//     } catch {
//       return false;
//     }
//   }

//   async HandleConnection(
//     conn: Deno.Conn,
//     runtime: EaCRuntime
//   ): Promise<ExecutionHandler | undefined> {
//     try {
//       const reader = conn.readable.getReader();

//       while (true) {
//         const { value, done } = await reader.read();
//         if (done) break;
//         console.log(value); // `value` is a Uint8Array
//       }

//       reader.releaseLock();
//       // TODO: How do we use the Deno.Conn to handle messages for HTTP?  I"m thinking will startup the Deno.serve on a fresh port in the background and forward each conn request to it?

//       // TODO: Create the Execution Handler, in this case a Reqeust/Response Execution Handler

//       // TODO: Return the Execution Handler?
//       return undefined;
//     } catch (error) {
//       console.error('Failed to upgrade HTTP connection:', error);

//       conn.close();

//       return undefined;
//     }
//   }
// }
