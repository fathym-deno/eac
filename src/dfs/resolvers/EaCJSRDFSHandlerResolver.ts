import {
  EaCJSRDistributedFileSystemDetails,
  isEaCJSRDistributedFileSystemDetails,
} from "../_/EaCJSRDistributedFileSystemDetails.ts";
import {
  type ESBuild,
  type IDFSFileHandler,
  JSRFetchDFSFileHandler,
} from "./.deps.ts";
import { DFSHandlerResolver } from "./DFSHandlerResolver.ts";

/**
 * Resolver for JSR-based Distributed File Systems (DFS).
 * Returns base JSRFetchDFSFileHandler from @fathym/dfs.
 */
export const EaCJSRDFSHandlerResolver: DFSHandlerResolver = {
  async Resolve(ioc, _dfsLookup, dfs): Promise<IDFSFileHandler | undefined> {
    if (!isEaCJSRDistributedFileSystemDetails(dfs)) {
      throw new Deno.errors.NotSupported(
        "The provided dfs is not supported for the EaCJSRDFSHandlerResolver.",
      );
    }

    const jsrDFS = dfs as EaCJSRDistributedFileSystemDetails;

    if (!jsrDFS.Package) {
      throw new Error("Package must be provided for JSR DFS resolution.");
    }

    // If no version specified, fetch latest
    let version = jsrDFS.Version;
    if (!version) {
      const pkgRoot = new URL(`${jsrDFS.Package}/`, "https://jsr.io/");
      const metaPath = new URL(`meta.json`, pkgRoot);
      const metaResp = await fetch(metaPath);
      const meta = (await metaResp.json()) as { latest: string };
      version = meta.latest;
    }

    // Get ESBuild from IoC container (optional - may not be registered)
    const esbuild = await ioc.Resolve<ESBuild>(
      ioc.Symbol("ESBuild"),
    ).catch(() => undefined);

    return new JSRFetchDFSFileHandler({
      Package: jsrDFS.Package,
      Version: version,
      DefaultFile: jsrDFS.DefaultFile,
      Extensions: jsrDFS.Extensions,
      UseCascading: jsrDFS.UseCascading,
      FileRoot: jsrDFS.FileRoot,
      ESBuild: esbuild,
    });
  },
};
