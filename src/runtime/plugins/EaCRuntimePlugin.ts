import { EaCRuntimeConfig, EverythingAsCode, IoCContainer } from "./.deps.ts";
import { EaCRuntimePluginConfig } from "./EaCRuntimePluginConfig.ts";

export type EaCRuntimePlugin<TEaC extends EverythingAsCode = EverythingAsCode> =
  {
    AfterEaCResolved?: (eac: TEaC, ioc: IoCContainer) => Promise<void>;

    Build?: (
      eac: TEaC,
      ioc: IoCContainer,
      pluginCfg?: EaCRuntimePluginConfig<TEaC>,
    ) => Promise<void>;

    Setup: (
      config: EaCRuntimeConfig<TEaC>,
    ) => Promise<EaCRuntimePluginConfig<TEaC>>;
  };
