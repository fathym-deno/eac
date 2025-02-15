import { z } from "./.deps.ts";
import {
  EaCDistributedFileSystemAsCode,
  EaCDistributedFileSystemAsCodeSchema,
} from "./EaCDistributedFileSystemAsCode.ts";
import {
  DistributedFileSystemOptions,
  DistributedFileSystemOptionsSchema,
} from "./DistributedFileSystemOptions.ts";

/**
 * Represents the Everything as Code (EaC) Distributed File System (DFS) structure.
 *
 * This type contains **optional global DFS options** and a record mapping unique keys to `EaCDistributedFileSystemAsCode` objects.
 */
export type EverythingAsCodeDFS = {
  /**
   * **Optional** global configuration options for all DFSs.
   */
  $GlobalOptions?: {
    DFSs?: DistributedFileSystemOptions;
  };

  /**
   * A collection of Distributed File Systems (DFS) mapped by unique keys.
   * It includes **individual DFS configurations** (but not global options).
   */
  DFSs?: Record<string, EaCDistributedFileSystemAsCode>;
};

/**
 * Schema for `EverythingAsCodeDFS`.
 * - Ensures `$GlobalOptions` is optional.
 * - Ensures `DFSs` is a **record** of `EaCDistributedFileSystemAsCode` instances.
 */
export const EverythingAsCodeDFSSchema: z.ZodObject<{
  $GlobalOptions: z.ZodOptional<
    z.ZodObject<{
      DFSs: z.ZodOptional<typeof DistributedFileSystemOptionsSchema>;
    }>
  >;
  DFSs: z.ZodOptional<
    z.ZodRecord<z.ZodString, typeof EaCDistributedFileSystemAsCodeSchema>
  >;
}> = z
  .object({
    $GlobalOptions: z
      .object({
        DFSs: DistributedFileSystemOptionsSchema.optional(),
      })
      .optional()
      .describe(
        "Optional global configuration options for all DFSs, including worker and performance settings.",
      ),

    DFSs: z
      .record(z.string(), EaCDistributedFileSystemAsCodeSchema)
      .optional()
      .describe("A collection of individual Distributed File Systems."),
  })
  .describe(
    "Schema for EverythingAsCodeDFS, ensuring structured DFS configurations with optional global options.",
  );

/**
 * Type guard for `EverythingAsCodeDFS`.
 * Validates if the given object conforms to the `EverythingAsCodeDFS` structure.
 *
 * @param eac - The object to validate.
 * @returns True if the object is a valid `EverythingAsCodeDFS`, false otherwise.
 */
export function isEverythingAsCodeDFS(
  eac: unknown,
): eac is EverythingAsCodeDFS {
  return EverythingAsCodeDFSSchema.safeParse(eac).success;
}

/**
 * Validates and parses an object as `EverythingAsCodeDFS`.
 *
 * @param eac - The object to validate and parse.
 * @throws If the object does not conform to the `EverythingAsCodeDFSSchema`.
 * @returns The parsed `EverythingAsCodeDFS` object.
 */
export function parseEverythingAsCodeDFS(eac: unknown): EverythingAsCodeDFS {
  return EverythingAsCodeDFSSchema.parse(eac);
}
