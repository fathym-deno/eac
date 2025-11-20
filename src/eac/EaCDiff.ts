import { z } from "./.deps.ts";
import { EverythingAsCode, EverythingAsCodeSchema } from "./EverythingAsCode.ts";

/**
 * EaC Diff represents the difference between two versions of the Everything as Code graph,
 * omitting the enterprise lookup, parent enterprise lookup, and details.
 */
export type EaCDiff = Omit<
  EverythingAsCode,
  "EnterpriseLookup" | "ParentEnterpriseLookup" | "Details"
>;

/**
 * Schema for `EaCDiff`.
 * Derived from `EverythingAsCodeSchema`, excluding `EnterpriseLookup`, `ParentEnterpriseLookup`, and `Details`.
 */
export const EaCDiffSchema = EverythingAsCodeSchema.omit({
  EnterpriseLookup: true,
  ParentEnterpriseLookup: true,
  Details: true,
})
  .catchall(z.unknown())
  .describe(
    "Schema for EaCDiff, representing differences between two Everything as Code (EaC) graphs, excluding `EnterpriseLookup`, `ParentEnterpriseLookup`, and `Details`.",
  );

/**
 * Type guard for `EaCDiff`.
 * Validates if the given object conforms to the `EaCDiff` structure.
 *
 * @param diff - The object to validate.
 * @returns True if the object is a valid `EaCDiff`, false otherwise.
 */
export function isEaCDiff(diff: unknown): diff is EaCDiff {
  return EaCDiffSchema.safeParse(diff).success;
}

/**
 * Validates and parses an object as `EaCDiff`.
 *
 * @param diff - The object to validate and parse.
 * @throws If the object does not conform to the `EaCDiff` schema.
 * @returns The parsed `EaCDiff` object.
 */
export function parseEaCDiff(diff: unknown): EaCDiff {
  return EaCDiffSchema.parse(diff) as EaCDiff;
}
