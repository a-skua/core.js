/**
 * ## Context Type
 */
export type Context<_> = unknown;

/**
 * And
 */
export interface And<T, U = unknown> {
  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Option } from "@askua/core/option";
   *
   * const option = Option.some(1).andThen((v) => Option.some(v + 1));
   * assertEquals(option, Option.some(2));
   * ```
   * @deprecated
   */
  andThen(fn: (v: T) => U): U;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Option } from "@askua/core/option";
   *
   * const option = Option.some(1).and(Option.some(2));
   * assertEquals(option, Option.some(2));
   * ```
   */
  and(value: U): U;
}

/**
 * ## Context Or
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * const option = none<number>().or(() => some(0));
 * assertEquals(option, some(0));
 * ```
 */
export interface Or<T> {
  or<U>(orElse: () => Context<U>): Context<T | U>;
}

/**
 * ## Context Map
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * const a = some(1).map((v) => v + 1);
 * assertEquals(a, some(2));
 *
 * const b = none().map((v) => v + 1);
 * assertEquals(b, none());
 * ```
 */
export interface Map<T> {
  map<U>(fn: (value: T) => U): Context<U>;
}

/**
 * ## Context Filter
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * const a = some(1).filter((n) => n > 0);
 * assertEquals(a, some(1));
 *
 * const b = some(0).filter((n) => n > 0);
 * assertEquals(b, none());
 * ```
 */
export interface Filter<T> {
  /** */
  filter(fn: (value: T) => boolean): Context<T>;
}

/**
 * ## Context Unwrap
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * const a = some(1).unwrap();
 * assertEquals(a, 1);
 *
 * const b = none().unwrap(() => 0);
 * assertEquals(b, 0);
 * ```
 */
export interface Unwrap<T> {
  unwrap<U>(orElse: () => U): T | U;
  unwrap(): T;
}
