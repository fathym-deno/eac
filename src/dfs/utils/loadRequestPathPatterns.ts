import { type IDFSFileHandler } from "./.deps.ts";
import { IS_BUILDING } from "../../runtime/config/constants.ts";
import { EaCRuntimeHandlerPipeline } from "../../runtime/pipelines/EaCRuntimeHandlerPipeline.ts";
import { EaCRuntimeHandlerSet } from "../../runtime/pipelines/EaCRuntimeHandlerSet.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { PathMatch } from "./PathMatch.ts";
import { convertFilePathToMatch } from "./convertFilePathToMatch.ts";

// TODO: Re-implement revision/caching support using withDFSCache() pattern
export async function loadRequestPathPatterns<TSetup>(
  fileHandler: IDFSFileHandler,
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
): Promise<PathMatch[]> {
  const allPaths = await fileHandler.LoadAllPaths();

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
