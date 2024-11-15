import {
  EaCRuntimeConfig,
  EverythingAsCode,
  IoCContainer,
  LoggingProvider,
  URLMatch,
} from "./.deps.ts";

export type EaCRuntimeContext<
  TState = Record<string, unknown>,
  TData = Record<string, unknown>,
  TEaC extends EverythingAsCode = EverythingAsCode,
> = {
  Data: TData;

  Next: (req?: Request) => Response | Promise<Response>;

  Params: Record<string, string | undefined>;

  Render: (data?: TData) => Response | Promise<Response>;

  Runtime: {
    Config: EaCRuntimeConfig;

    EaC: TEaC;

    Info: Deno.ServeHandlerInfo;

    IoC: IoCContainer;

    Logs: LoggingProvider;

    Revision: number;

    URLMatch: URLMatch;
  };

  State: TState;
};
