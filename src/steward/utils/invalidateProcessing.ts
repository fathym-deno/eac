import { EaCStatus, EaCStatusProcessingTypes, merge } from "./.deps.ts";
import { markEaCProcessed } from "./markEaCProcessed.ts";

/**
 * Invalidates processing for a specific EaC entry if it exceeds the maximum runtime.
 *
 * @param denoKv The key-value store.
 * @param entLookup The enterprise lookup key.
 * @param maxRunTimeSeconds The maximum allowable processing time in seconds.
 */
export async function invalidateProcessing(
  denoKv: Deno.Kv,
  entLookup: string,
  maxRunTimeSeconds = 60,
): Promise<void> {
  const status = await denoKv.get<EaCStatus>([
    "EaC",
    "Status",
    entLookup,
    "Eac",
  ]);

  if (status?.value) {
    const now = new Date(Date.now());
    const maxRunTime = new Date(
      status.value.StartTime.getSeconds() + maxRunTimeSeconds,
    );

    if (maxRunTime.getTime() < now.getTime()) {
      status.value.Processing = EaCStatusProcessingTypes.ERROR;
      status.value!.Messages = merge(status.value!.Messages, {
        Error: "Invalidated",
      });
      status.value.EndTime = new Date(Date.now());

      await markEaCProcessed(entLookup, denoKv.atomic())
        .set(["EaC", "Status", entLookup, "ID", status.value.ID], status)
        .commit();
    }
  } else {
    await markEaCProcessed(entLookup, denoKv.atomic()).commit();
  }
}
