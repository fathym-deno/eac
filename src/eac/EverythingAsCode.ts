import { z } from "./.deps.ts";
import { EaCModuleHandlers } from "./EaCModuleHandlers.ts";
import { EaCEnterpriseDetails } from "./EaCEnterpriseDetails.ts";
import { EaCEnterpriseDetailsSchema } from "./EaCEnterpriseDetails.ts";
import { EaCModuleHandlersSchema } from "./EaCModuleHandlers.ts";

/**
 * Everything as Code (EaC) graph.
 */
export type EverythingAsCode = {
  /** The Details for the EaC node. */
  Details?: EaCEnterpriseDetails;

  /** The enterprise lookup for the EaC. */
  EnterpriseLookup?: string;

  /** The module handlers for the EaC. */
  Handlers?: EaCModuleHandlers;

  /** The parent enterprise lookup for the EaC. */
  ParentEnterpriseLookup?: string;
};

/**
 * `EverythingAsCodeSchema` defines the foundational structure for an EaC (Everything as Code) node,
 * which includes core identification, linkage, and modular configuration properties. This schema
 * ensures consistency and clarity when managing code-driven infrastructure or configurations.
 */
export const EverythingAsCodeSchema: z.ZodObject<
  {
    Details: z.ZodOptional<typeof EaCEnterpriseDetailsSchema>;
    EnterpriseLookup: z.ZodOptional<z.ZodString>;
    Handlers: z.ZodOptional<typeof EaCModuleHandlersSchema>;
    ParentEnterpriseLookup: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  EverythingAsCode,
  EverythingAsCode
> = z
  .object({
    Details: EaCEnterpriseDetailsSchema.optional(),

    EnterpriseLookup: z
      .string()
      .optional()
      .describe(
        "A unique identifier for the enterprise, enabling efficient referencing and management within an EaC ecosystem.",
      ),

    Handlers: EaCModuleHandlersSchema.optional(),

    ParentEnterpriseLookup: z
      .string()
      .optional()
      .describe(
        "A unique identifier for a parent enterprise, allowing hierarchical relationships within an EaC ecosystem.",
      ),
  })
  .describe(
    "Schema for `EverythingAsCode`, defining the essential structure for managing EaC nodes. This schema includes details, enterprise identifiers, module handlers, and hierarchical linking properties to facilitate dynamic and scalable code management.",
  );

export type EverythingAsCodeSchema = z.infer<typeof EverythingAsCodeSchema>;

/**
 * EaC Diff represents the difference between two versions of the Everything as Code graph, omitting the enterprise lookup, parent enterprise lookup and details.
 */
export type EaCDiff = Omit<
  EverythingAsCode,
  "EnterpriseLookup" | "ParentEnterpriseLookup" | "Details"
>;

//   AccessRights?: { [key: string]: EaCAccessRightAsCode };
//   Hosts?: { [key: string]: EaCHostAsCode };
//   PrimaryHost?: string;
