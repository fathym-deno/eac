import {
  EaCJSRDistributedFileSystemDetails,
  isEaCJSRDistributedFileSystemDetails,
} from "../_/EaCJSRDistributedFileSystemDetails.ts";
import { IEaCDFSFileHandler } from "../handlers/IEaCDFSFileHandler.ts";
import { EaCDFSFileHandlerResolver } from "../handlers/EaCDFSFileHandlerResolver.ts";
import { EaCJSRFetchDFSFileHandler } from "../handlers/EaCJSRFetchDFSFileHandler.ts";

/**
 * Resolver for JSR-based Distributed File Systems (DFS).
 */
export const EaCJSRDFSHandlerResolver: EaCDFSFileHandlerResolver = {
  async Resolve(_ioc, dfsLookup, dfs): Promise<IEaCDFSFileHandler | undefined> {
    if (!isEaCJSRDistributedFileSystemDetails(dfs)) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCJSRDFSHandlerResolver.",
      );
    }

    const jsrDFS = dfs as EaCJSRDistributedFileSystemDetails;

    const pkgRoot = new URL(`${jsrDFS.Package}/`, "https://jsr.io/");
    let isCheckingForUpdates = false; // Prevents redundant checks
    let currentVersion = jsrDFS.Version || "";

    async function getLatestVersion(): Promise<string> {
      const metaPath = new URL(`meta.json`, pkgRoot);
      const metaResp = await fetch(metaPath);
      const meta = (await metaResp.json()) as { latest: string };
      return meta.latest;
    }

    async function loadHandler(version: string) {
      return new EaCJSRFetchDFSFileHandler(dfsLookup, jsrDFS);
    }

    // Initial Load
    if (!currentVersion) {
      currentVersion = await getLatestVersion();
    }
    let handler = await loadHandler(currentVersion);

    async function checkForUpdates() {
      if (isCheckingForUpdates) return; // Avoid duplicate checks

      isCheckingForUpdates = true;
      try {
        const latestVersion = await getLatestVersion();
        if (latestVersion !== currentVersion) {
          console.log(
            `Updating JSR DFS handler from ${currentVersion} to ${latestVersion}`,
          );
          currentVersion = latestVersion;
          handler = await loadHandler(currentVersion);
        }
      } catch (error) {
        console.error("Failed to check for JSR version updates:", error);
      } finally {
        isCheckingForUpdates = false;
      }
    }

    return handler;
    // return new Proxy(handler, {
    //   get(target, prop) {
    //     return async (...args: unknown[]) => {
    //       try {
    //         const result = Reflect.get(handler, prop).apply(handler, args);
    //         checkForUpdates();
    //         return result;
    //       } catch (ex) {
    //         console.log(JSON.stringify(prop));
    //         console.log(JSON.stringify(args));
    //         console.log(JSON.stringify(ex));
    //         debugger;
    //         return undefined;
    //       }
    //     };
    //   },
    // });
  },
};
