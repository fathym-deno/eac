import { EaCRuntimeHandlerSet } from "./EaCRuntimeHandlerSet.ts";
import { EaCRuntimeContext, EverythingAsCode } from "./.deps.ts";

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

  Handler: EaCRuntimeHandlerSet<TState, TData>;

  Name: string;

  Route: string;
};
