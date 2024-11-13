import { z } from "./.deps.ts";
import {
  EaCModuleHandler,
  EaCModuleHandlerSchema,
} from "./EaCModuleHandler.ts";

/**
 * The collection of EaC module handlers for use in EaC processing.
 */
export type EaCModuleHandlers = {
  /**
   * When true, the handlers will enforce a complete update; when false, they will merge with existing data.
   */
  $Force?: boolean;
} & Record<string, EaCModuleHandler>;

/**
 * `EaCModuleHandlersSchema` is a Zod schema for validating the structure of EaC module handlers.
 * This schema includes a `$Force` flag for determining update behavior and allows for dynamic keys,
 * each mapping to a `EaCModuleHandler` configuration.
 */
export const EaCModuleHandlersSchema: z.ZodObject<
  {
    $Force: z.ZodOptional<z.ZodBoolean>;
  },
  "strip",
  z.ZodTypeAny,
  EaCModuleHandlers,
  EaCModuleHandlers
> = z
  .object({
    $Force: z
      .boolean()
      .optional()
      .describe(
        "Boolean flag indicating if handlers should perform a complete update (`true`) or merge with existing handlers (`false`).",
      ),
  })
  .catchall(EaCModuleHandlerSchema)
  .describe(
    "Schema for a collection of EaC module handlers, with a `$Force` flag to control update behavior and dynamic keys mapping to specific module handler configurations. This structure facilitates modular and flexible processing of EaC operations.",
  );

export type EaCModuleHandlersSchema = z.infer<typeof EaCModuleHandlersSchema>;
