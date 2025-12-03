import {
  EaCRuntimeConfig,
  EverythingAsCode,
  findAvailablePort,
  GenericEaCRuntime,
  IoCContainer,
} from "./.deps.ts";
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

  constructor(private options: TestRuntimeOptions<TEaC> = {}) {}

  /**
   * Start the runtime and HTTP server
   */
  async start(): Promise<void> {
    // Enable fast revision mode for tests (skip slow directory hashing)
    this.originalFastRevision = Deno.env.get("FAST_REVISION");
    Deno.env.set("FAST_REVISION", "test");

    // Find available port
    const portStart = this.options.portRangeStart ?? 3000;
    const portEnd = this.options.portRangeEnd ?? 9999;
    this._port = this.options.port ??
      (await findAvailablePort(portStart, portEnd))!;

    if (!this._port) {
      throw new Error(
        `No available port found in range ${portStart}-${portEnd}`,
      );
    }

    this._baseUrl = `http://localhost:${this._port}`;

    // Build minimal runtime config
    const config: EaCRuntimeConfig<TEaC> = {
      EaC: this.options.eac,
      LoggingProvider: {
        Package: console as unknown as {
          info: typeof console.info;
          debug: typeof console.debug;
          error: typeof console.error;
          warn: typeof console.warn;
        },
      },
      Plugins: this.options.plugins,
    } as EaCRuntimeConfig<TEaC>;

    // Create and configure runtime (using GenericEaCRuntime with fast revision mode)
    this.runtime = new GenericEaCRuntime<TEaC>(config);

    // Configure with all plugins
    await this.runtime.Configure();

    // Start HTTP server
    this.server = Deno.serve(
      { port: this._port, onListen: () => {} },
      (req, info) => this.runtime!.Handle(req, info),
    );
  }

  /**
   * Stop the runtime and close the HTTP server
   */
  async stop(): Promise<void> {
    if (this.server) {
      await this.server.shutdown();
      // Give OS time to release the port
      await new Promise((resolve) => setTimeout(resolve, 50));
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
