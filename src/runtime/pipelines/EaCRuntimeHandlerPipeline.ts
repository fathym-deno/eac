import {
  EaCRuntimeContext,
  getPackageLoggerSync,
  KnownMethod,
  Logger,
} from "./.deps.ts";
import { EaCRuntimeHandler } from "./EaCRuntimeHandler.ts";
import { EaCRuntimeHandlerSet } from "./EaCRuntimeHandlerSet.ts";
import { EaCRuntimeHandlers } from "./EaCRuntimeHandlers.ts";

export class EaCRuntimeHandlerPipeline {
  protected logger: Logger;

  public Pipeline: (EaCRuntimeHandler | EaCRuntimeHandlers)[];

  constructor() {
    this.Pipeline = [];

    this.logger = getPackageLoggerSync(import.meta);
    this.logger.debug(
      "Initialized EaCRuntimeHandlerPipeline with empty pipeline.",
    );
  }

  public Append(...handlers: (EaCRuntimeHandlerSet | undefined)[]): void {
    if (handlers) {
      const count = handlers.filter((h) => h).length;
      this.logger.info(`Appending ${count} handler sets to pipeline.`);

      this.Pipeline.push(
        ...handlers
          .filter((h) => h)
          .flatMap((h) => {
            return Array.isArray(h) ? h! : [h!];
          }),
      );

      this.logger.debug(
        `Pipeline now contains ${this.Pipeline.length} handlers after append.`,
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

      // this.logger.debug(
      //   `Pipeline execution at index ${index} for ${req.method} ${req.url}`,
      // );

      if (this.Pipeline.length > index) {
        let handler: EaCRuntimeHandler | EaCRuntimeHandlers | undefined =
          this.Pipeline[index];

        if (handler && typeof handler !== "function") {
          // this.logger.debug(
          //   `Resolving method handler for ${req.method} at index ${index}`,
          // );
          handler = handler[req.method.toUpperCase() as KnownMethod];
        }

        const response = await handler?.(req, ctx);

        if (response) {
          // this.logger.info(`Handler at index ${index} returned a response.`);
          return response;
        } else {
          // this.logger.debug(
          //   `Handler at index ${index} returned no response, continuing pipeline.`,
          // );
          return this.Execute(req, ctx, index);
        }
      } else {
        try {
          throw new Error(
            `A Response must be returned from the pipeline for the request ${req.url}`,
          );
        } catch (err) {
          this.logger.error(err);
        }

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

    // this.logger.debug(
    //   `Beginning pipeline execution for ${request.method} ${request.url}`,
    // );
    return ctx.Next(request);
  }

  public Prepend(...handlers: (EaCRuntimeHandlerSet | undefined)[]): void {
    if (handlers) {
      const count = handlers.filter((h) => h).length;
      this.logger.info(`Prepending ${count} handler sets to pipeline.`);

      this.Pipeline.unshift(
        ...handlers
          .filter((h) => h)
          .flatMap((h) => {
            return Array.isArray(h) ? h! : [h!];
          }),
      );

      this.logger.debug(
        `Pipeline now contains ${this.Pipeline.length} handlers after prepend.`,
      );
    }
  }
}
