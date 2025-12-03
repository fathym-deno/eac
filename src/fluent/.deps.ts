// Fluent dependencies - EXTERNAL ONLY
export type {
  HasTypeCheck,
  IsNativeType,
  IsNotUndefined,
  IsObject,
  IsObjectNotNative,
  IsUndefined,
  RemoveIndexSignatures,
  ValueType,
} from "jsr:@fathym/common@0.2.299/types";

export {
  type $FluentTag,
  type $FluentTagDeepStrip,
  FluentBuilder,
  fluentBuilder,
  type FluentBuilderMethodsHandlers,
  type FluentBuilderRoot,
  type SelectFluentMethods,
} from "jsr:@fathym/runtime@0.0.11/fluent";

export * from "jsr:@fathym/ioc@0.0.25";
