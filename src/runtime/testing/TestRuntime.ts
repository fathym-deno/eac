import {
  getPackageLoggerSync,
  IoCContainer,
  LoggingProvider,
  type TelemetryLogger,
} from "./.deps.ts";
import type { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import type { EaCRuntime } from "../_/EaCRuntime.ts";
import type { EaCRuntimeConfig } from "../config/EaCRuntimeConfig.ts";
import { EaCLoggingProvider } from "../logging/EaCLoggingProvider.ts";
import { GenericEaCRuntime } from "../_/GenericEaCRuntime.ts";
import { findAvailablePort } from "../server/findAvailablePort.ts";
import { TestRuntimeOptions } from "./TestRuntimeConfig.ts";
import { TestClient } from "./TestClient.ts";

/**
 * TestRuntime boots an EaC runtime on a random available port for testing.
 *
 * @example
 * ```typescript
 * const runtime = new TestRuntime({
 *   plugins: [myTestPlugin],
 * });
 *
 * await runtime.start();
 * const client = runtime.createClient();
 *
 * const response = await client.get('/');
 * assertEquals(response.status, 200);
 *
 * await runtime.stop();
 * ```
 */
export class TestRuntime<TEaC extends EverythingAsCode = EverythingAsCode> {
  private server?: Deno.HttpServer;
  private runtime?: GenericEaCRuntime<TEaC>;
  private _port?: number;
  private _baseUrl?: string;
  private originalFastRevision?: string;
  private logger: TelemetryLogger;
  private loggingProvider: LoggingProvider;

  constructor(private options: TestRuntimeOptions<TEaC> = {}) {
    this.loggingProvider = new EaCLoggingProvider();
    this.logger = getPackageLoggerSync(import.meta);
  }

  /**
   * Start the runtime and HTTP server
   */
  async start(): Promise<void> {
    this.logger.debug(`[test-runtime] starting`);

    // Enable fast revision mode for tests (skip slow directory hashing)
    this.originalFastRevision = Deno.env.get("FAST_REVISION");
    Deno.env.set("FAST_REVISION", "test");

    // Find available port
    const portStart = this.options.portRangeStart ?? 3000;
    const portEnd = this.options.portRangeEnd ?? 9999;
    this._port = this.options.port ??
      (await findAvailablePort(portStart, portEnd))!;

    if (!this._port) {
      this.logger.error(
        `[test-runtime] no available port found range=${portStart}-${portEnd}`,
      );
      throw new Error(
        `No available port found in range ${portStart}-${portEnd}`,
      );
    }

    this._baseUrl = `http://localhost:${this._port}`;
    this.logger.debug(`[test-runtime] using port=${this._port}`);

    // Build minimal runtime config with real LoggingProvider
    const config: EaCRuntimeConfig<TEaC> = {
      EaC: this.options.eac,
      LoggingProvider: this.loggingProvider,
      Plugins: this.options.plugins,
      // Provide Runtime factory function that plugins like FathymEaCApplicationsPlugin expect
      Runtime: (): EaCRuntime<TEaC> => {
        if (!this.runtime) {
          // Return a minimal object with Revision during setup phase
          return { Revision: "test" } as unknown as EaCRuntime<TEaC>;
        }
        return this.runtime;
      },
    } as unknown as EaCRuntimeConfig<TEaC>;

    this.logger.debug(
      `[test-runtime] creating runtime plugins=${
        this.options.plugins?.length ?? 0
      }`,
    );

    // Create and configure runtime (using GenericEaCRuntime with fast revision mode)
    this.runtime = new GenericEaCRuntime<TEaC>(config);

    // Configure with all plugins
    this.logger.debug(`[test-runtime] configuring runtime`);
    await this.runtime.Configure();

    // Start HTTP server
    this.logger.info(`[test-runtime] starting server port=${this._port}`);
    this.server = Deno.serve(
      { port: this._port, onListen: () => {} },
      (req, info) => this.runtime!.Handle(req, info),
    );

    this.logger.info(`[test-runtime] started baseUrl=${this._baseUrl}`);
  }

  /**
   * Stop the runtime and close the HTTP server
   */
  async stop(): Promise<void> {
    this.logger.debug(`[test-runtime] stopping`);

    if (this.server) {
      this.logger.debug(`[test-runtime] shutting down server`);
      await this.server.shutdown();
      // Give OS time to release the port (Windows needs longer)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    this.server = undefined;
    this.runtime = undefined;
    this._port = undefined;
    this._baseUrl = undefined;

    // Restore original FAST_REVISION env var
    if (this.originalFastRevision !== undefined) {
      Deno.env.set("FAST_REVISION", this.originalFastRevision);
    } else {
      Deno.env.delete("FAST_REVISION");
    }

    this.logger.info(`[test-runtime] stopped`);
  }

  /**
   * Get the port the server is running on
   */
  get port(): number {
    if (!this._port) {
      throw new Error("TestRuntime not started. Call start() first.");
    }
    return this._port;
  }

  /**
   * Get the base URL of the server
   */
  get baseUrl(): string {
    if (!this._baseUrl) {
      throw new Error("TestRuntime not started. Call start() first.");
    }
    return this._baseUrl;
  }

  /**
   * Create a TestClient bound to this runtime's base URL
   */
  createClient(): TestClient {
    return new TestClient(this.baseUrl);
  }

  /**
   * Get the underlying EaC configuration (after plugins have been applied)
   */
  getEaC(): TEaC | undefined {
    return this.runtime?.EaC;
  }

  /**
   * Get the IoC container
   */
  getIoC(): IoCContainer | undefined {
    return this.runtime?.IoC;
  }
}
