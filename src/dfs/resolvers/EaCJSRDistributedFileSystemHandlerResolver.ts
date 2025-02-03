import {
  buildFetchDFSFileHandler,
  DFSFileHandler,
  DFSFileHandlerResolver,
  getPackageLogger,
  isEaCJSRDistributedFileSystemDetails,
  path,
} from "./.deps.ts";

export const EaCJSRDistributedFileSystemHandlerResolver:
  DFSFileHandlerResolver = {
    async Resolve(_ioc, dfs): Promise<DFSFileHandler | undefined> {
      if (!isEaCJSRDistributedFileSystemDetails(dfs)) {
        throw new Deno.errors.NotSupported(
          "The provided dfs is not supported for the EaCJSRDistributedFileSystemHandlerResolver.",
        );
      }

      const loadHandler = async () => {
        const pkgRoot = new URL(`${dfs.Package}/`, "https://jsr.io/");

        if (!dfs.Version) {
          const metaPath = new URL(`meta.json`, pkgRoot);

          const metaResp = await fetch(metaPath);

          const meta = (await metaResp.json()) as {
            latest: string;
          };

          dfs.Version = meta.latest;
        }

        const fileRoot = new URL(`${dfs.Version}/`, pkgRoot);

        const handler = buildFetchDFSFileHandler(fileRoot.href);

        handler.LoadAllPaths = async (_revision: string) => {
          const logger = await getPackageLogger(import.meta);

          const metaPath = `${fileRoot.href.slice(0, -1)}_meta.json`;

          const metaResp = await fetch(metaPath);

          try {
            const meta = (await metaResp.clone().json()) as {
              manifest: { [filePath: string]: unknown };
            };

            const filePaths = Object.keys(meta.manifest).filter((fp) =>
              dfs.FileRoot ? fp.startsWith(dfs.FileRoot) : true
            );

            return filePaths;
          } catch (err) {
            logger.error(
              `There was an error loading paths for: ${metaPath}`,
              await metaResp.clone().text(),
            );

            throw err;
          }
        };

        return handler;
      };

      let handler = await loadHandler();

      setInterval(() => {
        const work = async () => {
          handler = await loadHandler();
        };

        work();
      }, 60 * 1000);

      return {
        get Root() {
          return handler.Root;
        },

        GetFileInfo(
          filePath: string,
          revision: string,
          defaultFileName?: string,
          extensions?: string[],
          useCascading?: boolean,
          cacheDb?: Deno.Kv,
          cacheSeconds?: number,
        ) {
          return handler.GetFileInfo(
            path.join(dfs.FileRoot || "", filePath),
            revision,
            defaultFileName,
            extensions,
            useCascading,
            cacheDb,
            cacheSeconds,
          );
        },

        async LoadAllPaths(revision: string) {
          const allPaths = await handler.LoadAllPaths(revision);

          return allPaths.map((path) =>
            dfs.FileRoot && path.startsWith(dfs.FileRoot)
              ? path.replace(dfs.FileRoot, "")
              : path
          );
        },

        RemoveFile(filePath: string, revision: string, cacheDb?: Deno.Kv) {
          return handler.RemoveFile(
            path.join(dfs.FileRoot || "", filePath),
            revision,
            cacheDb,
          );
        },

        WriteFile(
          filePath: string,
          revision: string,
          stream: ReadableStream<Uint8Array>,
          ttlSeconds?: number,
          headers?: Headers,
          maxChunkSize?: number,
          cacheDb?: Deno.Kv,
        ) {
          return handler.WriteFile(
            path.join(dfs.FileRoot || "", filePath),
            revision,
            stream,
            ttlSeconds,
            headers,
            maxChunkSize,
            cacheDb,
          );
        },
      };
    },
  };
