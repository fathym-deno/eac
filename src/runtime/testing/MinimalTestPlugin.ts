import {
  EaCRuntimeConfig,
  EaCRuntimeHandler,
  EaCRuntimeHandlerRouteGroup,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  EverythingAsCode,
  IoCContainer,
} from "./.deps.ts";
import { EaCRuntimeHandlerPipeline } from "../pipelines/EaCRuntimeHandlerPipeline.ts";

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

  /**
   * Add a custom route handler
   */
  addRoute(path: string, handler: TestRouteHandler): this {
    this.routes.set(path, handler);
    return this;
  }

  /**
   * Add a route that returns JSON
   */
  addJsonRoute(path: string, data: unknown): this {
    this.routes.set(path, () =>
      new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      }));
    return this;
  }

  /**
   * Add a route that returns HTML
   */
  addHtmlRoute(path: string, html: string): this {
    this.routes.set(path, () =>
      new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }));
    return this;
  }

  /**
   * Add a route that returns plain text
   */
  addTextRoute(path: string, text: string): this {
    this.routes.set(path, () =>
      new Response(text, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }));
    return this;
  }

  /**
   * Add a route that redirects to another path
   */
  addRedirectRoute(path: string, location: string, status = 302): this {
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
  async Setup(
    _config: EaCRuntimeConfig,
  ): Promise<EaCRuntimePluginConfig> {
    return {
      Name: "MinimalTestPlugin",
      EaC: {} as EverythingAsCode,
    };
  }

  /**
   * EaCRuntimePlugin.AfterEaCResolved - Return route groups for our test routes
   */
  async AfterEaCResolved(
    _eac: EverythingAsCode,
    _ioc: IoCContainer,
    _config: EaCRuntimeConfig,
  ): Promise<EaCRuntimeHandlerRouteGroup[]> {
    // Create a single route group with all our routes
    let priority = 1000; // Start high priority for specific routes
    const routes = Array.from(this.routes.entries()).map(([path, handler]) => {
      const pipeline = new EaCRuntimeHandlerPipeline();

      const wrappedHandler: EaCRuntimeHandler = async (req, ctx) => {
        try {
          return await handler(req);
        } catch (error) {
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
    notFoundPipeline.Append(() => new Response("Not Found", { status: 404 }));

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
