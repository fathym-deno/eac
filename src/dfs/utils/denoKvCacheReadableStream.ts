import { DenoKVFileStream } from "./DenoKVFileStream.ts";

export function denoKvCacheReadableStream(
  fileStream: DenoKVFileStream,
  cacheKey: Deno.KvKey,
  stream: ReadableStream<Uint8Array>,
  cacheSeconds: number,
  headers?: Headers,
  maxChunkSize = 8000,
): void {
  fileStream
    .Write(cacheKey, stream, cacheSeconds, headers, maxChunkSize)
    .then();
}
