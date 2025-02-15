import { DFSFileInfo } from "./DFSFileInfo.ts";
import { FetchDFSFileHandler } from "./FetchDFSFileHandler.ts";
import { toText } from "jsr:@std/streams@1.0.8/to-text";

/**
 * Implements `DFSFileHandler` for NPM-based file storage via Skypack CDN.
 */
export class NPMFetchDFSFileHandler extends FetchDFSFileHandler {
  constructor(packageName: string) {
    const fileRoot = new URL(`${packageName}/`, "https://cdn.skypack.dev/");
    super(fileRoot.href);
  }

  /**
   * Retrieves file information but ensures the Skypack response is valid.
   */
  public override async GetFileInfo(
    filePath: string,
    revision: string,
    defaultFileName?: string,
    extensions?: string[],
    useCascading?: boolean,
    cacheDb?: Deno.Kv,
    cacheSeconds?: number,
  ): Promise<DFSFileInfo | undefined> {
    // Call the base FetchDFSFileHandler's GetFileInfo method
    const fileInfo = await super.GetFileInfo(
      filePath,
      revision,
      defaultFileName,
      extensions,
      useCascading,
      cacheDb,
      cacheSeconds,
    );

    if (!fileInfo) return undefined;

    try {
      const text = await toText(fileInfo.Contents);

      const match = text.match(
        /export\s+\{default\}\s+from\s+['"]([^'"]+)['"]/,
      );

      if (!match) {
        return undefined;
      }

      const extractedPath = match[1];

      const validationUrl = new URL(extractedPath, this.Root).href;

      try {
        const validationResponse = await fetch(validationUrl, {
          method: "HEAD",
        });

        if (!validationResponse.ok) {
          return undefined;
        }
      } catch {
        return undefined;
      }

      return fileInfo;
    } catch (err) {
      console.error(`Error validating Skypack file: ${filePath}`, err);
      return undefined;
    }
  }
}
