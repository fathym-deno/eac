import {
  DenoKVFileStream,
  DenoKVFileStreamData,
  getFileCheckPathsToProcess,
  withDFSCache,
} from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

function getFullFileKey(
  rootKey: Deno.KvKey,
  revision: string,
  filePath: string,
  segmentPath?: string,
) {
  const keyedUrl = new URL(
    [
      ...rootKey,
      "Revision",
      revision,
      "Path",
      ...(segmentPath?.split("/") || []).filter((fp) => fp),
      ...filePath.split("/").filter((fp) => fp),
    ].join("/"),
    new URL("https://notused.com/"),
  ).pathname.replace("//", "/");

  const fullFileKey = keyedUrl.split("/").filter((fp) => fp);

  return fullFileKey;
}

export const buildDenoKVDFSFileHandler = (
  denoKv: Deno.Kv,
  rootKey: Deno.KvKey,
  root: string,
  segmentPath?: string,
  pathResolver?: (filePath: string) => string,
): DFSFileHandler => {
  const fileStream = new DenoKVFileStream(denoKv);

  rootKey = [...rootKey, "Root", root];

  return {
    async GetFileInfo(
      filePath: string,
      revision: string,
      defaultFileName?: string,
      extensions?: string[],
      useCascading?: boolean,
      cacheDb?: Deno.Kv,
      cacheSeconds?: number,
    ): Promise<DFSFileInfo | undefined> {
      let finalFilePath = filePath;

      return await withDFSCache(
        finalFilePath,
        async () => {
          const fileCheckPaths = getFileCheckPathsToProcess(
            filePath,
            defaultFileName,
            extensions,
            useCascading,
          );

          const fileChecks: Promise<
            | {
              Contents: ReadableStream<Uint8Array>;
              Headers: Record<string, string> | undefined;
            }
            | undefined
          >[] = [];

          const usedFileCheckPaths: string[] = [];

          fileCheckPaths.forEach((fcp) => {
            const resolvedPath = pathResolver ? pathResolver(fcp) : fcp;

            if (resolvedPath) {
              const fullFileKey = getFullFileKey(
                rootKey,
                revision,
                resolvedPath,
                segmentPath,
              );

              usedFileCheckPaths.push(resolvedPath);

              fileChecks.push(fileStream.Read(fullFileKey));
            }
          });

          const fileResps = await Promise.all(fileChecks);

          const activeFileResp = fileResps.find((fileResp, i) => {
            if (fileResp?.Contents) {
              finalFilePath = usedFileCheckPaths[i];
            }

            return fileResp?.Contents;
          });

          if (activeFileResp) {
            const dfsFileInfo: DFSFileInfo = {
              ...activeFileResp,
              Path: finalFilePath,
            };

            return dfsFileInfo;
          } else if (defaultFileName) {
            throw new Error(
              `Unable to locate a DenoKV file at path ${filePath}, and no default file was found for ${defaultFileName}.`,
            );
          } else {
            throw new Error(
              `Unable to locate a DenoKV file at path ${filePath}.`,
            );
          }
        },
        revision,
        cacheDb,
        cacheSeconds,
      );
    },

    async LoadAllPaths(revision: string): Promise<string[]> {
      const filesRootKey = [...rootKey];

      const filesRevisionRootKey = [...filesRootKey, "Revision", revision!];

      const fileRevisionEntries = await denoKv.list<
        DenoKVFileStreamData<Uint8Array | Record<string, unknown>>
      >({
        prefix: filesRevisionRootKey,
        end: ["Chunks", 0],
      });

      const paths: string[] = [];

      for await (const fileRevisionEntry of fileRevisionEntries) {
        const filePath = fileRevisionEntry.key
          .slice(
            filesRevisionRootKey.length + 1,
            fileRevisionEntry.key.length - 2,
          )
          .join("/");

        paths.push(`/${filePath}`);
      }

      // Cleanup old revisions
      async function cleanup(): Promise<void> {
        const fileEntries = await denoKv.list<
          DenoKVFileStreamData<Uint8Array | Record<string, unknown>>
        >({
          prefix: filesRootKey,
        });

        const deleteCalls: Promise<void>[] = [];

        for await (const fileEntry of fileEntries) {
          const curKey = fileEntry.key.join("/");

          const revisionRoot = filesRevisionRootKey.join("/");

          if (!curKey.startsWith(revisionRoot)) {
            deleteCalls.push(denoKv.delete(fileEntry.key));
          }
        }

        await Promise.all(deleteCalls);
      }

      cleanup().then();

      return paths;
    },

    get Root(): string {
      return root;
    },

    async RemoveFile(filePath: string, revision: string): Promise<void> {
      const fullFileKey = getFullFileKey(
        rootKey,
        revision,
        filePath,
        segmentPath,
      );

      await fileStream.Remove(fullFileKey);
    },

    async WriteFile(
      filePath: string,
      revision: string,
      stream: ReadableStream<Uint8Array>,
      ttlSeconds?: number,
      headers?: Headers,
      maxChunkSize = 8000,
      _cacheDb?: Deno.Kv,
    ): Promise<void> {
      const fullFileKey = getFullFileKey(
        rootKey,
        revision,
        filePath,
        segmentPath,
      );

      await fileStream.Write(
        fullFileKey,
        stream,
        ttlSeconds,
        headers,
        maxChunkSize,
      );
    },
  };
};
