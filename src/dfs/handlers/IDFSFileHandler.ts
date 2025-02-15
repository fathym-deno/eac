import { DFSFileInfo } from "./DFSFileInfo.ts";

/**
 * Interface defining methods for a Distributed File System (DFS) File Handler.
 */

export interface IDFSFileHandler {
  /**
   * Retrieves file information for a given path and revision.
   *
   * @param filePath - The path of the file.
   * @param revision - The revision identifier.
   * @param defaultFileName - Optional default file name.
   * @param extensions - Optional array of allowed file extensions.
   * @param useCascading - Whether cascading lookup should be used.
   * @param cacheDb - Optional Deno.Kv cache database.
   * @param cacheSeconds - Optional cache expiration time in seconds.
   * @returns A promise resolving to file information or undefined if not found.
   */
  GetFileInfo(
    filePath: string,
    revision: string,
    defaultFileName?: string,
    extensions?: string[],
    useCascading?: boolean,
    cacheDb?: Deno.Kv,
    cacheSeconds?: number,
  ): Promise<DFSFileInfo | undefined>;

  /**
   * Loads all available file paths for a given revision.
   *
   * @param revision - The revision identifier.
   * @returns A promise resolving to an array of file paths.
   */
  LoadAllPaths(revision: string): Promise<string[]>;

  /**
   * The root directory of the DFS.
   */
  Root: string;

  /**
   * Removes a file from the DFS.
   *
   * @param filePath - The path of the file.
   * @param revision - The revision identifier.
   * @param cacheDb - Optional Deno.Kv cache database.
   * @returns A promise resolving when the file is removed.
   */
  RemoveFile(
    filePath: string,
    revision: string,
    cacheDb?: Deno.Kv,
  ): Promise<void>;

  /**
   * Writes a file to the DFS.
   *
   * @param filePath - The path where the file will be stored.
   * @param revision - The revision identifier.
   * @param stream - The file data as a `ReadableStream<Uint8Array>`.
   * @param ttlSeconds - Optional time-to-live in seconds.
   * @param headers - Optional HTTP headers for metadata.
   * @param maxChunkSize - Optional max chunk size for writing.
   * @param cacheDb - Optional Deno.Kv cache database.
   * @returns A promise resolving when the file is successfully written.
   */
  WriteFile(
    filePath: string,
    revision: string,
    stream: ReadableStream<Uint8Array>,
    ttlSeconds?: number,
    headers?: Headers,
    maxChunkSize?: number,
    cacheDb?: Deno.Kv,
  ): Promise<void>;
}
