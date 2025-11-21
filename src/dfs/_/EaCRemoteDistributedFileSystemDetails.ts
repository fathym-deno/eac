import { z } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemDetailsSchema,
} from "./EaCDistributedFileSystemDetails.ts";

/**
 * Represents details for a Remote-backed Distributed File System (DFS) in Everything as Code (EaC).
 *
 * This type extends `EaCDistributedFileSystemDetails` with Remote-specific properties.
 */
export type EaCRemoteDistributedFileSystemDetails = {
  /** The root URL/path for the remote DFS. */
  RemoteRoot: string;
} & EaCDistributedFileSystemDetails<"Remote">;

/**
 * Schema for `EaCRemoteDistributedFileSystemDetails`.
 * Ensures `Type` is explicitly `"Remote"` while extending `EaCDistributedFileSystemDetailsSchema`.
 */
export const EaCRemoteDistributedFileSystemDetailsSchema: z.ZodObject<{
  Type: z.ZodLiteral<"Remote">;
  RemoteRoot: z.ZodString;
}> = EaCDistributedFileSystemDetailsSchema.extend({
  Type: z.literal("Remote").describe("The fixed type identifier for this DFS."),
  RemoteRoot: z.string().describe("The root URL/path for the remote DFS."),
}).describe(
  "Schema for EaCRemoteDistributedFileSystemDetails, defining Remote-specific properties for a Distributed File System.",
);

/**
 * Type guard for `EaCRemoteDistributedFileSystemDetails`.
 * Validates if the given object conforms to the `EaCRemoteDistributedFileSystemDetails` structure.
 *
 * @param dfs - The object to validate.
 * @returns True if the object is a valid `EaCRemoteDistributedFileSystemDetails`, false otherwise.
 */
export function isEaCRemoteDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCRemoteDistributedFileSystemDetails {
  return EaCRemoteDistributedFileSystemDetailsSchema.safeParse(dfs).success;
}

/**
 * Validates and parses an object as `EaCRemoteDistributedFileSystemDetails`.
 *
 * @param dfs - The object to validate and parse.
 * @throws If the object does not conform to the `EaCRemoteDistributedFileSystemDetailsSchema`.
 * @returns The parsed `EaCRemoteDistributedFileSystemDetails` object.
 */
export function parseEaCRemoteDistributedFileSystemDetails(
  dfs: unknown,
): EaCRemoteDistributedFileSystemDetails {
  return EaCRemoteDistributedFileSystemDetailsSchema.parse(dfs);
}
