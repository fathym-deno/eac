/**
 * The base type for Everything as Code (EaC) to create open EaC types.
 */
export type EaCMetadataBase =
  | Record<string | number | symbol, unknown>
  | undefined;
