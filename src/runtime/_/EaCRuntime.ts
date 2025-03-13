import {
  EaCProtocolGateway,
  EaCRuntimeHandlerRoute,
  EaCRuntimeHandlerRouteGroup,
  EverythingAsCode,
  IoCContainer,
} from "./.deps.ts";

export type EaCRuntime<TEaC extends EverythingAsCode = EverythingAsCode> = {
  IoC: IoCContainer;

  EaC?: TEaC;

  Middlewares?: EaCRuntimeHandlerRoute[];

  Revision: string;

  Configure(options?: {
    configure?: (
      rt: EaCRuntime<TEaC>,
    ) => Promise<EaCRuntimeHandlerRouteGroup[] | undefined>;
  }): Promise<void>;

  Gateway(): Promise<EaCProtocolGateway>;

  Handle: Deno.ServeHandler;
};
