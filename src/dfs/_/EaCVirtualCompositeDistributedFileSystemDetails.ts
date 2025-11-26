import { z } from "./.deps.ts";
import {
  EaCDistributedFileSystemDetails,
  EaCDistributedFileSystemDetailsSchema,
} from "./EaCDistributedFileSystemDetails.ts";

export type EaCVirtualCompositeDistributedFileSystemDetails = {
  BaseDFSLookups: string[];
} & EaCDistributedFileSystemDetails<"VirtualComposite">;

export const EaCVirtualCompositeDistributedFileSystemDetailsSchema: z.ZodObject<
  {
    CacheDBLookup: z.ZodOptional<z.ZodString>;
    CacheSeconds: z.ZodOptional<z.ZodNumber>;
    DefaultFile: z.ZodOptional<z.ZodString>;
    Extensions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    UseCascading: z.ZodOptional<z.ZodBoolean>;
    WorkerPath: z.ZodOptional<z.ZodString>;
    Type: z.ZodLiteral<"VirtualComposite">;
    BaseDFSLookups: z.ZodArray<z.ZodString>;
  },
  z.core.$strip
> = EaCDistributedFileSystemDetailsSchema.extend({
  Type: z
    .literal("VirtualComposite")
    .describe("Identifies the DFS as a virtual composite overlay."),
  BaseDFSLookups: z
    .array(z.string())
    .min(1)
    .describe(
      "Ordered list of DFS lookups that act as fallbacks once virtual files are exhausted.",
    ),
}).describe(
  "Schema for EaCVirtualCompositeDistributedFileSystemDetails, describing an overlay-first DFS that falls back through multiple base DFS handlers.",
);

export function isEaCVirtualCompositeDistributedFileSystemDetails(
  dfs: unknown,
): dfs is EaCVirtualCompositeDistributedFileSystemDetails {
  return EaCVirtualCompositeDistributedFileSystemDetailsSchema.safeParse(dfs)
    .success;
}

export function parseEaCVirtualCompositeDistributedFileSystemDetails(
  dfs: unknown,
): EaCVirtualCompositeDistributedFileSystemDetails {
  return EaCVirtualCompositeDistributedFileSystemDetailsSchema.parse(dfs);
}
