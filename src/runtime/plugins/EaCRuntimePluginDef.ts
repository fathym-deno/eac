import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { EaCRuntimePlugin } from "./EaCRuntimePlugin.ts";

export type EaCRuntimePluginDef<
  TEaC extends EverythingAsCode = EverythingAsCode,
> = EaCRuntimePlugin<TEaC> | [string, ...args: unknown[]];
