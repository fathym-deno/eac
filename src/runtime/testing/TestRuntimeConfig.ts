import type { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import type { EaCRuntimePlugin } from "../plugins/EaCRuntimePlugin.ts";

/**
 * Configuration options for TestRuntime
 */
export interface TestRuntimeOptions<
  TEaC extends EverythingAsCode = EverythingAsCode,
> {
  /** EaC configuration for the runtime */
  eac?: TEaC;

  /** Plugins to register with the runtime */
  plugins?: EaCRuntimePlugin<TEaC>[];

  /** Specific port to use (defaults to random available port) */
  port?: number;

  /** Port range start for finding available port (default: 3000) */
  portRangeStart?: number;

  /** Port range end for finding available port (default: 9999) */
  portRangeEnd?: number;
}
