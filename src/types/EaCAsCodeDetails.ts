import { EaCDetails } from "./.deps.ts";

export type EaCAsCodeDetails<TAsCode> = TAsCode extends EaCDetails<infer D> ? D
  : never;
