import { DFSFileInfo } from "./.deps.ts";
import { denoKvCacheReadableStream } from "./denoKvCacheReadableStream.ts";
import { denoKvReadReadableStreamCache } from "./denoKvReadReadableStreamCache.ts";
import { DenoKVFileStream } from "./DenoKVFileStream.ts";

export async function withDFSCache(
  filePath: string,
  loadFile: () => Promise<DFSFileInfo | undefined>,
  revision: string,
  cacheDb?: Deno.Kv,
  cacheSeconds?: number,
): Promise<DFSFileInfo | undefined> {
  const dfsCacheKey = ["DFS", "Revision", revision, "Path", filePath];

  const fileStream = cacheDb ? new DenoKVFileStream(cacheDb) : undefined;

  if (fileStream) {
    const cached = await denoKvReadReadableStreamCache(fileStream, dfsCacheKey);

    if (cached) {
      return cached;
    }
  }

  const dfsFile = await loadFile();

  if (dfsFile && fileStream && cacheSeconds) {
    denoKvCacheReadableStream(
      fileStream,
      dfsCacheKey,
      dfsFile.Contents,
      cacheSeconds,
    );
  }

  return dfsFile;
}
