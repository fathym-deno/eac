import { buildURLMatch, DenoServeEaCProtocolGateway, EaCLoggingProvider, EaCProtocolGateway, EaCRuntimeConfig, EaCRuntimeHandler, EaCRuntimeHandlerPipeline, EaCRuntimeHandlerRoute, EaCRuntimeHandlerRouteGroup, EaCRuntimeHandlers, EaCRuntimeHandlerSet, EaCRuntimePlugin, EaCRuntimePluginConfig, EaCRuntimePluginDef, ESBuild, EverythingAsCode, generateDirectoryHash, IoCContainer, IS_BUILDING, IS_DENO_DEPLOY, Logger, LoggingProvider, merge, STATUS_CODE } from "./.deps.ts";
import { EaCRuntime } from "./EaCRuntime.ts";
import { EaCRuntimeContext } from "./EaCRuntimeContext.ts";

export class GenericEaCRuntime<TEaC extends EverythingAsCode = EverythingAsCode> implements EaCRuntime<TEaC> {
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

  public OnEaCChanged?: (newEaC: TEaC) => void;

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
    configure?: (
      rt: EaCRuntime<TEaC>,
    ) => Promise<EaCRuntimeHandlerRouteGroup[] | undefined>;
  }): Promise<void> {
    this.logger.info("Starting runtime configuration...");
    await this.resetRuntime();

    this.logger.debug("Running configuration setup...");
    await this.configurationSetup();

    this.logger.debug("Configuring plugins...");
    await this.configurePlugins(this.config.Plugins);

    if (!this.EaC) {
      this.logger.error("Missing EaC configuration.");
      throw new Error(
        "An EaC must be provided in the config or via a connection to an EaC Service with the EAC_API_KEY environment variable.",
      );
    }

    this.logger.debug("Finalizing plugins...");
    const routeMatrix = await this.finalizePlugins();

    if (options?.configure) {
      this.logger.debug("Applying user-supplied additional configuration...");
      routeMatrix.push(...((await options.configure(this)) ?? []));
    }

    this.logger.debug("Setting up pipeline...");
    this.configurePipeline(routeMatrix);

    this.logger.info("Runtime configuration complete.");
    await this.configurationFinalization();
  }

  public async Gateway(): Promise<EaCProtocolGateway> {
    return new DenoServeEaCProtocolGateway(
      this.config as EaCRuntimeConfig,
      this as EaCRuntime,
    );
  }

  public async Handle(
    request: Request,
    info: Deno.ServeHandlerInfo,
  ): Promise<Response> {
    this.logger.debug(`Handling request: ${request.method} ${request.url}`);

    if (this.pipeline.Pipeline?.length <= 0) {
      this.logger.error(`Pipeline is not configured for: ${request.url}`);
      throw new Error(
        `There is on pipeline properly configured for '${request.url}'.`,
      );
    }

    const ctx = await this.buildContext(request, info);

    const resp = this.pipeline.Execute(request, ctx);

    return await resp;
  }

  protected async buildContext(
    req: Request,
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
      // URLMatch: buildURLMatch(pattern, req),
      State: {},
    } as unknown as EaCRuntimeContext;
  }

  protected buildRouteGroupHandlers(
    routeGroup: EaCRuntimeHandlerRouteGroup,
  ): EaCRuntimeHandler[] {
    let configuredRoutes: EaCRuntimeHandler[] = [];

    // TODO: Order by path priority logic
    const orderedRoutes = routeGroup.Routes;

    configuredRoutes.push((req, ctx) => {
      const filteredRoutes = this.filterRoutes(
        req,
        ctx,
        routeGroup,
        orderedRoutes,
      );

      this.logger.debug(
        `Filtered ${filteredRoutes.length} matching route(s) in group '${routeGroup.Name}'`,
      );

      if (filteredRoutes.length) {
        const rPipe = new EaCRuntimeHandlerPipeline();

        for (const route of filteredRoutes) {
          rPipe.Append(this.buildRouteGroupRouteHandler(routeGroup, route));

          rPipe.Append((req, ctx) => {
            return route.Handler.Execute(req, ctx);
          });
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

  protected buildRouteGroupRouteHandler(
    _routeGroup: EaCRuntimeHandlerRouteGroup,
    route: EaCRuntimeHandlerRoute,
  ): EaCRuntimeHandlerSet {
    return async (req, ctx) => {
      this.logger.info(
        `Running route ${route.Name} for ${route.ResolverConfig.PathPattern} for req ${ctx.Runtime.URLMatch.Path}...`,
      );

      this.setURLMatch(req, ctx, route.ResolverConfig.PathPattern);

      let resp: ReturnType<typeof ctx.Next> = await ctx.Next();

      if (this.shouldContinueToNextRoute(route, resp)) {
        resp = ctx.Next();
      }

      return resp;
    };
  }

  protected async configurationFinalization(): Promise<void> {
    this.logger.debug("Finalizing configuration and stopping ESBuild...");

    const esbuild = await this.IoC.Resolve<ESBuild>(
      this.IoC!.Symbol("ESBuild"),
    );

    esbuild!.stop();
  }

  protected async configurationSetup(): Promise<void> {
    let esbuild: ESBuild | undefined;

    this.logger.debug("Checking IoC for ESBuild registration...");

    try {
      esbuild = await this.IoC.Resolve<ESBuild>(this.IoC!.Symbol("ESBuild"));
      this.logger.debug("ESBuild already registered in IoC.");
    } catch {
      this.logger.debug("No existing ESBuild found in IoC.");
      esbuild = undefined;
    }

    if (!esbuild) {
      if (IS_DENO_DEPLOY()) {
        this.logger.debug("Running in Deno Deploy - loading esbuild-wasm...");
        esbuild = await import("npm:esbuild-wasm@0.24.2");

        this.logger.debug("Initialized esbuild with portable WASM.");
      } else {
        this.logger.debug(
          "Running in standard Deno - loading native esbuild...",
        );
        esbuild = await import("npm:esbuild@0.24.2");

        this.logger.debug("Initialized esbuild with standard build.");
      }

      try {
        const worker = IS_DENO_DEPLOY() ? false : undefined;
        this.logger.debug("Initializing esbuild...");
        await esbuild!.initialize({ worker });
        this.logger.info("Esbuild initialized successfully.");
      } catch (err) {
        this.logger.error("There was an issue initializing esbuild");
        this.logger.error(err);
      }

      this.logger.debug("Registering esbuild in IoC...");
      this.IoC.Register<ESBuild>(() => esbuild!, {
        Type: this.IoC!.Symbol("ESBuild"),
      });
    }
  }

  protected configurePipeline(routeMatrix: EaCRuntimeHandlerRouteGroup[]) {
    this.logger.debug("Appending middleware and route handlers to pipeline...");

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
      this.logger.debug(
        `Configuring plugin: ${Array.isArray(pluginDef) ? pluginDef[0] : pluginDef.constructor.name}`,
      );

      const pluginKey = pluginDef as EaCRuntimePluginDef<TEaC>;

      if (Array.isArray(pluginDef)) {
        const [plugin, ...args] = pluginDef as [string, ...args: unknown[]];

        try {
          if (typeof plugin !== "string") {
            this.logger.error(`Invalid plugin path: ${plugin}`);
            throw new Error(`Invalid plugin path: ${plugin}`);
          }

          this.logger.debug(`Dynamically importing plugin module: ${plugin}`);
          const Module = await import(plugin);

          if (!Module?.default) {
            this.logger.error(
              `Plugin module "${plugin}" does not have a default export.`,
            );
            throw new Error(
              `Plugin module "${plugin}" does not have a default export.`,
            );
          }

          pluginDef = new Module.default(...args) as EaCRuntimePlugin<TEaC>;
          this.logger.debug(`Successfully constructed plugin from: ${plugin}`);
        } catch (error) {
          this.logger.error(`Failed to load plugin "${plugin}":`, error);
          throw error;
        }
      }

      this.pluginDefs.set(pluginKey, pluginDef);

      const pluginConfig = this.pluginConfigs.has(pluginKey) ? this.pluginConfigs.get(pluginKey) : await pluginDef.Setup(this.config);

      this.pluginConfigs.set(pluginKey, pluginConfig);

      if (pluginConfig) {
        this.logger.debug(
          `Applying plugin config: ${pluginDef.constructor.name}`,
        );

        if (pluginConfig.EaC) {
          this.logger.debug("Merging plugin EaC...");
          this.EaC = merge(this.EaC || {}, pluginConfig.EaC);
        }

        if (pluginConfig.IoC) {
          this.logger.debug("Copying plugin IoC bindings...");
          pluginConfig.IoC.CopyTo(this.IoC!);
        }

        if (pluginConfig.Middleware) {
          this.logger.debug("Appending plugin middleware...");
          this.Middleware = [
            ...(this.Middleware || []),
            ...pluginConfig.Middleware,
          ];
        }

        await this.configurePlugins(pluginConfig.Plugins);
      }
    }
  }

  protected async finalizePlugins(): Promise<EaCRuntimeHandlerRouteGroup[]> {
    this.logger.debug("Building plugin handler pipelines...");

    const buildCalls = Array.from(this.pluginDefs.values()).map(
      async (pluginDef) => {
        const pluginCfg = this.pluginConfigs.get(pluginDef);
        this.logger.debug(`Building plugin: ${pluginDef.constructor.name}`);
        await pluginDef.Build?.(this.EaC!, this.IoC, pluginCfg);
      },
    );

    await Promise.all(buildCalls);

    const resolved: EaCRuntimeHandlerRouteGroup[] = [];

    for (const pluginDef of this.pluginDefs.values()) {
      const _pluginCfg = this.pluginConfigs.get(pluginDef);

      const result = await pluginDef.AfterEaCResolved?.(
        this.EaC!,
        this.IoC,
        this.config,
      );

      if (result) {
        this.logger.debug(
          `Plugin '${pluginDef.constructor.name}' returned ${result.length} route group(s).`,
        );
        resolved.push(...result);
      }
    }

    return resolved;
  }

  protected filterRoutes(
    req: Request,
    ctx: EaCRuntimeContext,
    routeGroup: EaCRuntimeHandlerRouteGroup,
    routes: EaCRuntimeHandlerRoute[],
  ): EaCRuntimeHandlerRoute[] {
    this.setURLMatch(req, ctx, "*");

    return !routeGroup.Activator || routeGroup.Activator(req, ctx)
      ? routes
        .filter((route) => {
          const actCtx = { ...ctx };

          this.setURLMatch(req, actCtx, "*");

          return !route.Activator || route.Activator(req, actCtx);
        })
        .filter((route) => {
          const actCtx = { ...ctx };

          this.setURLMatch(req, actCtx, "*");

          const testUrl = new URL(actCtx.Runtime.URLMatch.URL);

          const isMatch = new URLPattern({
            pathname: route.ResolverConfig.PathPattern,
          }).test(testUrl);

          return isMatch;
        })
      : [];
  }

  protected async resetRuntime(): Promise<void> {
    this.logger.debug("Resetting runtime state...");

    this.Revision = await generateDirectoryHash(Deno.cwd());
    this.logger.info(`Generated runtime revision: ${this.Revision}`);

    this.pluginConfigs = new Map();
    this.pluginDefs = new Map();

    this.EaC = this.config.EaC;
    this.IoC = this.config.IoC || new IoCContainer();

    if (this.config.LoggingProvider) {
      this.logger.debug("Registering custom LoggingProvider in IoC...");
      this.IoC!.Register(LoggingProvider, () => this.config.LoggingProvider);
    }

    this.Middleware = this.config.Middleware || [];

    this.logger.debug("Runtime state reset complete.");
  }

  protected setURLMatch(
    req: Request,
    ctx: EaCRuntimeContext,
    pathPattern: string,
  ): void {
    const pattern = new URLPattern({
      pathname: pathPattern,
    });

    ctx.Runtime = merge(
      ctx.Runtime,
      {
        URLMatch: buildURLMatch(pattern, req),
      } as EaCRuntimeContext["Runtime"],
    );
  }

  protected shouldContinueToNextRoute(
    route: EaCRuntimeHandlerRoute,
    resp: Response,
  ): boolean {
    const contStati = route?.ContinueStati ?? [STATUS_CODE.NotFound];

    return !resp.ok && contStati.includes(resp.status);
  }
}
