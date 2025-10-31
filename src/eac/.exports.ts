/**
 * The core Everything as Code (EaC) types.
 * @module
 *
 * @example Using `AllAnyTypes`
 * ```typescript
 * import { AllAnyTypes } from "@fathym/eac";
 *
 * const allType: AllAnyTypes = "All";
 * const anyType: AllAnyTypes = "Any";
 * ```
 *
 * @example Using `EaCDetails`
 * ```typescript
 * import { EaCDetails, EaCVertexDetails } from "@fathym/eac";
 *
 * const eacDetailsExample: EaCDetails<EaCVertexDetails> = {
 *   Details: {
 *     Name: "Example Node",
 *     Description: "An example of EaCDetails",
 *   },
 * };
 * ```
 *
 * @example Using `EaCEnterpriseDetails`
 * ```typescript
 * import { EaCEnterpriseDetails } from "@fathym/eac";
 *
 * const eacEnterpriseDetailsExample: EaCEnterpriseDetails = {
 *   Name: "Fathym Inc.",
 *   Description: "An example enterprise within EaC.",
 * };
 * ```
 *
 * @example Using `EaCMetadataBase`
 * ```typescript
 * import { EaCMetadataBase } from "@fathym/eac";
 *
 * const eacMetadataExample: EaCMetadataBase = {
 *   customKey: "customValue",
 *   anotherKey: 123,
 * };
 * ```
 *
 * @example Using `EaCModuleActuator`
 * ```typescript
 * import { EaCModuleActuator } from "@fathym/eac";
 *
 * const eacModuleActuatorExample: EaCModuleActuator = {
 *   APIPath: "/api/execute",
 *   Order: 2,
 * };
 * ```
 *
 * @example Using `EaCModuleActuators`
 * ```typescript
 * import { EaCModuleActuators } from "@fathym/eac";
 *
 * const eacModuleActuatorsExample: EaCModuleActuators = {
 *   $Force: true,
 *   ActuatorOne: { APIPath: "/api/module1", Order: 1 },
 * };
 * ```
 *
 * @example Using `EaCUserRecord`
 * ```typescript
 * import { EaCUserRecord } from "@fathym/eac";
 *
 * const eacUserRecordExample: EaCUserRecord = {
 *   EnterpriseLookup: "enterprise-123",
 *   EnterpriseName: "Example Enterprise",
 *   Owner: true,
 *   ParentEnterpriseLookup: "parent-456",
 *   Username: "testUser",
 * };
 * ```
 *
 * @example Using `EaCVertexDetails`
 * ```typescript
 * import { EaCVertexDetails } from "@fathym/eac";
 *
 * const eacVertexDetailsExample: EaCVertexDetails = {
 *   Name: "Vertex Example",
 *   Description: "Details about an example vertex",
 * };
 * ```
 *
 * @example Using `EverythingAsCode`
 * ```typescript
 * import { EverythingAsCode } from "@fathym/eac";
 *
 * const everythingAsCodeExample: EverythingAsCode = {
 *   EnterpriseLookup: "enterprise-789",
 *   ParentEnterpriseLookup: "parent-999",
 *   Actuators: {
 *     $Force: false,
 *     ModuleOne: { APIPath: "/api/handler", Order: 2 },
 *   },
 *   Details: {
 *     Name: "Example Node",
 *     Description: "A detailed node example",
 *   },
 * };
 * ```
 *
 * @example Using `resolveFathymEaCMetaUrl`
 * ```typescript
 * import { resolveFathymEaCMetaUrl } from "@fathym/eac";
 *
 * const resolvedPath = resolveFathymEaCMetaUrl("/path/to/module");
 * console.log(resolvedPath);
 * ```
 */
export * from "./api/.exports.ts";
export * from "./AllAnyTypes.ts";
export * from "./EaCDetails.ts";
export * from "./EaCEnterpriseDetails.ts";
export * from "./EaCMetadataBase.ts";
export * from "./EaCModuleActuator.ts";
export * from "./EaCModuleActuators.ts";
export * from "./EaCUserRecord.ts";
export * from "./EaCVertexDetails.ts";
export * from "./EverythingAsCode.ts";
