import { z } from "./.deps.ts";
import {
  EaCModuleActuator,
  EaCModuleActuatorSchema,
} from "./EaCModuleActuator.ts";

/**
 * Represents a collection of EaC module actuators for use in EaC processing.
 */
export type EaCModuleActuators = {
  /**
   * When true, the handlers will enforce a complete update; when false, they will merge with existing data.
   */
  $Force?: boolean;
} & Record<string, EaCModuleActuator>;

/**
 * Schema for `EaCModuleActuators`.
 * Validates a collection of EaC module actuators with a `$Force` flag and dynamic keys mapping to individual `EaCModuleActuator` configurations.
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

/**
 * Type guard for `EaCModuleActuators`.
 * Validates if the given object conforms to the `EaCModuleActuators` structure.
 *
 * @param actuators - The object to validate.
 * @returns True if the object is a valid `EaCModuleActuators`, false otherwise.
 */
export function isEaCModuleActuators(
  actuators: unknown,
): actuators is EaCModuleActuators {
  return EaCModuleActuatorsSchema.safeParse(actuators).success;
}

/**
 * Validates and parses an object as `EaCModuleActuators`.
 *
 * @param actuators - The object to validate and parse.
 * @throws If the object does not conform to the `EaCModuleActuators` schema.
 * @returns The parsed `EaCModuleActuators` object.
 */
export function parseEaCModuleActuators(
  actuators: unknown,
): EaCModuleActuators {
  return EaCModuleActuatorsSchema.parse(actuators);
}
