import { denoGraph, loadDenoConfig, path } from "./.deps.ts";
import { FetchDFSFileHandler } from "./FetchDFSFileHandler.ts";

/**
 * Implements `DFSFileHandler` for ESM-based file systems.
 */
export class ESMFetchDFSFileHandler extends FetchDFSFileHandler {
  /**
   * Creates an instance of `ESMFetchDFSFileHandler`.
   * @param root - The root URL for the module.
   * @param entryPoints - The entry points to analyze.
   * @param includeDependencies - Whether to include dependencies in file resolution.
   */
  public constructor(
    root: string,
    protected readonly entryPoints: string[],
    protected readonly includeDependencies?: boolean,
  ) {
    super(root);
  }

  /**
   * Resolves all module paths by analyzing the module graph.
   * @returns A list of module file paths.
   */
  public override async LoadAllPaths(_revision: string): Promise<string[]> {
    let resolvedRoot = this.Root;

    // Load and resolve import maps
    const { Config: denoCfg } = await loadDenoConfig();
    const importKeys = Object.keys(denoCfg.imports || {});

    if (
      importKeys.some(
        (imp) => imp.endsWith("/") && resolvedRoot.startsWith(imp),
      )
    ) {
      const importRoot = importKeys.find(
        (imp) => imp.endsWith("/") && resolvedRoot.startsWith(imp),
      )!;
      resolvedRoot = denoCfg.imports![importRoot] +
        resolvedRoot.replace(importRoot, "");
    }

    // Ensure proper resolution of local paths
    if (resolvedRoot.startsWith("./") || resolvedRoot.startsWith("../")) {
      resolvedRoot = `file:///${path.resolve(Deno.cwd(), resolvedRoot)}\\`;
    }

    // Resolve entry points relative to the root
    const roots = this.entryPoints.map((ep) => new URL(ep, resolvedRoot).href);

    // Generate dependency graph
    const graph = await denoGraph.createGraph(roots, {});
    const modules = graph.modules.map((m) => m.specifier);

    return modules
      .filter(
        (specifier) =>
          this.includeDependencies || specifier.startsWith(resolvedRoot),
      )
      .map((specifier) => {
        if (!this.includeDependencies) {
          let filePath = specifier.replace(resolvedRoot, "");

          if (filePath.startsWith("/")) {
            filePath = filePath.substring(1);
          }

          return `./${filePath}`;
        }
        return specifier;
      });
  }
}
