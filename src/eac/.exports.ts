import { resolvePath } from "./.deps.ts";

/**
 * The core Everything as Code (EaC) types.
 * @module
 */
export * from "./AllAnyTypes.ts";
export * from "./EaCDetails.ts";
export * from "./EaCEnterpriseDetails.ts";
export * from "./EaCModuleHandler.ts";
export * from "./EaCModuleHandlers.ts";
export * from "./EaCMetadataBase.ts";
export * from "./EaCVertexDetails.ts";
export * from "./EverythingAsCode.ts";

/**
 * Resolve a path to the Fathym Everything as Code module.
 *
 * @param path The path to the file to resolve.
 * @returns The path to the file.
 */
export function resolveFathymEaCMetaUrl(path: string): string {
  return resolvePath(path, import.meta.resolve);
}
