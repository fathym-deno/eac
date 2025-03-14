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

  // TODO: Should be its own thing with REquest and Exeuction context i thinkk (encompassing ServeHandlerInfo<Addr>)
  Handle: Deno.ServeHandler;
};
