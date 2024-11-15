import { EaCRuntime, EaCRuntimeConfig, IS_BUILDING } from "./.deps.ts";

export async function startServer(
  config: EaCRuntimeConfig,
  options?: Parameters<EaCRuntime["Configure"]>[0],
): Promise<void> {
  const runtime = config.Runtime(config);

  if (!IS_BUILDING) {
    await runtime.Configure(options);

    await Deno.serve(config.Server, (req, info) => runtime.Handle(req, info))
      .finished;
  }
}
