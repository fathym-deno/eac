import { IoCContainer } from "./.deps.ts";
import { EaCRuntimePluginConfig } from "../config/EaCRuntimePluginConfig.ts";
import { EaCRuntimeHandlerRouteGroup } from "../pipelines/.exports.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { EaCRuntimeConfig } from "../config/EaCRuntimeConfig.ts";

export type EaCRuntimePlugin<TEaC extends EverythingAsCode = EverythingAsCode> =
  {
    AfterEaCResolved?: (
      eac: TEaC,
      ioc: IoCContainer,
      config: EaCRuntimeConfig<TEaC>,
    ) => Promise<EaCRuntimeHandlerRouteGroup[]>;

    Build?: (
      eac: TEaC,
      ioc: IoCContainer,
      pluginCfg?: EaCRuntimePluginConfig<TEaC>,
    ) => Promise<void>;

    Setup: (
      config: EaCRuntimeConfig<TEaC>,
    ) => Promise<EaCRuntimePluginConfig<TEaC>>;
  };
