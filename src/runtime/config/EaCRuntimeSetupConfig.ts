import { IoCContainer } from "./.deps.ts";
import { EaCRuntimeHandler } from "../pipelines/EaCRuntimeHandler.ts";
import { EaCRuntimeHandlers } from "../pipelines/EaCRuntimeHandlers.ts";
import { EaCRuntimePluginDef } from "../plugins/EaCRuntimePluginDef.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";

export type EaCRuntimeSetupConfig<
  TEaC extends EverythingAsCode = EverythingAsCode,
> = {
  EaC?: TEaC;

  IoC?: IoCContainer;

  Middleware?: (EaCRuntimeHandler | EaCRuntimeHandlers)[];

  Plugins?: EaCRuntimePluginDef<TEaC>[];
};
