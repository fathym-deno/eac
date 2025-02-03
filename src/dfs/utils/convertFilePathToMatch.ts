import {
  EaCDistributedFileSystemDetails,
  EaCRuntimeHandlerPipeline,
  EaCRuntimeHandlerSet,
} from "./.deps.ts";
import { PathMatch } from "./PathMatch.ts";
import { convertFilePathToPattern } from "./convertFilePathToPattern.ts";

export async function convertFilePathToMatch<TSetup>(
  filePath: string,
  dfs: EaCDistributedFileSystemDetails,
  loadHandlers: (
    filePath: string,
    details: TSetup,
  ) => Promise<EaCRuntimeHandlerSet | undefined>,
  configurePipeline: (
    filePath: string,
    pipeline: EaCRuntimeHandlerPipeline,
    details: TSetup,
  ) => void,
  details: TSetup,
): Promise<PathMatch[]> {
  const patternResults = convertFilePathToPattern(filePath, dfs.DefaultFile);

  const pathMatchCalls = patternResults.map(
    async ({ patternText, priority }) => {
      const handler = await loadHandlers(filePath, details);

      const pipeline = new EaCRuntimeHandlerPipeline();

      if (handler) {
        pipeline.Append(...(Array.isArray(handler) ? handler : [handler]));
      }

      configurePipeline(filePath, pipeline, details);

      return {
        Handlers: pipeline,
        Path: filePath,
        Pattern: new URLPattern({
          pathname: patternText,
        }),
        PatternText: patternText,
        Priority: priority,
      };
    },
  );

  return await Promise.all(pathMatchCalls);
}
