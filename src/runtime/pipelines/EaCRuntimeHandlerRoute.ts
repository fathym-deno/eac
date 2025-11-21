import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { EaCRuntimeContext } from "../_/EaCRuntimeContext.ts";
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

  Priority?: number;

  ResolverConfig: RouteResolverConfiguration;
  // Route: string;
};
