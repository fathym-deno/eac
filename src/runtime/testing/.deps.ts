// Testing infrastructure dependencies - EXTERNAL ONLY
export { assertEquals } from "jsr:@std/assert@1";
export { IoCContainer } from "jsr:@fathym/ioc@0.0.25";
export {
  getPackageLogger,
  getPackageLoggerSync,
  LoggingProvider,
} from "jsr:@fathym/common@0.2.299/log";
export type { TelemetryLogger } from "jsr:@fathym/common@0.2.299/telemetry";
