import { DFSFileInfo } from "./.deps.ts";
import { DenoKVFileStream } from "./DenoKVFileStream.ts";

export async function denoKvReadReadableStreamCache(
  fileStream: DenoKVFileStream,
  cacheKey: Deno.KvKey,
): Promise<DFSFileInfo | undefined> {
  const file = await fileStream.Read(cacheKey);

  if (file) {
    return {
      ...file,
      Path: cacheKey.slice(0).pop() as string,
    };
  } else {
    return undefined;
  }
}
