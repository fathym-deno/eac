import { z } from "./.deps.ts";

/**
 * EaC module actuator for use in EaC processing.
 */
export type EaCModuleActuator = {
  /** API path for this module. */
  APIPath: string;

  /** Order for this module in processing. Modules are processed in parallel when sharing an order. */
  Order: number;
};

/**
 * Schema for `EaCModuleActuator`.
 * This schema validates a configuration for handling a specific EaC module,
 * ensuring consistency for API paths and processing order.
 */
export const EaCModuleActuatorSchema: z.ZodObject<
  {
    APIPath: z.ZodString;
    Order: z.ZodNumber;
  },
  "strip",
  z.ZodTypeAny,
  EaCModuleActuator,
  EaCModuleActuator
> = z
  .object({
    APIPath: z
      .string()
      .describe(
        "The endpoint or path used for API calls associated with this module, directing EaC processes to the correct API route.",
      ),
    Order: z
      .number()
      .describe(
        "The processing sequence for this module. Modules with the same order are processed in parallel, while different order values define sequential processing.",
      ),
  })
  .describe(
    "Schema for an EaC module actuator, defining the API path and processing order. This schema supports structured, sequential, or parallel handling of modules in EaC processing environments.",
  );

/**
 * Type guard for `EaCModuleActuator`.
 * Validates if the given object conforms to the `EaCModuleActuator` structure.
 *
 * @param actuator - The object to validate.
 * @returns True if the object is a valid `EaCModuleActuator`, false otherwise.
 */
export function isEaCModuleActuator(
  actuator: unknown,
): actuator is EaCModuleActuator {
  return EaCModuleActuatorSchema.safeParse(actuator).success;
}

/**
 * Validates and parses an object as `EaCModuleActuator`.
 *
 * @param actuator - The object to validate and parse.
 * @throws If the object does not conform to the `EaCModuleActuator` schema.
 * @returns The parsed `EaCModuleActuator` object.
 */
export function parseEaCModuleActuator(
  actuator: unknown,
): EaCModuleActuator {
  return EaCModuleActuatorSchema.parse(actuator);
}
