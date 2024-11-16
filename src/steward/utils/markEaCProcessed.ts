/**
 * Marks an EaC entry as processed by deleting relevant keys.
 *
 * @param entLookup The enterprise lookup key.
 * @param atomicOp The atomic operation object.
 * @returns The updated atomic operation object.
 */
export function markEaCProcessed(
  entLookup: string,
  atomicOp: Deno.AtomicOperation,
): Deno.AtomicOperation {
  return atomicOp
    .delete(["EaC", "Processing", entLookup])
    .delete(["EaC", "Status", entLookup, "Eac"]);
}
