import { z } from "./.deps.ts";

/**
 * Represents options for configuring a Distributed File System (DFS).
 *
 * This type includes properties for worker behavior.
 */
export type DistributedFileSystemOptions = {
  /** Whether to prevent the use of workers in the DFS. */
  PreventWorkers?: boolean;
};

/**
 * Schema for `DistributedFileSystemOptions`.
 * Ensures that DFS-specific options conform to expected types.
 */
export const DistributedFileSystemOptionsSchema: z.ZodObject<
  {
    PreventWorkers: z.ZodOptional<z.ZodBoolean>;
  },
  "strip",
  z.ZodTypeAny,
  DistributedFileSystemOptions,
  DistributedFileSystemOptions
> = z
  .object({
    PreventWorkers: z
      .boolean()
      .optional()
      .describe("Whether to prevent the use of workers in the DFS."),
  })
  .describe(
    "Schema for DistributedFileSystemOptions, defining worker-related configurations for a Distributed File System.",
  );

/**
 * Type guard for `DistributedFileSystemOptions`.
 * Validates if the given object conforms to the `DistributedFileSystemOptions` structure.
 *
 * @param dfsOptions - The object to validate.
 * @returns True if the object is a valid `DistributedFileSystemOptions`, false otherwise.
 */
export function isDistributedFileSystemOptions(
  dfsOptions: unknown,
): dfsOptions is DistributedFileSystemOptions {
  return DistributedFileSystemOptionsSchema.safeParse(dfsOptions).success;
}

/**
 * Validates and parses an object as `DistributedFileSystemOptions`.
 *
 * @param dfsOptions - The object to validate and parse.
 * @throws If the object does not conform to the `DistributedFileSystemOptionsSchema`.
 * @returns The parsed `DistributedFileSystemOptions` object.
 */
export function parseDistributedFileSystemOptions(
  dfsOptions: unknown,
): DistributedFileSystemOptions {
  return DistributedFileSystemOptionsSchema.parse(
    dfsOptions,
  ) as DistributedFileSystemOptions;
}
