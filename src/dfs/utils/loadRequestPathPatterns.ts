import {
  DFSFileHandler,
  EaCDistributedFileSystemDetails,
  EaCRuntimeHandlerPipeline,
  EaCRuntimeHandlerSet,
  IS_BUILDING,
} from "./.deps.ts";
import { PathMatch } from "./PathMatch.ts";
import { convertFilePathToMatch } from "./convertFilePathToMatch.ts";

export async function loadRequestPathPatterns<TSetup>(
  fileHandler: DFSFileHandler,
  dfs: EaCDistributedFileSystemDetails,
  setup: (allPaths: string[]) => Promise<TSetup>,
  loadHandlers: (
    filePath: string,
    details: TSetup,
  ) => Promise<EaCRuntimeHandlerSet | undefined>,
  configurePipeline: (
    filePath: string,
    pipeline: EaCRuntimeHandlerPipeline,
    details: TSetup,
  ) => void,
  revision: string,
): Promise<PathMatch[]> {
  const allPaths = await fileHandler.LoadAllPaths(revision);

  if (!IS_BUILDING) {
    const details = await setup(allPaths);

    const apiPathPatternCalls = allPaths
      .filter(
        (p) => !p.endsWith("_middleware.ts") && !p.endsWith("_layout.tsx"),
      )
      .map((p) => {
        return convertFilePathToMatch<TSetup>(
          p,
          dfs,
          loadHandlers,
          configurePipeline,
          details,
        );
      });

    const patterns = await Promise.all(apiPathPatternCalls);

    return patterns
      .flatMap((p) => p)
      .sort((a, b) => b.Priority - a.Priority)
      .sort((a, b) => {
        const aCatch = a.PatternText.endsWith("*") ? -1 : 1;
        const bCatch = b.PatternText.endsWith("*") ? -1 : 1;

        return bCatch - aCatch;
      });
  } else {
    return [];
  }
}
