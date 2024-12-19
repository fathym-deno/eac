import { STATUS_CODE } from "jsr:@std/http@1.0.9/status";
import {
  EaCLoggingProvider,
  EaCRuntimeConfig,
  EaCRuntimeHandler,
  EaCRuntimeHandlerPipeline,
  EaCRuntimeHandlerRoute,
  EaCRuntimeHandlerRouteGroup,
  EaCRuntimeHandlers,
  EaCRuntimeHandlerSet,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  EaCRuntimePluginDef,
  EverythingAsCode,
  generateDirectoryHash,
  IoCContainer,
  IS_BUILDING,
  Logger,
  LoggingProvider,
  merge,
} from "./.deps.ts";
import { EaCRuntime } from "./EaCRuntime.ts";
import { EaCRuntimeContext } from "./EaCRuntimeContext.ts";

export abstract class GenericEaCRuntime<
  TEaC extends EverythingAsCode = EverythingAsCode,
> implements EaCRuntime<TEaC> {
  protected get logger(): Logger {
    return (this.config.LoggingProvider ?? new EaCLoggingProvider()).Package;
  }

  protected pipeline: EaCRuntimeHandlerPipeline;

  protected pluginConfigs: Map<
    EaCRuntimePlugin<TEaC> | [string, ...args: unknown[]],
    EaCRuntimePluginConfig<TEaC> | undefined
  >;

  protected pluginDefs: Map<
    EaCRuntimePlugin<TEaC> | [string, ...args: unknown[]],
    EaCRuntimePlugin<TEaC>
  >;

  public IoC: IoCContainer;

  public EaC?: TEaC;

  public Middleware?: (EaCRuntimeHandler | EaCRuntimeHandlers)[];

  public Revision: string;

  constructor(protected config: EaCRuntimeConfig<TEaC>) {
    this.pipeline = new EaCRuntimeHandlerPipeline();

    this.pluginConfigs = new Map();

    this.pluginDefs = new Map();

    this.IoC = new IoCContainer();

    this.Revision = "";

    if (IS_BUILDING) {
      Deno.env.set("SUPPORTS_WORKERS", "false");
    }
  }

  public async Configure(options?: {
    configure?: (rt: EaCRuntime<TEaC>) => Promise<void>;
  }): Promise<void> {
    this.Revision = await generateDirectoryHash(Deno.cwd()); //import.meta.resolve("../../"));

    this.pluginConfigs = new Map();

    this.pluginDefs = new Map();

    this.EaC = this.config.EaC;

    this.IoC = this.config.IoC || new IoCContainer();

    if (this.config.LoggingProvider) {
      this.IoC!.Register(LoggingProvider, () => this.config.LoggingProvider);
    }

    this.Middleware = this.config.Middleware || [];

    await this.configurationSetup();

    await this.configurePlugins(this.config.Plugins);

    if (!this.EaC) {
      throw new Error(
        "An EaC must be provided in the config or via a connection to an EaC Service with the EAC_API_KEY environment variable.",
      );
    }

    await this.finalizePlugins();

    if (options?.configure) {
      options.configure(this);
    }

    const routeMatrix = await this.configureRuntimeRouteMatrix();

    this.configurePipeline(routeMatrix);

    await this.configurationFinalization();
  }

  public async Handle(
    request: Request,
    info: Deno.ServeHandlerInfo,
  ): Promise<Response> {
    if (this.pipeline.Pipeline?.length <= 0) {
      throw new Error(
        `There is on pipeline properly configured for '${request.url}'.`,
      );
    }

    const ctx = await this.buildContext(info);

    const resp = this.pipeline.Execute(request, ctx);

    return await resp;
  }

  protected async buildContext(
    info: Deno.ServeHandlerInfo,
  ): Promise<EaCRuntimeContext> {
    return {
      Data: {},
      Runtime: {
        Config: this.config,
        EaC: this.EaC,
        Info: info,
        IoC: this.IoC,
        Logs: await this.IoC.Resolve<LoggingProvider>(LoggingProvider),
        Revision: this.Revision,
      },
      State: {},
    } as unknown as EaCRuntimeContext;
  }

  protected abstract configurationFinalization(): Promise<void>;

  protected abstract configurationSetup(): Promise<void>;

  protected configurePipeline(
    routeMatrix: Awaited<ReturnType<typeof this.configureRuntimeRouteMatrix>>,
  ) {
    this.pipeline.Append(this.Middleware);

    const orderedRouteGroups = Object.entries(routeMatrix)
      .sort(([_A, pA], [_B, pB]) => (pB.Priority || 0) - (pA.Priority || 0))
      .map(([_, routeGroup]) => {
        return this.buildRouteGroupHandlers(routeGroup);
      });

    orderedRouteGroups.forEach((handlers) => this.pipeline.Append(handlers));
  }

  protected async configurePlugins(
    plugins?: EaCRuntimePluginDef<TEaC>[],
  ): Promise<void> {
    for (let pluginDef of plugins || []) {
      const pluginKey = pluginDef as EaCRuntimePluginDef<TEaC>;

      if (Array.isArray(pluginDef)) {
        const [plugin, ...args] = pluginDef as [string, ...args: unknown[]];

        try {
          // Ensure `plugin` is a string
          if (typeof plugin !== "string") {
            throw new Error(`Invalid plugin path: ${plugin}`);
          }

          // Perform the dynamic import
          const Module = await import(plugin);

          // Check if the module has a default export
          if (!Module?.default) {
            throw new Error(
              `Plugin module "${plugin}" does not have a default export.`,
            );
          }

          pluginDef = new Module.default(...args) as EaCRuntimePlugin<TEaC>;
        } catch (error) {
          console.error(`Failed to load plugin "${plugin}":`, error);

          throw error;
        }
      }

      this.pluginDefs.set(pluginKey, pluginDef);

      const pluginConfig = this.pluginConfigs.has(pluginKey)
        ? this.pluginConfigs.get(pluginKey)
        : await pluginDef.Setup(this.config);

      this.pluginConfigs.set(pluginKey, pluginConfig);

      if (pluginConfig) {
        if (pluginConfig.EaC) {
          this.EaC = merge(this.EaC || {}, pluginConfig.EaC);
        }

        if (pluginConfig.IoC) {
          pluginConfig.IoC.CopyTo(this.IoC!);
        }

        if (pluginConfig.Middleware) {
          this.Middleware = [
            ...(this.Middleware || []),
            ...pluginConfig.Middleware,
          ];
        }

        await this.configurePlugins(pluginConfig.Plugins);
      }
    }
  }

  protected abstract configureRuntimeRouteMatrix(): Promise<
    EaCRuntimeHandlerRouteGroup[]
  >;

  protected async finalizePlugins(): Promise<void> {
    const buildCalls = Array.from(this.pluginDefs.values()).map(
      async (pluginDef) => {
        const pluginCfg = this.pluginConfigs.get(pluginDef);

        await pluginDef.Build?.(this.EaC!, this.IoC, pluginCfg);
      },
    );

    await Promise.all(buildCalls);

    for (const pluginDef of this.pluginDefs.values() || []) {
      await pluginDef.AfterEaCResolved?.(this.EaC!, this.IoC, this.config);
    }
  }

  protected buildRouteGroupHandlers(
    routeGroup: EaCRuntimeHandlerRouteGroup,
  ): EaCRuntimeHandler[] {
    let configuredRoutes: EaCRuntimeHandler[] = [];

    // TODO: Order by path priority logic
    const orderedRoutes = routeGroup.Routes;

    configuredRoutes.push((req, ctx) => {
      const filteredRoutes = this.filterRoutes(req, ctx, orderedRoutes);

      if (filteredRoutes.length) {
        const rPipe = new EaCRuntimeHandlerPipeline();

        for (const route of filteredRoutes) {
          rPipe.Append(this.buildRouteGroupRouteHandler(routeGroup, route));

          rPipe.Append(route.Handler);
        }

        return rPipe.Execute(req, ctx);
      }

      return ctx.Next();
    });

    if (routeGroup.Reverse) {
      configuredRoutes = configuredRoutes.reverse();
    }

    return configuredRoutes;
  }

  protected shouldContinueToNextRoute(
    route: EaCRuntimeHandlerRoute,
    resp: Response,
  ): boolean {
    const contStati = route?.ContinueStati ?? [STATUS_CODE.NotFound];

    return !resp.ok && contStati.includes(resp.status);
  }

  protected buildRouteGroupRouteHandler(
    _routeGroup: EaCRuntimeHandlerRouteGroup,
    route: EaCRuntimeHandlerRoute,
  ): EaCRuntimeHandlerSet {
    return async (_req, ctx) => {
      this.logger.info(`Running route ${route.Name} for ${route.Route}...`);

      let resp: ReturnType<typeof ctx.Next> = await ctx.Next();

      if (this.shouldContinueToNextRoute(route, resp)) {
        resp = ctx.Next();
      }

      return resp;
    };
  }

  protected filterRoutes(
    req: Request,
    ctx: EaCRuntimeContext,
    routes: EaCRuntimeHandlerRoute[],
  ): EaCRuntimeHandlerRoute[] {
    const apiTestUrl = new URL(
      `.${ctx.Runtime.URLMatch.Path}`,
      new URL("https://notused.com"),
    );

    return routes
      .filter((route) => {
        const isMatch = new URLPattern({ pathname: route.Route }).test(
          apiTestUrl,
        );

        return isMatch;
      })
      .filter((route) => {
        return route.Activator && !route.Activator(req, ctx);
      });
  }
}
