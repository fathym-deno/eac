import { waitOnProcessing } from "../status/waitOnProcessing.ts";
import { invalidateProcessing } from "./invalidateProcessing.ts";

/**
 * Waits for EaC processing to complete with a specific handler.
 *
 * @param denoKv The key-value store.
 * @param entLookup The enterprise lookup key.
 * @param commitId The commit ID.
 * @param msg The message to process.
 * @param handler The handler to execute.
 * @param maxRunTimeSeconds The maximum allowable processing time in seconds.
 * @param sleepFor The delay between checks in milliseconds.
 */
export async function waitOnEaCProcessing<T>(
  denoKv: Deno.Kv,
  entLookup: string,
  commitId: string,
  msg: T,
  handler: (denoKv: Deno.Kv, msg: T) => Promise<void>,
  maxRunTimeSeconds: number,
  sleepFor = 250,
): Promise<void> {
  await invalidateProcessing(denoKv, entLookup, maxRunTimeSeconds);

  const key = ["EaC", "Processing", entLookup];

  await waitOnProcessing(denoKv, key, msg, commitId, handler, sleepFor);
}
