import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { EaCRuntimeContext } from "../_/EaCRuntimeContext.ts";
import { EaCRuntimeHandlerRoute } from "./EaCRuntimeHandlerRoute.ts";

export type EaCRuntimeHandlerRouteGroup<
  TState = Record<string, unknown>,
  TData = Record<string, unknown>,
  TEaC extends EverythingAsCode = EverythingAsCode,
> = {
  Activator?: (
    req: Request,
    ctx: EaCRuntimeContext<TState, TData, TEaC>,
  ) => boolean;

  Name: string;

  Priority?: number;

  Reverse?: boolean;

  Routes: EaCRuntimeHandlerRoute<TState, TData, TEaC>[];
};
