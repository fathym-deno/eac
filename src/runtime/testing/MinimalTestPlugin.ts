import {
  getPackageLoggerSync,
  IoCContainer,
  type TelemetryLogger,
} from "./.deps.ts";
import type { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import type { EaCRuntimeConfig } from "../config/EaCRuntimeConfig.ts";
import type { EaCRuntimePluginConfig } from "../config/EaCRuntimePluginConfig.ts";
import type { EaCRuntimeHandler } from "../pipelines/EaCRuntimeHandler.ts";
import { EaCRuntimeHandlerPipeline } from "../pipelines/EaCRuntimeHandlerPipeline.ts";
import type { EaCRuntimeHandlerRouteGroup } from "../pipelines/EaCRuntimeHandlerRouteGroup.ts";
import type { EaCRuntimePlugin } from "../plugins/EaCRuntimePlugin.ts";

/**
 * Route handler type for MinimalTestPlugin
 */
export type TestRouteHandler = (req: Request) => Response | Promise<Response>;

/**
 * MinimalTestPlugin provides a simple way to define routes for testing.
 *
 * Since the EaC runtime is essentially a shell without plugins providing
 * request handlers, this plugin allows you to define simple routes for
 * testing the testing infrastructure itself.
 *
 * @example
 * ```typescript
 * const plugin = createMinimalTestPlugin()
 *   .addHtmlRoute('/', '<h1>Hello World</h1>')
 *   .addJsonRoute('/api/health', { status: 'ok' })
 *   .addRoute('/api/echo', (req) => {
 *     return new Response(`${req.method} ${new URL(req.url).pathname}`);
 *   });
 *
 * const runtime = new TestRuntime({
 *   plugins: [plugin],
 * });
 * ```
 */
export class MinimalTestPlugin implements EaCRuntimePlugin {
  private routes: Map<string, TestRouteHandler> = new Map();
  private logger: TelemetryLogger;

  constructor() {
    this.logger = getPackageLoggerSync(import.meta);
  }

  /**
   * Add a custom route handler
   */
  public AddRoute(path: string, handler: TestRouteHandler): this {
    this.logger.debug(`[minimal-test-plugin] adding route path=${path}`);
    this.routes.set(path, handler);
    return this;
  }

  /**
   * Add a route that returns JSON
   */
  public AddJsonRoute(path: string, data: unknown): this {
    this.routes.set(path, () =>
      new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      }));
    return this;
  }

  /**
   * Add a route that returns HTML
   */
  public AddHtmlRoute(path: string, html: string): this {
    this.routes.set(path, () =>
      new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }));
    return this;
  }

  /**
   * Add a route that returns plain text
   */
  public AddTextRoute(path: string, text: string): this {
    this.routes.set(path, () =>
      new Response(text, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }));
    return this;
  }

  /**
   * Add a route that redirects to another path
   */
  public AddRedirectRoute(path: string, location: string, status = 302): this {
    this.routes.set(path, () =>
      new Response(null, {
        status,
        headers: { Location: location },
      }));
    return this;
  }

  /**
   * EaCRuntimePlugin.Setup - Provide minimal config with empty EaC
   */
  public async Setup(
    _config: EaCRuntimeConfig,
  ): Promise<EaCRuntimePluginConfig> {
    this.logger.debug(`[minimal-test-plugin] setup routes=${this.routes.size}`);
    return {
      Name: "MinimalTestPlugin",
      EaC: {} as EverythingAsCode,
    };
  }

  /**
   * EaCRuntimePlugin.AfterEaCResolved - Return route groups for our test routes
   */
  public async AfterEaCResolved(
    _eac: EverythingAsCode,
    _ioc: IoCContainer,
    _config: EaCRuntimeConfig,
  ): Promise<EaCRuntimeHandlerRouteGroup[]> {
    this.logger.debug(
      `[minimal-test-plugin] afterEaCResolved routes=${this.routes.size}`,
    );

    // Create a single route group with all our routes
    let priority = 1000; // Start high priority for specific routes
    const logger = this.logger;
    const routes = Array.from(this.routes.entries()).map(([path, handler]) => {
      const pipeline = new EaCRuntimeHandlerPipeline();

      const wrappedHandler: EaCRuntimeHandler = async (req, ctx) => {
        const url = new URL(req.url);
        logger.debug(
          `[minimal-test-plugin] handling path=${path} url=${url.pathname}`,
        );
        try {
          const response = await handler(req);
          logger.debug(
            `[minimal-test-plugin] response status=${response.status} path=${path}`,
          );
          return response;
        } catch (error) {
          logger.error(`[minimal-test-plugin] handler error path=${path}`, {
            err: error,
          });
          return new Response(`Error: ${error}`, { status: 500 });
        }
      };

      pipeline.Append(wrappedHandler);

      return {
        Name: `test-route:${path}`,
        Handler: pipeline,
        ResolverConfig: {
          PathPattern: path,
          Priority: priority--,
        },
      };
    });

    // Create catch-all 404 handler in a SEPARATE, lower-priority route group
    const notFoundPipeline = new EaCRuntimeHandlerPipeline();
    notFoundPipeline.Append((req) => {
      const url = new URL(req.url);
      logger.debug(`[minimal-test-plugin] 404 path=${url.pathname}`);
      return new Response("Not Found", { status: 404 });
    });

    const notFoundRoute = {
      Name: "test-route:404",
      Handler: notFoundPipeline,
      // Don't continue on 404 - this IS the 404 handler
      ContinueStati: [],
      ResolverConfig: {
        PathPattern: "/*",
        Priority: 0,
      },
    };

    this.logger.info(
      `[minimal-test-plugin] registered routeGroups=2 routes=${routes.length}`,
    );

    return [
      // Higher priority group for specific routes
      {
        Name: "MinimalTestPlugin",
        Priority: 100,
        Routes: routes,
      },
      // Lower priority group for 404 catch-all
      {
        Name: "MinimalTestPlugin:NotFound",
        Priority: 0,
        Routes: [notFoundRoute],
      },
    ];
  }
}

/**
 * Factory function to create a MinimalTestPlugin
 */
export function createMinimalTestPlugin(): MinimalTestPlugin {
  return new MinimalTestPlugin();
}
