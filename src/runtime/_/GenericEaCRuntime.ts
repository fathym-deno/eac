import {
  buildURLMatch,
  ESBuild,
  generateDirectoryHash,
  IoCContainer,
  LoggingProvider,
  merge,
  STATUS_CODE,
  TelemetryLogger,
} from "./.deps.ts";
import { EaCRuntime } from "./EaCRuntime.ts";
import { EaCRuntimeContext } from "./EaCRuntimeContext.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import {
  FAST_REVISION,
  IS_BUILDING,
  IS_DENO_DEPLOY,
} from "../config/constants.ts";
import { EaCRuntimeConfig } from "../config/EaCRuntimeConfig.ts";
import { EaCRuntimePluginConfig } from "../config/EaCRuntimePluginConfig.ts";
import { EaCLoggingProvider } from "../logging/EaCLoggingProvider.ts";
import { EaCRuntimeHandler } from "../pipelines/EaCRuntimeHandler.ts";
import { EaCRuntimeHandlerPipeline } from "../pipelines/EaCRuntimeHandlerPipeline.ts";
import { EaCRuntimeHandlerRoute } from "../pipelines/EaCRuntimeHandlerRoute.ts";
import { EaCRuntimeHandlerRouteGroup } from "../pipelines/EaCRuntimeHandlerRouteGroup.ts";
import { EaCRuntimeHandlers } from "../pipelines/EaCRuntimeHandlers.ts";
import { EaCRuntimeHandlerSet } from "../pipelines/EaCRuntimeHandlerSet.ts";
import { EaCRuntimePlugin } from "../plugins/EaCRuntimePlugin.ts";
import { EaCRuntimePluginDef } from "../plugins/EaCRuntimePluginDef.ts";
import { DenoServeProtocolGateway } from "../gateways/DenoServeProtocolGateway.ts";
import { ProtocolGateway } from "../gateways/ProtocolGateway.ts";

export class GenericEaCRuntime<TEaC extends EverythingAsCode = EverythingAsCode>
  implements EaCRuntime<TEaC> {
  protected get logger(): TelemetryLogger {
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
    const startTime = Date.now();
    this.logger.info(`[runtime] configuring`);

    await this.resetRuntime();
    await this.configurationSetup();
    await this.configurePlugins(this.config.Plugins);

    if (!this.EaC) {
      this.logger.error(`[runtime] no EaC configuration provided`);
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

    // Log startup summary
    const totalRoutes = routeMatrix.reduce(
      (sum, g) => sum + (g.Routes?.length ?? 0),
      0,
    );
    const durMs = Date.now() - startTime;
    this.logger.info(
      `[runtime] ready plugins=${this.pluginDefs.size} routeGroups=${routeMatrix.length} routes=${totalRoutes} revision=${
        this.Revision.slice(0, 8)
      } durMs=${durMs}`,
    );
  }

  public async Gateway(): Promise<ProtocolGateway> {
    return new DenoServeProtocolGateway(
      this.config as EaCRuntimeConfig,
      this as EaCRuntime,
    );
  }

  public async Handle(
    request: Request,
    info: Deno.ServeHandlerInfo,
  ): Promise<Response> {
    if (this.pipeline.Pipeline?.length <= 0) {
      const url = new URL(request.url);
      this.logger.error(
        `[runtime] no pipeline configured path=${url.pathname}`,
      );
      throw new Error(
        `There is no pipeline properly configured for '${request.url}'.`,
      );
    }

    const ctx = await this.buildContext(request, info);
    return await this.pipeline.Execute(request, ctx);
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
      this.logger.debug(
        `[runtime] route=${route.Name} pattern=${route.ResolverConfig.PathPattern} path=${ctx.Runtime.URLMatch.Path}`,
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
      const mode = IS_DENO_DEPLOY() ? "wasm" : "native";
      this.logger.debug(`[runtime] loading esbuild mode=${mode}`);

      if (IS_DENO_DEPLOY()) {
        esbuild = await import("npm:esbuild-wasm@0.24.2");
      } else {
        esbuild = await import("npm:esbuild@0.24.2");
      }

      try {
        const worker = IS_DENO_DEPLOY() ? false : undefined;
        await esbuild!.initialize({ worker });
      } catch (err) {
        this.logger.error(`[runtime] esbuild init failed`, { err });
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
      const pluginName = Array.isArray(pluginDef)
        ? pluginDef[0]
        : pluginDef.constructor.name;

      this.logger.debug(`[runtime] plugin setup name=${pluginName}`);

      const pluginKey = pluginDef as EaCRuntimePluginDef<TEaC>;

      if (Array.isArray(pluginDef)) {
        const [plugin, ...args] = pluginDef as [string, ...args: unknown[]];

        try {
          if (typeof plugin !== "string") {
            this.logger.error(`[runtime] invalid plugin path=${plugin}`);
            throw new Error(`Invalid plugin path: ${plugin}`);
          }

          const Module = await import(plugin);

          if (!Module?.default) {
            this.logger.error(
              `[runtime] plugin missing default export path=${plugin}`,
            );
            throw new Error(
              `Plugin module "${plugin}" does not have a default export.`,
            );
          }

          pluginDef = new Module.default(...args) as EaCRuntimePlugin<TEaC>;
        } catch (error) {
          this.logger.error(`[runtime] plugin load failed path=${plugin}`, {
            err: error,
          });
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
          `[runtime] plugin=${pluginDef.constructor.name} routeGroups=${result.length}`,
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
    // Support fast revision mode for testing and development
    const fastRevision = FAST_REVISION();
    if (fastRevision === "timestamp") {
      this.Revision = `ts-${Date.now()}`;
    } else if (fastRevision) {
      this.Revision = fastRevision;
    } else {
      this.Revision = await generateDirectoryHash(Deno.cwd());
    }

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
