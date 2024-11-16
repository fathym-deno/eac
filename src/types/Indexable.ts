export type Indexable<T> =
  & T
  & {
    [K in keyof T]?: T[K];
  };
