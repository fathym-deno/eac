import { delay } from "./.deps.ts";

export async function waitOnProcessing<T>(
  denoKv: Deno.Kv,
  key: Deno.KvKey,
  msg: T,
  owner: string,
  handler: (denoKv: Deno.Kv, msg: T) => Promise<void>,
  sleepFor = 250,
) {
  const processing = await denoKv.get<string>(key);

  if (processing.value && processing.value !== owner) {
    await delay(sleepFor);

    await handler(denoKv, msg);
  }

  await denoKv.set(key, owner);
}
