import {
  EaCRuntimeHandler,
  EaCRuntimeHandlers,
  EaCRuntimePluginDef,
  EverythingAsCode,
  IoCContainer,
} from "./.deps.ts";

export type EaCRuntimeSetupConfig<
  TEaC extends EverythingAsCode = EverythingAsCode,
> = {
  EaC?: TEaC;

  IoC?: IoCContainer;

  Middleware?: (EaCRuntimeHandler | EaCRuntimeHandlers)[];

  Plugins?: EaCRuntimePluginDef<TEaC>[];
};
