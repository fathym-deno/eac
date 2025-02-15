import { FetchDFSFileHandler } from "./FetchDFSFileHandler.ts";

/**
 * Implements `DFSFileHandler` for NPM-based file storage via Skypack CDN.
 */
export class NPMFetchDFSFileHandler extends FetchDFSFileHandler {
  constructor(packageName: string) {
    const fileRoot = new URL(`${packageName}/`, "https://cdn.skypack.dev/");
    super(fileRoot.href);
  }
}
