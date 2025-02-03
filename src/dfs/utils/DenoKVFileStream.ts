import { concatUint8Arrays } from "./.deps.ts";

export type DenoKVFileStreamData<T> = {
  Data: T;

  ExpiresAt: number | undefined;
};

export class DenoKVFileStream {
  constructor(protected denoKv: Deno.Kv) {}

  public async Exists(key: Deno.KvKey): Promise<boolean> {
    const mark = await this.denoKv.get<DenoKVFileStreamData<boolean>>([
      ...key,
      "Mark",
    ]);

    const { Data: marked, ExpiresAt: expiresAt } = mark.value || {};

    return (
      !!marked && (!expiresAt || Date.now() < new Date(expiresAt).getTime())
    );
  }

  public async Read(key: Deno.KvKey): Promise<
    | {
      Contents: ReadableStream<Uint8Array>;
      Headers: Record<string, string> | undefined;
    }
    | undefined
  > {
    const exists = await this.Exists(key);

    const denoKv = this.denoKv;

    const contents = exists
      ? new ReadableStream<Uint8Array>({
        async start(controller) {
          const cachedFileChunks = await denoKv.list<
            DenoKVFileStreamData<Uint8Array>
          >({
            prefix: [...key, "Chunks"],
          });

          for await (const cachedFileChunk of cachedFileChunks) {
            controller.enqueue(cachedFileChunk.value!.Data);
          }

          controller.close();
        },
        cancel() {
          // divined.cancel();
        },
      })
      : undefined;

    if (contents) {
      const cachedHeaders = await denoKv.get<
        DenoKVFileStreamData<Record<string, string>>
      >([...key, "Headers"]);

      return {
        Contents: contents,
        Headers: cachedHeaders.value?.Data || undefined,
      };
    } else {
      return undefined;
    }
  }

  public async Remove(key: Deno.KvKey): Promise<void> {
    const denoKv = this.denoKv;

    const cachedFileChunks = await denoKv.list<
      DenoKVFileStreamData<Uint8Array>
    >({
      prefix: key,
    });

    for await (const cachedFileChunk of cachedFileChunks) {
      await denoKv.delete(cachedFileChunk.key);
    }
  }

  public async Write(
    key: Deno.KvKey,
    stream: ReadableStream<Uint8Array>,
    ttlSeconds?: number,
    headers?: Headers,
    maxChunkSize = 8000,
  ): Promise<[void, Deno.KvCommitResult]> {
    const calls: Promise<unknown>[] = [];

    if (stream) {
      let content = new Uint8Array();

      const fileReader = stream.getReader();

      let chunkCount = -1;

      const denoKv = this.denoKv;

      const ttl = ttlSeconds ? 1000 * ttlSeconds : undefined;

      const expiresAt = ttl ? Date.now() + ttl : undefined;

      calls.push(
        fileReader
          .read()
          .then(function processFile({ done, value }): Promise<void> {
            async function storeChunk(chunk: Uint8Array): Promise<void> {
              ++chunkCount;

              await denoKv.set(
                [...key, "Chunks", chunkCount],
                { Data: chunk, ExpiresAt: expiresAt },
                {
                  expireIn: ttl,
                },
              );
            }

            if (done) {
              if (content.length > 0) {
                storeChunk(content).then();
              }

              return Promise.resolve();
            } else {
              content = concatUint8Arrays(content, value);

              let contentBlob = new Blob([content]);

              if (chunkCount < 0) {
                storeChunk(content.slice(0, 1)).then();

                content = content.slice(1);
              }

              while (contentBlob.size > maxChunkSize) {
                storeChunk(content.slice(0, maxChunkSize)).then();

                content = content.slice(maxChunkSize);

                contentBlob = new Blob([content]);
              }

              return fileReader.read().then(processFile);
            }
          }),
      );

      if (headers) {
        const headersToCache: Record<string, string> = {};

        headers?.forEach((val, key) => {
          headersToCache[key] = val;
        });

        calls.push(
          denoKv.set(
            [...key, "Headers"],
            { Data: headersToCache, ExpiresAt: expiresAt },
            {
              expireIn: ttl,
            },
          ),
        );
      }

      calls.push(
        denoKv.set(
          [...key, "Mark"],
          { Data: true, ExpiresAt: expiresAt },
          {
            expireIn: ttl,
          },
        ),
      );
    }

    return await Promise.all(
      calls as [Promise<void>, Promise<Deno.KvCommitResult>],
    );
  }
}
