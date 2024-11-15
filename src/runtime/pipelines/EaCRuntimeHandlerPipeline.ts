import { EaCRuntimeContext, KnownMethod } from "./.deps.ts";
import { EaCRuntimeHandler } from "./EaCRuntimeHandler.ts";
import { EaCRuntimeHandlerSet } from "./EaCRuntimeHandlerSet.ts";
import { EaCRuntimeHandlers } from "./EaCRuntimeHandlers.ts";

export class EaCRuntimeHandlerPipeline {
  public Pipeline: (EaCRuntimeHandler | EaCRuntimeHandlers)[];

  constructor() {
    this.Pipeline = [];
  }

  public Append(...handlers: (EaCRuntimeHandlerSet | undefined)[]): void {
    if (handlers) {
      this.Pipeline.push(
        ...handlers
          .filter((h) => h)
          .flatMap((h) => {
            return Array.isArray(h) ? h! : [h!];
          }),
      );
    }
  }

  public Execute(
    request: Request,
    ctx: EaCRuntimeContext,
    index = -1,
  ): Response | Promise<Response> {
    ctx.Next = async (req) => {
      req ??= request;

      ++index;

      if (this.Pipeline.length > index) {
        let handler: EaCRuntimeHandler | EaCRuntimeHandlers | undefined =
          this.Pipeline[index];

        if (handler && typeof handler !== "function") {
          handler = handler[req.method.toUpperCase() as KnownMethod];

          // if (!handler) {
          //   throw new Deno.errors.NotFound(
          //     `There is not handler configured for the '${req.method}' method.`
          //   );
          // }
        }

        const response = await handler?.(req, ctx);

        if (response) {
          return response;
        } else {
          return this.Execute(req, ctx, index);
        }
      } else {
        throw new Error("A Response must be returned from the pipeline.");
      }
    };

    return ctx.Next(request);
  }

  public Prepend(...handlers: (EaCRuntimeHandlerSet | undefined)[]): void {
    if (handlers) {
      this.Pipeline.unshift(
        ...handlers
          .filter((h) => h)
          .flatMap((h) => {
            return Array.isArray(h) ? h! : [h!];
          }),
      );
    }
  }
}
