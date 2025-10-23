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
 * Or
 */
export interface Or<T, U = unknown, V = unknown> {
  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Option } from "@askua/core/option";
   *
   * const option = Option.none<number>().orElse(() => Option.some(0));
   * assertEquals(option, Option.some(0));
   * ```
   */
  orElse(fn: (() => U) | ((v: T) => U)): V;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Option } from "@askua/core/option";
   *
   * const option = Option.none<number>().or(Option.some(0));
   * assertEquals(option, Option.some(0));
   * ```
   */
  or(v: U): V;
}

/**
 * Map
 */
export interface Map<T, U = unknown, V = unknown> {
  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Option } from "@askua/core/option";
   *
   * const option = Option.some(1).map((v) => v + 1);
   * assertEquals(option, Option.some(2));
   * ```
   */
  map(fn: (value: T) => U): V;
}

/**
 * Filter
 */
export interface Filter<T, U = unknown> {
  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { some, none } from "@askua/core/option";
   *
   * const option = some(0).filter((n) => n > 0);
   * assertEquals(option, none());
   * ```
   */
  filter(fn: (value: T) => boolean): U;
}

/**
 * Unwrap
 */
export interface Unwrap<T> {
  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Option } from "@askua/core/option";
   *
   * const option = Option.some(1).unwrap();
   * assertEquals(option, 1);
   * ```
   */
  unwrap(): T;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Option } from "@askua/core/option";
   *
   * const option = Option.none<number>().unwrapOr(1);
   * assertEquals(option, 1);
   * ```
   */
  unwrapOr<U>(defaultValue: U): T | U;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Option } from "@askua/core/option";
   *
   * const option = Option.none<number>().unwrapOrElse(() => 1);
   * assertEquals(option, 1);
   * ```
   */
  unwrapOrElse<U>(fn: () => U): T | U;
}
