import { z } from "./.deps.ts";
import {
  EaCModuleActuator,
  EaCModuleActuatorSchema,
} from "./EaCModuleActuator.ts";

/**
 * The collection of EaC module actuators for use in EaC processing.
 */
export type EaCModuleActuators = {
  /**
   * When true, the handlers will enforce a complete update; when false, they will merge with existing data.
   */
  $Force?: boolean;
} & Record<string, EaCModuleActuator>;

/**
 * `EaCModuleActuatorsSchema` is a Zod schema for validating the structure of EaC module actuators.
 * This schema includes a `$Force` flag for determining update behavior and allows for dynamic keys,
 * each mapping to a `EaCModuleActuator` configuration.
 */
export const EaCModuleActuatorsSchema: z.ZodObject<
  {
    $Force: z.ZodOptional<z.ZodBoolean>;
  },
  "strip",
  z.ZodTypeAny,
  EaCModuleActuators,
  EaCModuleActuators
> = z
  .object({
    $Force: z
      .boolean()
      .optional()
      .describe(
        "Boolean flag indicating if handlers should perform a complete update (`true`) or merge with existing handlers (`false`).",
      ),
  })
  .catchall(EaCModuleActuatorSchema)
  .describe(
    "Schema for a collection of EaC module actuators, with a `$Force` flag to control update behavior and dynamic keys mapping to specific module handler configurations. This structure facilitates modular and flexible processing of EaC operations.",
  );

export type EaCModuleActuatorsSchema = z.infer<typeof EaCModuleActuatorsSchema>;
