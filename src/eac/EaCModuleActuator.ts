import { z } from "./.deps.ts";

/**
 * EaC module actuator for use in EaC processing.
 */
export type EaCModuleActuator = {
  /** API path for this module. */
  APIPath: string;

  /** Order for this module in processing. Modules are process in parallel when sharing an order. */
  Order: number;
};

/**
 * `EaCModuleActuatorSchema` represents a configuration for handling a specific EaC module,
 * including its API path and processing order. This schema ensures a consistent structure for
 * module handlers, supporting reliable sequencing and modular API configuration within the EaC environment.
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

export type EaCModuleActuatorSchema = z.infer<typeof EaCModuleActuatorSchema>;
