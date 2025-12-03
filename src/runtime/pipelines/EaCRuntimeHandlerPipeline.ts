import { EaCRuntimeContext } from "../_/EaCRuntimeContext.ts";
import { getPackageLoggerSync, KnownMethod, TelemetryLogger } from "./.deps.ts";
import { EaCRuntimeHandler } from "./EaCRuntimeHandler.ts";
import { EaCRuntimeHandlerSet } from "./EaCRuntimeHandlerSet.ts";
import { EaCRuntimeHandlers } from "./EaCRuntimeHandlers.ts";

export class EaCRuntimeHandlerPipeline {
  protected logger: TelemetryLogger;

  public Pipeline: (EaCRuntimeHandler | EaCRuntimeHandlers)[];

  constructor() {
    this.Pipeline = [];
    this.logger = getPackageLoggerSync(import.meta);
  }

  public Append(...handlers: (EaCRuntimeHandlerSet | undefined)[]): void {
    if (handlers) {
      const filtered = handlers
        .filter((h) => h)
        .flatMap((h) => (Array.isArray(h) ? h! : [h!]));

      this.Pipeline.push(...filtered);
    }
  }

  public Execute(
    request: Request,
    ctx: EaCRuntimeContext,
    index = -1,
  ): Response | Promise<Response> {
    const url = new URL(request.url);
    const startTime = index === -1 ? Date.now() : undefined;

    // Log pipeline start only at first call (index === -1)
    if (index === -1) {
      this.logger.debug(
        `[pipeline] request method=${request.method} path=${url.pathname} handlers=${this.Pipeline.length}`,
      );
    }

    ctx.Next = async (req) => {
      req ??= request;

      ++index;

      if (this.Pipeline.length > index) {
        let handler: EaCRuntimeHandler | EaCRuntimeHandlers | undefined =
          this.Pipeline[index];

        if (handler && typeof handler !== "function") {
          handler = handler[req.method.toUpperCase() as KnownMethod];
        }

        const response = await handler?.(req, ctx);

        if (response) {
          // Log response with timing if we're the originating pipeline
          if (startTime !== undefined) {
            const durMs = Date.now() - startTime;
            this.logger.debug(
              `[pipeline] response status=${response.status} path=${url.pathname} durMs=${durMs}`,
            );
          }
          return response;
        } else {
          return this.Execute(req, ctx, index);
        }
      } else {
        this.logger.error(
          `[pipeline] no-response handlers=${this.Pipeline.length} path=${url.pathname} method=${req.method}`,
          { err: new Error("No response from pipeline") },
        );

        return Response.json(
          {
            Message: "A Response must be returned from the pipeline.",
            RequestURL: req.url,
          },
          {
            status: 500,
          },
        );
      }
    };

    return ctx.Next(request);
  }

  public Prepend(...handlers: (EaCRuntimeHandlerSet | undefined)[]): void {
    if (handlers) {
      const filtered = handlers
        .filter((h) => h)
        .flatMap((h) => (Array.isArray(h) ? h! : [h!]));

      this.Pipeline.unshift(...filtered);
    }
  }
}
