import { KnownMethod } from "./.deps.ts";
import { EaCRuntimeHandler } from "./EaCRuntimeHandler.ts";

export type EaCRuntimeHandlers<
  TState = Record<string, unknown>,
  TData = Record<string, unknown>,
> = {
  [K in KnownMethod]?: EaCRuntimeHandler<TState, TData>;
};
