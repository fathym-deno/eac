import { IsNotUndefined, IsObject, ValueType } from "./.deps.ts";
import { HasDetailsProperty } from "./HasDetailsProperty.ts";

export type IsRequiredProperty<
  T,
  K extends keyof T,
> = HasDetailsProperty<T> extends true ? true
  : IsObject<T[K]> extends true
    ? HasDetailsProperty<ValueType<T[K]>> extends true ? true
    : IsNotUndefined<T[K]>
  : IsNotUndefined<T[K]>;
