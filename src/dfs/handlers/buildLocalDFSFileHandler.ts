import {
  existsSync,
  getFileCheckPathsToProcess,
  getFilesList,
  path,
  withDFSCache,
} from "./.deps.ts";
import { DFSFileHandler } from "./DFSFileHandler.ts";
import { DFSFileInfo } from "./DFSFileInfo.ts";

export const buildLocalDFSFileHandler = (
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
          const fileCheckPaths = getFileCheckPathsToProcess(
            filePath,
            defaultFileName,
            extensions,
            useCascading,
          );

          const fileChecks: Promise<Deno.FsFile | undefined>[] = [];

          const usedFileCheckPaths: string[] = [];

          fileCheckPaths.forEach((fcp) => {
            const resolvedPath = pathResolver ? pathResolver(fcp) : fcp;

            if (resolvedPath) {
              const fullFilePath = path.join(
                root.includes(":/") || root.includes(":\\") ? "" : Deno.cwd(),
                root || "",
                resolvedPath,
              );

              if (existsSync(fullFilePath)) {
                usedFileCheckPaths.push(resolvedPath);

                fileChecks.push(
                  new Promise<Deno.FsFile | undefined>((resolve) => {
                    Deno.open(fullFilePath, {
                      read: true,
                    })
                      .then(resolve)
                      .catch(() => resolve(undefined));
                  }),
                );
              }
            }
          });

          const fileResps = await Promise.all(fileChecks);

          const activeFileResp = fileResps.find((fileResp, i) => {
            if (fileResp?.readable) {
              finalFilePath = usedFileCheckPaths[i];
            }

            return fileResp?.readable;
          });

          if (activeFileResp) {
            const dfsFileInfo: DFSFileInfo = {
              Contents: activeFileResp.readable,
              Path: finalFilePath,
            };

            return dfsFileInfo;
          } else if (defaultFileName) {
            throw new Error(
              `Unable to locate a local file at path ${filePath}, and no default file was found for ${defaultFileName}.`,
            );
          } else {
            throw new Error(
              `Unable to locate a local file at path ${filePath}.`,
            );
          }
        },
        revision,
        cacheDb,
        cacheSeconds,
      );
    },

    async LoadAllPaths(_revision: string): Promise<string[]> {
      const dir = await getFilesList({
        Directory: root,
      });

      const paths: string[] = [];

      for await (const entry of dir) {
        paths.push(`./${entry.substring(root.length)}`);
      }

      return paths;
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
