import { getFileCheckPathsToProcess, withDFSCache } from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

export const buildFetchDFSFileHandler = (
  root: string,
  pathResolver?: (filePath: string) => string,
): DFSFileHandler => {
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
          let fileCheckPaths: string[];

          const isDirect = filePath.startsWith("http://") ||
            filePath.startsWith("https://") ||
            filePath.startsWith("file:///");

          if (isDirect) {
            fileCheckPaths = [filePath];
          } else {
            fileCheckPaths = getFileCheckPathsToProcess(
              filePath,
              defaultFileName,
              extensions,
              useCascading,
            );
          }

          const fileChecks: Promise<Response>[] = [];

          const usedFileCheckPaths: string[] = [];

          fileCheckPaths.forEach((fcp) => {
            const resolvedPath = pathResolver ? pathResolver(fcp) : fcp;

            if (resolvedPath && !resolvedPath.startsWith("@")) {
              try {
                const fullFilePath = isDirect
                  ? new URL(resolvedPath)
                  : new URL(`.${resolvedPath}`, root);

                usedFileCheckPaths.push(resolvedPath);

                fileChecks.push(fetch(fullFilePath));
              } catch (err) {
                if (!(err instanceof TypeError)) {
                  throw err;
                }
              }
            }
          });

          const fileResps = await Promise.all(fileChecks);

          const activeFileResp = fileResps.find((fileResp, i) => {
            if (fileResp.ok) {
              finalFilePath = usedFileCheckPaths[i];
            }

            return fileResp.ok;
          });

          if (activeFileResp) {
            const excludeHeaders = ["content-type"];

            const headers = excludeHeaders.reduce((headers, uh) => {
              if (!activeFileResp.headers.has(uh)) {
                headers[uh] = activeFileResp.headers.get(uh)!;
              }

              return headers;
            }, {} as Record<string, string>);

            const dfsFileInfo: DFSFileInfo = {
              Contents: activeFileResp.clone().body!,
              Headers: headers,
              Path: finalFilePath,
            };

            return dfsFileInfo;
          } else if (defaultFileName) {
            return undefined;
            // throw new Error(
            //   `Unable to locate a fetch file at path ${filePath}, and no default file was found for ${defaultFileName}.`
            // );
          } else {
            return undefined;
            // throw new Error(
            //   `Unable to locate a fetch file at path ${filePath}.`
            // );
          }
        },
        revision,
        cacheDb,
        cacheSeconds,
      );
    },

    LoadAllPaths(_revision: string): Promise<string[]> {
      throw new Deno.errors.NotSupported(
        "Retrieval of fetch paths is not supported",
      );
    },

    get Root(): string {
      return root;
    },

    RemoveFile(
      _filePath: string,
      _revision: string,
      _cacheDb?: Deno.Kv,
    ): Promise<void> {
      throw new Deno.errors.NotSupported("File removal not yet supported.");
    },

    WriteFile(
      _filePath: string,
      _revision: string,
      _stream: ReadableStream<Uint8Array>,
      _ttlSeconds?: number,
      _headers?: Headers,
      _maxChunkSize = 8000,
      _cacheDb?: Deno.Kv,
    ): Promise<void> {
      throw new Deno.errors.NotSupported("File writing not yet supported.");
    },
  };
};
