import { EaCRuntimeHandlerSet } from "./EaCRuntimeHandlerSet.ts";
import { EaCRuntimeContext, EverythingAsCode } from "./.deps.ts";
import { EaCRuntimeHandlerRoute } from "./EaCRuntimeHandlerRoute.ts";

export type EaCRuntimeHandlerRouteGroup<
  TState = Record<string, unknown>,
  TData = Record<string, unknown>,
  TEaC extends EverythingAsCode = EverythingAsCode,
> = {
  Priority?: number;

  Reverse?: boolean;

  Routes: EaCRuntimeHandlerRoute<TState, TData, TEaC>[];
};
