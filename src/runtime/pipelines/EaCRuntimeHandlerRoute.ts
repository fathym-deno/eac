import { EaCRuntimeContext, EverythingAsCode } from "./.deps.ts";
import { EaCRuntimeHandlerPipeline } from "./EaCRuntimeHandlerPipeline.ts";
import { RouteResolverConfiguration } from "./RouteResolverConfiguration.ts";

export type EaCRuntimeHandlerRoute<
  TState = Record<string, unknown>,
  TData = Record<string, unknown>,
  TEaC extends EverythingAsCode = EverythingAsCode,
> = {
  Activator?: (
    req: Request,
    ctx: EaCRuntimeContext<TState, TData, TEaC>,
  ) => boolean;

  ContinueStati?: number[];

  Handler: EaCRuntimeHandlerPipeline;

  Name: string;

  ResolverConfig: RouteResolverConfiguration;
  // Route: string;
};
