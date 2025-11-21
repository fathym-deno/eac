import { IoCContainer } from "./.deps.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { EaCRuntimeHandlerRoute } from "../pipelines/EaCRuntimeHandlerRoute.ts";
import { EaCRuntimeHandlerRouteGroup } from "../pipelines/EaCRuntimeHandlerRouteGroup.ts";
import { ProtocolGateway } from "../gateways/ProtocolGateway.ts";

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

  Gateway(): Promise<ProtocolGateway>;

  // TODO: Should be its own thing with REquest and Exeuction context i thinkk (encompassing ServeHandlerInfo<Addr>)
  Handle: Deno.ServeHandler;
};
