import { EaCRuntimeHandlers } from "./EaCRuntimeHandlers.ts";
import { EaCRuntimeHandler } from "./EaCRuntimeHandler.ts";

export type EaCRuntimeHandlerSet<
  TState = Record<string, unknown>,
  TData = Record<string, unknown>,
> =
  | EaCRuntimeHandler<TState, TData>
  | EaCRuntimeHandlers<TState, TData>
  | (EaCRuntimeHandler<TState, TData> | EaCRuntimeHandlers<TState, TData>)[];
