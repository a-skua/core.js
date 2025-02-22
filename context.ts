/** And */
export interface And<T, U = unknown> {
  /** andThen */
  andThen(fn: (v: T) => U): U;

  /** and */
  and(value: U): U;
}

/** Or */
export interface Or<T, U = unknown, V = unknown> {
  /** orElse */
  orElse(fn: (v: T) => U): V;

  /** or */
  or(v: U): V;
}

/** Map */
export interface Map<T, U = unknown, V = unknown> {
  /** map */
  map(fn: (value: T) => U): V;
}

/** Unwrap */
export interface Unwrap<T> {
  /** unwrap */
  unwrap(): T;

  /** unwrapOr */
  unwrapOr<U>(defaultValue: U): T | U;

  /** unwrapOrElse */
  unwrapOrElse<U>(fn: () => U): T | U;
}
