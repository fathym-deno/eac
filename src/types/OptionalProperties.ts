import { RemoveIndexSignatures } from "./.deps.ts";
import { IsRequiredProperty } from "./IsRequiredProperty.ts";

export type OptionalProperties<T> = {
  [
    K in keyof RemoveIndexSignatures<T> as IsRequiredProperty<
      RemoveIndexSignatures<T>,
      K
    > extends false ? K
      : never
  ]: K extends keyof T ? NonNullable<T[K]> : never;
};
