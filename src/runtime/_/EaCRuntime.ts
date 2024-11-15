import {
  EaCRuntimeHandlerSet,
  EverythingAsCode,
  IoCContainer,
} from "./.deps.ts";

export type EaCRuntime<TEaC extends EverythingAsCode = EverythingAsCode> = {
  IoC: IoCContainer;

  EaC?: TEaC;

  Middleware?: EaCRuntimeHandlerSet;

  Revision: string;

  Configure(options?: {
    configure?: (rt: EaCRuntime<TEaC>) => Promise<void>;
  }): Promise<void>;

  Handle: Deno.ServeHandler;
};
