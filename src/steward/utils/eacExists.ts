import { hasKvEntry } from "./.deps.ts";

/**
 * Checks if a given EaC entry exists in the key-value store.
 *
 * @param denoKv The key-value store.
 * @param entLookup The enterprise lookup key.
 * @returns `true` if the entry exists, `false` otherwise.
 */
export async function eacExists(
  denoKv: Deno.Kv,
  entLookup: string,
): Promise<boolean> {
  return (
    (await hasKvEntry(denoKv, ["EaC", "Current", entLookup])) ||
    (await hasKvEntry(denoKv, ["EaC", "Archive", entLookup])) ||
    (await hasKvEntry(denoKv, ["EaC", "Processing", entLookup]))
  );
}
