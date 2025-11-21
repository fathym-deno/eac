import { EaCRuntimeContext } from "../_/EaCRuntimeContext.ts";

export type EaCRuntimeHandler<
  TState = Record<string, unknown>,
  TData = Record<string, unknown>,
> = (
  request: Request,
  ctx: EaCRuntimeContext<TState, TData>,
) => Response | Promise<Response>;
