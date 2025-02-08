import { z } from './.deps.ts';
import {
  EaCVertexDetails,
  EaCVertexDetailsSchema,
} from '../../eac/EaCVertexDetails.ts';

/**
 * Represents details for a Distributed File System (DFS) in Everything as Code (EaC).
 *
 * This type extends `EaCVertexDetails` and includes properties for file caching, extensions,
 * default files, and other DFS-specific configurations.
 */
export type EaCDistributedFileSystemDetails<
  TType extends string | undefined = string
> = {
  /** The database lookup for caching mechanisms. */
  CacheDBLookup?: string;

  /** The cache expiration time in seconds. */
  CacheSeconds?: number;

  /** The default file to serve when no specific file is requested. */
  DefaultFile?: string;

  /** A list of supported file extensions in this DFS. */
  Extensions?: string[];

  /** The type identifier for this DFS. */
  Type: TType;

  /** Whether cascading behavior is enabled. */
  UseCascading?: boolean;

  /** The path used for DFS workers. */
  WorkerPath?: string;
} & EaCVertexDetails;

/**
 * Schema for `EaCDistributedFileSystemDetails`.
 * Ensures that DFS-specific properties conform to expected types while extending `EaCVertexDetailsSchema`.
 */
export const EaCDistributedFileSystemDetailsSchema =
  EaCVertexDetailsSchema.extend({
    CacheDBLookup: z
      .string()
      .optional()
      .describe('The database lookup for caching mechanisms.'),
    CacheSeconds: z
      .number()
      .optional()
      .describe('The cache expiration time in seconds.'),
    DefaultFile: z
      .string()
      .optional()
      .describe(
        'The default file to serve when no specific file is requested.'
      ),
    Extensions: z
      .array(z.string())
      .optional()
      .describe('A list of supported file extensions in this DFS.'),
    Type: z.string().describe('The type identifier for this DFS.'),
    UseCascading: z
      .boolean()
      .optional()
      .describe('Whether cascading behavior is enabled.'),
    WorkerPath: z
      .string()
      .optional()
      .describe('The path used for DFS workers.'),
  }).describe(
    'Schema for EaCDistributedFileSystemDetails, defining caching, file handling, and worker configurations for a Distributed File System in Everything as Code.'
  );

/**
 * Type guard for `EaCDistributedFileSystemDetails`.
 * Validates if the given object conforms to the `EaCDistributedFileSystemDetails` structure.
 *
 * @param type - The expected DFS type. If provided, ensures the `Type` field matches.
 * @param dfs - The object to validate.
 * @returns True if the object is a valid `EaCDistributedFileSystemDetails<TType>`, false otherwise.
 */
export function isEaCDistributedFileSystemDetails<
  TType extends string | undefined = string
>(type: TType, dfs: unknown): dfs is EaCDistributedFileSystemDetails<TType> {
  if (!EaCDistributedFileSystemDetailsSchema.safeParse(dfs).success)
    return false;

  return !type || (dfs as EaCDistributedFileSystemDetails<TType>).Type === type;
}

/**
 * Validates and parses an object as `EaCDistributedFileSystemDetails`.
 *
 * @param dfs - The object to validate and parse.
 * @throws If the object does not conform to the `EaCDistributedFileSystemDetailsSchema`.
 * @returns The parsed `EaCDistributedFileSystemDetails<TType>` object.
 */
export function parseEaCDistributedFileSystemDetails<
  TType extends string | undefined = string
>(dfs: unknown): EaCDistributedFileSystemDetails<TType> {
  return EaCDistributedFileSystemDetailsSchema.parse(
    dfs
  ) as EaCDistributedFileSystemDetails<TType>;
}
