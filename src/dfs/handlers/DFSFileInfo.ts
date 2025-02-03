// deno-lint-ignore-file no-explicit-any
export type DFSFileInfo<TModule = any> = {
  Contents: ReadableStream<Uint8Array>;

  Headers?: Record<string, string>;

  Module?: TModule;

  Path: string;
};
