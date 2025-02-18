import {
  buildURLMatch,
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
  ESBuild,
  EverythingAsCode,
  generateDirectoryHash,
  IoCContainer,
  IS_BUILDING,
  IS_DENO_DEPLOY,
  Logger,
  LoggingProvider,
  merge,
  STATUS_CODE,
} from "./.deps.ts";
import { EaCRuntime } from "./EaCRuntime.ts";
import { EaCRuntimeContext } from "./EaCRuntimeContext.ts";

export class GenericEaCRuntime<TEaC extends EverythingAsCode = EverythingAsCode>
  implements EaCRuntime<TEaC> {
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
    configure?: (
      rt: EaCRuntime<TEaC>,
    ) => Promise<EaCRuntimeHandlerRouteGroup[] | undefined>;
  }): Promise<void> {
    await this.resetRuntime();

    await this.configurationSetup();

    await this.configurePlugins(this.config.Plugins);

    if (!this.EaC) {
      throw new Error(
        "An EaC must be provided in the config or via a connection to an EaC Service with the EAC_API_KEY environment variable.",
      );
    }

    const routeMatrix = await this.finalizePlugins();

    if (options?.configure) {
      routeMatrix.push(...((await options.configure(this)) ?? []));
    }

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
        `Running route ${route.Name} for ${route.ResolverConfig.PathPattern}...`,
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
    const esbuild = await this.IoC.Resolve<ESBuild>(
      this.IoC!.Symbol("ESBuild"),
    );

    esbuild!.stop();
  }

  protected async configurationSetup(): Promise<void> {
    let esbuild: ESBuild | undefined;

    try {
      esbuild = await this.IoC.Resolve<ESBuild>(this.IoC!.Symbol("ESBuild"));
    } catch {
      esbuild = undefined;
    }

    if (!esbuild) {
      if (IS_DENO_DEPLOY()) {
        esbuild = await import("npm:esbuild-wasm@0.24.2");

        this.logger.debug("Initialized esbuild with portable WASM.");
      } else {
        esbuild = await import("npm:esbuild@0.24.2");

        this.logger.debug("Initialized esbuild with standard build.");
      }

      try {
        const worker = IS_DENO_DEPLOY() ? false : undefined;

        await esbuild!.initialize({
          worker,
        });
      } catch (err) {
        this.logger.error("There was an issue initializing esbuild", err);

        // throw err;
      }

      this.IoC.Register<ESBuild>(() => esbuild!, {
        Type: this.IoC!.Symbol("ESBuild"),
      });
    }
  }

  protected configurePipeline(routeMatrix: EaCRuntimeHandlerRouteGroup[]) {
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

  protected async finalizePlugins(): Promise<EaCRuntimeHandlerRouteGroup[]> {
    const buildCalls = Array.from(this.pluginDefs.values()).map(
      async (pluginDef) => {
        const pluginCfg = this.pluginConfigs.get(pluginDef);

        await pluginDef.Build?.(this.EaC!, this.IoC, pluginCfg);
      },
    );

    await Promise.all(buildCalls);

    const resolveCalls = Array.from(this.pluginDefs.values()).map(
      async (pluginDef) => {
        const pluginCfg = this.pluginConfigs.get(pluginDef);

        return await pluginDef.AfterEaCResolved?.(
          this.EaC!,
          this.IoC,
          this.config,
        );
      },
    );

    const resolved = await Promise.all(resolveCalls);

    return resolved
      .flatMap((r) => r)
      .filter((r) => r)
      .map((r) => r!);
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

          const testUrl = new URL(
            actCtx.Runtime.URLMatch.FromBase(
              `.${actCtx.Runtime.URLMatch.Path}`,
            ),
          );

          const isMatch = new URLPattern({
            pathname: route.ResolverConfig.PathPattern,
          }).test(testUrl);

          return isMatch;
        })
      : [];
  }

  protected async resetRuntime(): Promise<void> {
    this.Revision = await generateDirectoryHash(Deno.cwd()); //import.meta.resolve("../../"));

    this.pluginConfigs = new Map();

    this.pluginDefs = new Map();

    this.EaC = this.config.EaC;

    this.IoC = this.config.IoC || new IoCContainer();

    if (this.config.LoggingProvider) {
      this.IoC!.Register(LoggingProvider, () => this.config.LoggingProvider);
    }

    this.Middleware = this.config.Middleware || [];
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
