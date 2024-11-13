// deno-lint-ignore-file no-explicit-any
import { EaCDetails } from "../eac/EaCDetails.ts";
import {
  $FluentTag,
  EaCVertexDetails,
  HasTypeCheck,
  IoCContainer,
  IsNativeType,
  IsObject,
  IsObjectNotNative,
} from "./.deps.ts";

/**
 * `EverythingAsCodeTags<T>` is a recursive type that applies tags to all properties of type `T`.
 *
 * ### Parameters:
 * - `T`: The input type to which tags are applied.
 *
 * This type checks if the input type `T` is an object (but not a native type like string or number) and applies various tag types:
 * - `EaCObjectTags`: Adds standard tags and details for an object.
 * - `EaCStandardTags`: Handles regular fields and methods.
 * - `EaCVertexDetailsTags`: Handles cases where the object contains `EaCVertexDetails`.
 * - `EaCAsCodeTags`: Applies specific tagging for `EaCDetails` structures.
 *
 * ### Example:
 * ```ts
 * type Example = {
 *   Details: {
 *     "@Methods-handlers": { Compile: () => IoCContainer };
 *   };
 * };
 *
 * type Tagged = EverythingAsCodeTags<Example>;
 * ```
 */
export type EverythingAsCodeTags<T> = true extends IsObjectNotNative<T>
  ? EaCObjectTags<T>
  : T;

type EaCObjectTags<T> =
  & T
  & EaCStandardTags<T>
  & EaCVertexDetailsTags<T>
  & EaCAsCodeTags<T>;

// Improved handling of recursive tag types and union types
type EaCStandardTags<T> = {
  [K in keyof T as K extends "Details" ? never : K]: EverythingAsCodeTags<T[K]>;
};

// Handles conditional logic with union types and nested properties
type EaCVertexDetailsTags<T> = [
  HasTypeCheck<NonNullable<T>, EaCVertexDetails>,
] extends [true] ? {
    [K in keyof T as K extends "Details" ? K : never]: EverythingAsCodeTags<
      T[K] & $FluentTag<"Methods", "Object", "generic", { generic: true }>
    >;
  }
  : {};

// Tag handling for EaCDetails and nested structures
type EaCAsCodeTags<T> = [
  HasTypeCheck<NonNullable<T>, EaCDetails<any>>,
] extends [true] ? {
    [
      K in keyof T as K extends string ? K
        : never
    ]: "Details" extends keyof T[K]
      ? EverythingAsCodeTags<T[K] & $FluentTag<"Methods", "Object">>
      : {};
  }
  : {};
