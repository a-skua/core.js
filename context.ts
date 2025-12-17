/**
 * ## Context Type
 */
export type Context<_> = object;

export interface LazyContext<T> extends Context<T> {
  eval(): Promise<Context<T>>;
}

/**
 * ## Context And
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none, type OptionInstance } from "@askua/core/option";
 *
 * const a = some(1).and((n) => some(n + 1));
 * assertEquals(a, some(2));
 *
 * const n: OptionInstance<number> = none();
 * const b = n.and((n) => some(n + 1));
 * assertEquals(b, none());
 * ```
 */
export interface And<T> {
  and<U>(andThen: (value: T) => Context<U>): Context<U>;
}

/**
 * ## Context Or
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none, type OptionInstance } from "@askua/core/option";
 *
 * const n: OptionInstance<number> = none();
 * const option = n.or(() => some(0));
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
 * import { some, none, type OptionInstance } from "@askua/core/option";
 *
 * const a = some(1).map((v) => v + 1);
 * assertEquals(a, some(2));
 *
 * const n: OptionInstance<number> = none();
 * const b = n.map((v) => v + 1);
 * assertEquals(b, none());
 * ```
 */
export interface Map<T> {
  map<U>(then: (value: T) => U): Context<U>;
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
  filter(then: (value: T) => boolean): Context<T>;
}

/**
 * ## Context Unwrap
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none, type OptionInstance } from "@askua/core/option";
 *
 * const a = some(1).unwrap();
 * assertEquals(a, 1);
 *
 * const n: OptionInstance<number> = none();
 * const b = n.unwrap(() => 0);
 * assertEquals(b, 0);
 * ```
 */
export interface Unwrap<T> {
  unwrap<U>(orElse: () => U): T | U;
  unwrap(): T;
}

/**
 * ## Context Lazy
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * const a = await some(1)
 *   .lazy()
 *   .map((n) => Promise.resolve(n + 1))
 *   .eval();
 *
 *  assertEquals(a, some(2));
 *  ```
 */
export interface Lazy<T> {
  lazy(): LazyContext<T>;
}
