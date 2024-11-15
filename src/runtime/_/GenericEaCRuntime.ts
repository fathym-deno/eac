import {
  DefaultLoggingProvider,
  EaCRuntimeConfig,
  EaCRuntimeHandler,
  EaCRuntimeHandlerPipeline,
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
    return (this.config.LoggingProvider ?? new DefaultLoggingProvider())
      .Package;
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
    this.Revision = await generateDirectoryHash(import.meta.resolve("../../"));

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

    const handlers = await this.buildRuntimeHandlers();

    this.pipeline.Append(this.Middleware);

    this.pipeline.Append(handlers);

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

  protected abstract buildRuntimeHandlers(): Promise<EaCRuntimeHandlerSet>;

  protected abstract configurationFinalization(): Promise<void>;

  protected abstract configurationSetup(): Promise<void>;

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
        } catch (error) {
          console.error(`Failed to load plugin "${plugin}":`, error);

          throw error;
        }
      }
    }
  }

  protected async finalizePlugins(): Promise<void> {
    const buildCalls = Array.from(this.pluginDefs.values()).map(
      async (pluginDef) => {
        const pluginCfg = this.pluginConfigs.get(pluginDef);

        await pluginDef.Build?.(this.EaC!, this.IoC, pluginCfg);
      },
    );

    await Promise.all(buildCalls);

    for (const pluginDef of this.pluginDefs.values() || []) {
      await pluginDef.AfterEaCResolved?.(this.EaC!, this.IoC);
    }
  }
}
