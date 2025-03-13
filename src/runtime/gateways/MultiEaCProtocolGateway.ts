import { EaCRuntime, EaCRuntimeConfig } from "./.deps.ts";
import { EaCProtocolGateway } from "./EaCProtocolGateway.ts";

export class DenoServeEaCProtocolGateway implements EaCProtocolGateway {
  constructor(
    protected config: EaCRuntimeConfig,
    protected runtime: EaCRuntime,
  ) {}

  public async Start(): Promise<void> {
    await Deno.serve(
      this.config.Server,
      (req, info) => this.runtime.Handle(req, info),
    ).finished;
  }
}
