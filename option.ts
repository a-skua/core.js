/**
 * {@link Option} is Object base type, {@link Some}<T> and {@link None}.
 *
 * ## Why Object base?
 *
 * If you use on Server and Browser, using `JSON.stringify` and `JSON.parse`.
 * So, Object base is easy to use.
 *
 * ```ts
 * const json = '{"some":true,"value":1}';
 *
 * const option: Option<number> = JSON.parse(json);
 * if (option.some) {
 *   console.log(option.value); // 1
 * }
 * ```
 *
 * @example type {@link Option}
 * ```ts
 * import { assert } from "@std/assert";
 * import type { Option } from "@askua/core/option";
 * import { isSome, isNone } from "@askua/core/option";
 *
 * const a: Option<number> = { some: true, value: 1 };
 * assert(isSome(a));
 *
 * const b: Option<number> = { some: false };
 * assert(isNone(b));
 * ```
 *
 * @example type {@link OptionInstance}
 * ```ts
 * import { assert } from "@std/assert";
 * import type { Option, OptionInstance } from "@askua/core/option";
 * import { isSome, isNone, some, none } from "@askua/core/option";
 *
 * const a: OptionInstance<number> = some(1).map((n) => n + 1);
 * const b: Option<number> = a;
 * assert(isSome(a));
 *
 * const c: OptionInstance<number> = none<number>().map((n) => n + 1);
 * const d: Option<number> = c;
 * assert(isNone(c));
 * ```
 *
 * @example Using with {@link OptionInstance} method
 * ```ts
 * const option: OptionInstance<number> = some(Math.random());
 *
 * const value = option
 *   .filter((n) => n >= 0.5)
 *   .map((n) => n.toFixed(2))
 *   .unwrap(() => "0.00");
 *
 * console.log(value);
 * ```
 *
 * @example Using with `Iterable`
 * ```ts
 * const getNumber = () => some(Math.random()).filter((n) => n >= 0.5);
 *
 * const list = [
 *   ...getNumber(),
 *   ...getNumber(),
 *   ...getNumber(),
 * ];
 *
 * console.log(list);
 * ```
 *
 * @example Using with {@link OptionLazyContext}
 * ```ts
 * const getNumber = () => Promise.resolve(some(Math.random()));
 *
 * const option = await Option.lazy(getNumber())
 *   .filter((n) => n >= 0.5)
 *   .map((n) => n.toFixed(2))
 *   .eval();
 *
 * console.log(option.unwrap(() => "0.00"));
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import type { Err, Ok, Result } from "./result.ts";
import type { InferReturnTypeOr, OrFunction, OrPromise } from "./types.ts";

/**
 * type {@link Some} is state of {@link Option} with value.
 *
 * @example type {@link Some}
 * ```ts
 * import { some, type Some } from "@askua/core/option";
 *
 * const a: Some<number> = { some: true, value: 1 };
 * const b: Some<number> = some(1).map((n) => n + 1);
 * ```
 */
export interface Some<T> {
  readonly some: true;
  readonly value: T;
}

/**
 * type {@link Some} with {@link OptionContext}
 *
 * @example type {@link SomeInstance}
 * ```ts
 * const a: SomeInstance<number> = some(1);
 * const b: Some<number> = a;
 * ```
 */
export type SomeInstance<T> = OptionContext<T> & Some<T>;

/**
 * Infer {@link Some}<T> or {@link SomeInstance}<T> from type {@link Option}<T>
 *
 * @example type {@link InferSome}
 * ```ts
 * const a: InferSome<Option<string>, number> = { some: true, value: 1 };
 * const b: Some<number> = a;
 *
 * const c: InferSome<OptionInstance<string>, number> = some(1);
 * const d: SomeInstance<number> = c;
 * ```
 */
export type InferSome<O extends Option<unknown>, T> = O extends
  OptionContext<unknown> ? SomeInstance<T>
  : Some<T>;

/**
 * function {@link some} to {@link SomeInstance}
 *
 * @example function {@link some}
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = some(1).map((n) => n + 1);
 * assertEquals(a, some(2));
 * ```
 */
export function some<T>(value: T): SomeInstance<T> {
  return new _Some(value);
}

/**
 * {@link isSome} is {@link Some}
 *
 * @example function {@link isSome}
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, isSome } from "@askua/core/option";
 *
 * const a = some(1);
 * if (isSome(a)) {
 *   const value = a.unwrap();
 *   assertEquals(value, 1);
 * }
 * ```
 */
export function isSome<T>(
  option: Option<T>,
): option is InferSome<typeof option, T> {
  return option.some;
}

/**
 * type {@link None} is state of {@link Option} without value.
 *
 * @example type {@link None}
 * ```ts
 * import { none, type None } from "@askua/core/option";
 *
 * const a: None = { some: false };
 * const b: None = none();
 * ```
 */
export interface None {
  readonly some: false;
}

/**
 * type {@link None} with {@link OptionContext}
 *
 * @example type {@link NoneInstance}
 * ```ts
 * const a: NoneInstance<number> = none();
 * const b: None = a;
 * ```
 */
export type NoneInstance<T> = OptionContext<T> & None;

/**
 * Infer {@link None} or {@link NoneInstance} from type {@link Option}<T>
 *
 * @example type {@link InferNone}
 * ```ts
 * const a: InferNone<Option<string>, number> = { some: false };
 * const b: None = a;
 *
 * const c: InferNone<OptionInstance<string>, number> = none();
 * const d: NoneInstance<number> = c;
 * ```
 */
export type InferNone<O extends Option<unknown>, T> = O extends
  OptionContext<unknown> ? NoneInstance<T>
  : None;

/**
 * function {@link none} to {@link NoneInstance}
 *
 * @example function {@link none}
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { OptionInstance } from "@askua/core/option";
 * import { none } from "@askua/core/option";
 *
 * const a = none<string>().map((n) => n + 1);
 * assertEquals(a, none());
 * ```
 */
export function none<T>(): InferNone<OptionInstance<T>, T> {
  return new _None();
}

/**
 * {@link isNone} is {@link None}
 *
 * @example function {@link isNone}
 * ```ts
 * import { assert } from "@std/assert";
 * import { none, isNone } from "@askua/core/option";
 *
 * const a = none<number>();
 * assert(isNone(a));
 * ```
 */
export function isNone<T>(
  option: Option<T>,
): option is InferNone<typeof option, T> {
  return !option.some;
}

/**
 * {@link Option} is Object base type, {@link Some} or {@link None}.
 *
 * @example type {@link Option}
 * ```ts
 * import type { Option } from "@askua/core/option";
 *
 * const a: Option<number> = { some: true, value: 1 };
 * const b: Option<number> = { some: false };
 * ```
 *
 * @example type {@link Some}
 * ```ts
 * import type { Some } from "@askua/core/option";
 *
 * const a: Some<number> = { some: true, value: 1 };
 *
 * if (a.some) {
 *   console.log(a.value);
 * }
 * ```
 *
 * @example type {@link SomeInstance}
 * ```ts
 * import { some, type SomeInstance } from "@askua/core/option";
 *
 * const a: SomeInstance<number> = some(1);
 *
 * a.tee((value) => console.log(value));
 * ```
 *
 * @example function {@link isSome}
 * ```ts
 * import { isSome, type Option } from "@askua/core/option";
 *
 * const a: Option<number> = { some: true, value: 1 };
 *
 * if (isSome(a)) {
 *  const value: number = a.value;
 * }
 * ```
 *
 * @example type {@link None}
 * ```ts
 * import type { None } from "@askua/core/option";
 *
 * const a: None = { some: false };
 * ```
 *
 * @example type {@link NoneInstance}
 * ```ts
 * import { none, type NoneInstance } from "@askua/core/option";
 *
 * const a: NoneInstance<number> = none();
 *
 * a.tee((value) => console.log(value)); // won't be called
 * ```
 *
 * @example function {@link isNone}
 * ```ts
 * import { isNone, type Option } from "@askua/core/option";
 *
 * const a: Option<number> = { some: false };
 *
 * if (isNone(a)) {
 *   // a is None
 * }
 * ```
 *
 * @example {@link Option} to {@link OptionInstance}
 * ```ts
 * import type { OptionInstance } from "@askua/core/option";
 * import { Option } from "@askua/core/option";
 *
 * const a: Option<number> = { some: true, value: 1 };
 * const b: OptionInstance<number> = Option(a);
 * ```
 *
 * @example type {@link OptionInstance}
 * ```ts
 * import type { OptionInstance } from "@askua/core/option";
 * import { some } from "@askua/core/option";
 *
 * const a: OptionInstance<number> = some(Math.random());
 * const b: OptionInstance<number> = a.filter((n) => n >= 0.5);
 * const c: OptionInstance<string> = b.map((n) => n.toFixed(2));
 * const d: string = c.unwrap(() => "0.00");
 * ```
 *
 * @example {@link OptionStatic} methods
 * ```ts
 * import { Option } from "@askua/core/option";
 *
 * const a = Option.and(
 *   some(1),
 *   () => some(2),
 * ).map(([x, y]) => x + y);
 * console.log(a); // Some(3)
 * ```
 */
export type Option<T> = Some<T> | None;
export const Option: OptionToInstance & OptionStatic = Object.assign(
  toInstance,
  {
    some,
    none,
    and: (...options: never[]) => and(options),
    or: (...options: never[]) => or(options),
    lazy,
    fromResult,
    fromNullable,
  } as never,
);

/**
 * Infer {@link Option}<T> or {@link OptionInstance}<T> from type {@link Option}<T>
 *
 * @example type {@link InferOption}
 * ```ts
 * const a: InferOption<Option<string>, number> = { some: true, value: 1 };
 * const b: Option<number> = a;
 *
 * const c: InferOption<OptionInstance<string>, number> = some(1);
 * const d: OptionInstance<number> = c;
 * ```
 */
export type InferOption<O extends Option<unknown>, T> = O extends
  OptionInstance<unknown> ? OptionInstance<T> : Option<T>;

/**
 * {@link OptionInstance} is Object base type {@link Option} with Context Methods type {@link OptionContext}.
 *
 * @example type {@link OptionInstance}
 * ```ts
 * import type { Option, OptionInstance } from "@askua/core/option";
 * import { some, none } from "@askua/core/option";
 *
 * const a: OptionInstance<number> = none();
 * const b: Option<number> = a;
 *
 * const c: OptionInstance<number> = some(1);
 * const d: Option<number> = c;
 * ```
 *
 * @example {@link OptionContext} methods
 * ```ts
 * import { some } from "@askua/core/option";
 *
 * const a = some(Math.random())
 *   .filter((n) => n >= 0.5)
 *   .map((n) => Math.floor(n * 100))
 *   .unwrap(() => 0);
 * console.log(a);
 * ```
 */
export type OptionInstance<T> = Option<T> & OptionContext<T>;

/**
 * WIP
 *
 * @example
 * ```ts
 * JSON.stringify(some(1)); // '{"value":1,"some":true}'
 * JSON.stringify(none());  // '{"some":false}'
 * JSON.stringify([1]);     // '[1]'
 * JSON.stringify(0);       // '0'
 * ```
 */
export type SerializedOption<T> = [T] | 0;

/**
 * {@link Option} to {@link OptionInstance}
 *
 * @example {@link Some} to {@link SomeInstance}<T>
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const a: SomeInstance<number> = Option({ some: true, value: 1 });
 * assertEquals(a, some(1));
 *
 * const b: SomeInstance<number> = Option(some(1));
 * assertEquals(b, some(1));
 * ```
 *
 * @example {@link None} to {@link NoneInstance}<T>
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const a: NoneInstance<number> = Option({ some: false });
 * assertEquals(a, none());
 *
 * const b: NoneInstance<number> = Option(none());
 * assertEquals(b, none());
 * ```
 *
 * @example {@link Option} to {@link OptionInstance}<T>
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const a: OptionInstance<number> = Option({ some: true, value: 1 } as Option<number>);
 * assertEquals(a, some(1));
 *
 * const b: OptionInstance<number> = Option(none() as Option<number>);
 * assertEquals(b, none());
 * ```
 */
export type OptionToInstance = {
  <T>(option: Some<T>): SomeInstance<T>;
  <T>(option: None): NoneInstance<T>;
  <T>(option: Option<T>): OptionInstance<T>;
};

type InferT<O extends Option<unknown>, U = never> = O extends Some<infer T>
  ? T | U
  : (O extends None ? U
    : (O extends Option<infer T> ? T | U : unknown));

type AndT<O extends Option<unknown>> = InferT<O>;

type OrT<O extends Option<unknown>, T> = InferT<O, T>;

/**
 * Operation Methods for {@link Option}
 *
 * @example {@link OptionContext.and} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = some(1).and((n) => some(n + 1));
 * assertEquals(a, some(2));
 * ```
 *
 * @example {@link OptionContext.or} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * const a = none().or(() => some(2));
 * assertEquals(a, some(2));
 * ```
 *
 * @example {@link OptionContext.map} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = some(1).map((n) => n + 1);
 * assertEquals(a, some(2));
 * ```
 *
 * @example {@link OptionContext.filter} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = some(1).filter((n) => n > 0);
 * assertEquals(a, some(1));
 * ```
 *
 * @example {@link OptionContext.tee} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = some(1).tee((n) => console.log(n));
 * assertEquals(a, some(1));
 * ```
 *
 * @example {@link OptionContext.unwrap} method
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
 *
 * @example {@link OptionContext.lazy} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = await some(Promise.resolve(1)).lazy()
 *   .map((n) => Promise.resolve(n + 1))
 *   .eval();
 * assertEquals(a, some(2));
 * ```
 *
 * @example {@link OptionContext.toString} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = some(1);
 * assertEquals(a.toString(), "Some(1)");
 * ```
 *
 * @example `Iterable`
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * const list = [
 * ...some(1),
 * ...none<number>(),
 * ...some(2),
 * ...some(3),
 * ];
 * assertEquals(list, [1, 2, 3]);
 * ```
 */
export interface OptionContext<T>
  extends
    c.Context<T>,
    c.And<T>,
    c.Or<T>,
    c.Map<T>,
    c.Filter<T>,
    c.Tee<T>,
    c.Unwrap<T>,
    Iterable<T>,
    c.Lazy<T> {
  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1).and((n) => some(n + 1));
   * assertEquals(a, some(2));
   *
   * const b = none<number>().and((n) => some(n + 1));
   * assertEquals(b, none());
   * ```
   */
  and<U, O extends Option<U> = OptionInstance<U>>(
    fn: (value: T) => O,
  ): InferOption<O, AndT<O>>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1).or(() => some(2));
   * assertEquals(a, some(1));
   *
   * const b = none().or(() => some(2));
   * assertEquals(b, some(2));
   * ```
   */
  or<U, O extends Option<U> = OptionInstance<U>>(
    fn: () => O,
  ): InferOption<O, OrT<O, T>>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1).map((n) => n + 1);
   * assertEquals(a, some(2));
   *
   * const b = none<number>().map((n) => n + 1);
   * assertEquals(b, none());
   * ```
   */
  map<U>(fn: (value: T) => U): OptionInstance<U>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1).filter((n) => n > 0);
   * assertEquals(a, some(1));
   *
   * const b = some(0).filter((n) => n > 0);
   * assertEquals(b, none());
   *
   * const c: Option<1> = some(0).filter((n): n is 1 => n === 1);
   * assertEquals(c, none());
   * ```
   */
  filter<U extends T>(fn: (value: T) => value is U): OptionInstance<U>;
  filter(fn: (value: T) => boolean): OptionInstance<T>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * let count = 0;
   * const a = some(1).tee((n) => { count += n; });
   * assertEquals(a, some(1));
   * assertEquals(count, 1);
   * ```
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * let count = 0;
   * const a = none<number>().tee((n) => { count += n; });
   * assertEquals(a, none());
   * assertEquals(count, 0);
   * ```
   */
  tee(fn: (value: T) => void): OptionInstance<T>;

  /**
   * @example
   * ```ts
   * import { assertEquals, assertThrows } from "@std/assert";
   *
   * const a = some(1);
   * assertEquals(a.unwrap(), 1);
   *
   * const b = none();
   * assertEquals(b.unwrap(() => 0), 0);
   *
   * const c = none();
   * assertThrows(() => c.unwrap());
   * ```
   *
   * @throws {Error} when called on None without argument
   */
  unwrap<U>(fn: () => U): T | U;
  unwrap(): T;

  /**
   * @example to {@link OptionLazyContext}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await some(Promise.resolve(1)).lazy()
   *   .map((n) => n + 1)
   *   .eval();
   * assertEquals(a, some(2));
   *
   * const b = await some(1)
   *   .lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(b, some(2));
   * ```
   */
  lazy(): T extends Promise<infer T> ? OptionLazyContext<T, OptionInstance<T>>
    : OptionLazyContext<T, OptionInstance<T>>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1);
   * assertEquals(a.toString(), "Some(1)");
   *
   * const b = none();
   * assertEquals(b.toString(), "None");
   * ```
   */
  toString(): string;
}

type InferOptionLazy<Eval extends Option<unknown>, T> = OptionLazyContext<
  T,
  InferOption<Eval, T>
>;

/**
 * Lazy Operation Methods for {@link Option}
 *
 * @example {@link OptionLazyContext.and} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = await some(Promise.resolve(1)).lazy()
 *   .and((n) => Promise.resolve(some(n + 1)))
 *   .eval();
 * assertEquals(a, some(2));
 * ```
 *
 * @example {@link OptionLazyContext.or} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * const a = await none().lazy()
 *   .or(() => Promise.resolve(some(2)))
 *   .eval();
 * assertEquals(a, some(2));
 * ```
 *
 * @example {@link OptionLazyContext.map} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = await some(Promise.resolve(1)).lazy()
 *   .map((n) => Promise.resolve(n + 1))
 *   .eval();
 * assertEquals(a, some(2));
 * ```
 *
 * @example {@link OptionLazyContext.filter} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = await some(Promise.resolve(1)).lazy()
 *   .filter((n) => Promise.resolve(n > 0))
 *   .eval();
 * assertEquals(a, some(1));
 * ```
 *
 * @example {@link OptionLazyContext.tee} method
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some } from "@askua/core/option";
 *
 * const a = await some(Promise.resolve(1)).lazy()
 *   .tee((n) => console.log(n))
 *   .eval();
 * assertEquals(a, some(1));
 * ```
 */
export interface OptionLazyContext<
  T,
  Eval extends Option<T>,
> extends c.LazyContext<T>, c.And<T>, c.Or<T>, c.Map<T>, c.Filter<T>, c.Tee<T> {
  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await some(Promise.resolve(1)).lazy()
   *   .and((n) => Promise.resolve(some(n + 1)))
   *   .eval();
   * assertEquals(a, some(2));
   *
   * const b = await Option.lazy(Promise.resolve(none() as Option<number>))
   *   .and((n) => Promise.resolve(some(n + 1)))
   *   .eval();
   * assertEquals(b, none());
   * ```
   */
  and<
    U,
    O extends Option<U> = OptionInstance<U>,
  >(andThen: (value: T) => OrPromise<O>): InferOptionLazy<O, AndT<O>>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await some(Promise.resolve(1)).lazy()
   *   .or(() => Promise.resolve(some(2)))
   *   .eval();
   * assertEquals(a, some(1));
   *
   * const b = await none().lazy()
   *   .or(() => Promise.resolve(some(2)))
   *   .eval();
   * assertEquals(b, some(2));
   * ```
   */
  or<
    U,
    O extends Option<U> = OptionInstance<U>,
  >(orElse: () => OrPromise<O>): InferOptionLazy<O, OrT<O, T>>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await some(1).lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(a, some(2));
   *
   * const n: OptionInstance<number> = none();
   * const b = await n.lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(b, none());
   * ```
   */
  map<U>(fn: (value: T) => OrPromise<U>): InferOptionLazy<Eval, U>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await some(Promise.resolve(1)).lazy()
   *   .filter((n) => Promise.resolve(n > 0))
   *   .eval();
   * assertEquals(a, some(1));
   *
   * const b = await some(Promise.resolve(0)).lazy()
   *   .filter((n) => Promise.resolve(n > 0))
   *   .eval();
   * assertEquals(b, none());
   *
   * const c = await none<number>().lazy()
   *   .filter((n) => Promise.resolve(n > 0))
   *   .eval();
   * assertEquals(c, none());
   * ```
   */
  filter<U extends T>(fn: (value: T) => value is U): InferOptionLazy<Eval, U>;
  filter(fn: (value: T) => OrPromise<boolean>): InferOptionLazy<Eval, T>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * let count = 0;
   * const a = await some(Promise.resolve(1)).lazy()
   *   .tee((n) => { count += n; })
   *   .eval();
   * assertEquals(a, some(1));
   * assertEquals(count, 1);
   * ```
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * let count = 0;
   * const a = await none<number>().lazy()
   *   .tee((n) => { count += n; })
   *   .eval();
   * assertEquals(a, none());
   * assertEquals(count, 0);
   * ```
   */
  tee(callback: (value: T) => OrPromise<void>): InferOptionLazy<Eval, T>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const option = await some(1).lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(option, some(2));
   * ```
   */
  eval(): Promise<Eval>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1).lazy();
   * assertEquals(
   *   a.toString(),
   *   "Lazy<Some(1)>",
   * );
   *
   * const n: OptionInstance<number> = none();
   * const b = n.lazy().map((n) => n * 100).or(() => some(0));
   * assertEquals(
   *   b.toString(),
   *   "Lazy<None.map((n)=>n * 100).or(()=>some(0))>",
   * );
   * ```
   */
  toString(): string;
}

/**
 * Static Methods for {@link Option}
 *
 * @example {@link OptionStatic.some}
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, Option } from "@askua/core/option";
 *
 * const a = Option.some(1);
 * assertEquals(a, some(1));
 * ```
 *
 * @example {@link OptionStatic.none}
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { none, Option } from "@askua/core/option";
 *
 * const a = Option.none();
 * assertEquals(a, none());
 * ```
 *
 * @example {@link OptionStatic.and}
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none, Option } from "@askua/core/option";
 *
 * const a = Option.and(
 *   some(1),
 *   () => some(2),
 * ).map(([x, y]) => x + y);
 * assertEquals(a, some(3));
 * ```
 *
 * @example {@link OptionStatic.or}
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none, Option } from "@askua/core/option";
 *
 * const a = Option.or(
 *   none(),
 *   () => some(2),
 * ).map((n) => n + 1);
 * assertEquals(a, some(3));
 * ```
 *
 * @example {@link OptionStatic.lazy} to {@link OptionLazyContext}
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, Option } from "@askua/core/option";
 *
 * const option = await Option.lazy(Promise.resolve(some(1)))
 *   .map((n) => Promise.resolve(n + 1))
 *   .eval();
 * assertEquals(option, some(2));
 * ```
 *
 * @example {@link OptionStatic.fromResult}
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none, Option } from "@askua/core/option";
 * import { ok } from "@askua/core/result";
 *
 * const a = Option.fromResult(ok(1));
 * assertEquals(a, some(1));
 * ```
 *
 * @example {@link OptionStatic.fromNullable}
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none, Option } from "@askua/core/option";
 *
 * const a = Option.fromNullable(1);
 * assertEquals(a, some(1));
 *
 * const b = Option.fromNullable(null);
 * assertEquals(b, none());
 * ```
 */
export type OptionStatic = {
  /**
   * @example {@link OptionStatic.some}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(Option.some(1), some(1));
   * ```
   */
  some: typeof some;

  /**
   * @example {@link OptionStatic.none}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(Option.none(), none());
   * ```
   */
  none: typeof none;

  /**
   * @example sync {@link OptionStatic.and}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = Option.and(
   *   some(1),
   *   () => some(2),
   *   some(3),
   *   () => some(4),
   * );
   * assertEquals(a, some([1, 2, 3, 4]));
   *
   * const b = Option.and(
   *   some(1),
   *   () => some(2),
   *   some(3),
   *   () => none(),
   * );
   * assertEquals(b, none());
   * ```
   *
   * @example async {@link OptionStatic.and}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await Option.and(
   *   some(1),
   *   () => some(2),
   *   Promise.resolve(some(3)),
   *   () => Promise.resolve(some(4)),
   * );
   * assertEquals(a, some([1, 2, 3, 4]));
   *
   * const b = await Option.and(
   *   some(1),
   *   () => some(2),
   *   Promise.resolve(some(3)),
   *   () => Promise.resolve(none()),
   * );
   * assertEquals(b, none());
   * ```
   */
  and<
    T extends {
      [K in keyof Args]: InferReturnTypeOr<Args[K]> extends infer O
        ? (Awaited<O> extends Option<infer T> ? T : unknown)
        : unknown;
    },
    Fn extends OrFunction<OrPromise<Option<T[number]>>>,
    Args extends [Fn, ...Fn[]],
  >(
    ...args: Args
  ): InferReturnTypeOr<Args[number]> extends infer O
    ? (Extract<O, Promise<unknown>> extends never
      ? (O extends Option<unknown> ? InferOption<O, T> : unknown)
      : Promise<
        (Awaited<O> extends Option<unknown> ? InferOption<Awaited<O>, T>
          : unknown)
      >)
    : unknown;

  /**
   * @example sync {@link OptionStatic.or}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = Option.or(
   *   some(1),
   *   () => some(2),
   *   some(3),
   *   () => some(4),
   * );
   * assertEquals(a, some(1));
   *
   * const b = Option.or(
   *   none(),
   *   () => none(),
   *   none(),
   *   () => some(4),
   * );
   * assertEquals(b, some(4));
   * ```
   *
   * @example async {@link OptionStatic.or}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await Option.or(
   *   some(1),
   *   () => some(2),
   *   Promise.resolve(some(3)),
   *   () => Promise.resolve(some(4)),
   * );
   * assertEquals(a, some(1));
   *
   * const b = await Option.or(
   *   none(),
   *   () => none(),
   *   Promise.resolve(none()),
   *   () => Promise.resolve(some(4)),
   * );
   * assertEquals(b, some(4));
   * ```
   */
  or<
    T extends {
      [K in keyof Args]: InferReturnTypeOr<Args[K]> extends infer O
        ? (Awaited<O> extends None ? never
          : (Awaited<O> extends Option<infer T> ? T : unknown))
        : unknown;
    }[number],
    Fn extends OrFunction<OrPromise<Option<T>>>,
    Args extends [Fn, ...Fn[]],
  >(
    ...args: Args
  ): InferReturnTypeOr<Args[number]> extends infer O
    ? (Extract<O, Promise<unknown>> extends never
      ? (O extends Option<unknown> ? InferOption<O, T> : unknown)
      : Promise<
        (Awaited<O> extends Option<unknown> ? InferOption<Awaited<O>, T>
          : unknown)
      >)
    : unknown;

  /**
   * @example {@link OptionStatic.lazy} to {@link OptionLazyContext}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await Option.lazy(Promise.resolve(some(1)))
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(a, some(2));
   * ```
   */
  lazy<
    T,
    Fn extends OrFunction<OrPromise<Option<T>>> = OrFunction<
      OrPromise<OptionInstance<T>>
    >,
  >(
    option: Fn,
  ): InferReturnTypeOr<Fn> extends infer O
    ? (Awaited<O> extends Option<infer T>
      ? OptionLazyContext<T, InferOption<Awaited<O>, T>>
      : unknown)
    : unknown;

  /**
   * @throws {Error} when result is Err and no orElse function provided
   *
   * @example from {@link Ok}
   * ```ts
   * import { assertEquals, assertThrows } from "@std/assert";
   * import { ok } from "@askua/core/result";
   *
   * const a = Option.fromResult(ok(1));
   * assertEquals(a, some(1));
   * ```
   *
   * @example from {@link Err} with `orElse`
   * ```ts
   * import { assertEquals, assertThrows } from "@std/assert";
   * import { err } from "@askua/core/result";
   *
   * const a = Option.fromResult(err(new Error("Error")), (e) => {
   *   assertEquals(e, new Error("Error"));
   *   return none();
   * });
   * assertEquals(a, none());
   * ```
   *
   * @example from {@link Err} without `orElse`
   * ```ts
   * import { assertEquals, assertThrows } from "@std/assert";
   * import { err } from "@askua/core/result";
   *
   * const result = err(new Error("Error"));
   * assertThrows(() => Option.fromResult(result));
   * ```
   */
  fromResult<T>(result: Ok<T>): SomeInstance<T>;
  fromResult<T, E, O extends Option<T> = OptionInstance<T>>(
    result: Err<E>,
    orElse: (e: E) => O,
  ): ReturnType<typeof orElse>;
  fromResult<E>(result: Err<E>): void;
  fromResult<T, E, O extends Option<T> = OptionInstance<T>>(
    result: Result<T, E>,
    orElse: (e: E) => O,
  ): OptionInstance<T> | ReturnType<typeof orElse>;
  fromResult<T, E>(result: Result<T, E>): OptionInstance<T> | void;

  /**
   * @example from non-nullable value
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = Option.fromNullable(1);
   * assertEquals(a, some(1));
   * ```
   *
   * @example from `null`
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = Option.fromNullable(null);
   * assertEquals(a, none());
   * ```
   *
   * @example from `undefined`
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const c = Option.fromNullable(undefined);
   * assertEquals(c, none());
   * ```
   */
  fromNullable<T>(value: NonNullable<T>): SomeInstance<T>;
  fromNullable<T>(value: null | undefined): NoneInstance<T>;
  fromNullable<T>(value: T | null | undefined): OptionInstance<T>;
};

/**
 * impl {@link SomeInstance}
 */
class _Some<T> implements SomeInstance<T> {
  readonly some = true;
  constructor(readonly value: T) {}

  and<U>(andThen: (value: T) => U) {
    return andThen(this.value) as never;
  }

  or() {
    return this as never;
  }

  map<U, V>(fn: (v: T) => U): V {
    return some(fn(this.value)) as V;
  }

  filter(fn: (v: T) => boolean) {
    if (fn(this.value)) return this;
    return none() as never;
  }

  tee(fn: (value: T) => void) {
    fn(this.value);
    return this as never;
  }

  unwrap(): T {
    return this.value;
  }

  lazy() {
    return new _Lazy(this) as never;
  }

  toString(): string {
    return `Some(${this.value})`;
  }

  [Symbol.iterator](): Iterator<T> {
    let count = 0;
    const value = this.value;
    return Object.assign(this, {
      next(): IteratorResult<T> {
        return { done: 0 < count++, value };
      },
    });
  }
}

/**
 * impl {@link NoneInstance}
 */
class _None<T = never> implements None, OptionContext<T> {
  readonly some = false;
  constructor() {}

  and() {
    return this as never;
  }

  or<U>(orElse: () => U) {
    return orElse() as never;
  }

  map<U>(): U {
    return this as never;
  }

  filter() {
    return this as never;
  }

  tee() {
    return this;
  }

  unwrap<U>(orElse?: () => U) {
    if (orElse) return orElse() as never;
    throw new Error("None");
  }

  lazy() {
    return new _Lazy(this) as never;
  }

  toString(): string {
    return "None";
  }

  [Symbol.iterator](): Iterator<T> {
    return Object.assign(this, {
      next(): IteratorResult<T> {
        return { done: true, value: undefined };
      },
    });
  }
}

/**
 * {@link OptionLazyContext} Operation
 */
type Op<T, U> =
  | { and: (value: T) => OrPromise<Option<U>> }
  | { or: () => OrPromise<Option<U>> }
  | { map: (value: T) => OrPromise<U> }
  | { filter: (value: T) => OrPromise<boolean> }
  | { tee: (value: T) => OrPromise<void> };

/**
 * impl {@link OptionLazyContext}
 */
class _Lazy<T, Eval extends Option<T>> implements OptionLazyContext<T, Eval> {
  readonly op: Op<T, never>[] = [];

  constructor(
    private readonly first: OrFunction<OrPromise<Eval>>,
  ) {}

  and(and: unknown) {
    this.op.push({ and } as typeof this.op[number]);
    return this as never;
  }

  or(or: unknown) {
    this.op.push({ or } as typeof this.op[number]);
    return this as never;
  }

  map(map: unknown) {
    this.op.push({ map } as typeof this.op[number]);
    return this as never;
  }

  filter(filter: unknown) {
    this.op.push({ filter } as typeof this.op[number]);
    return this as never;
  }

  tee(tee: unknown) {
    this.op.push({ tee } as typeof this.op[number]);
    return this as never;
  }

  async eval(): Promise<Eval> {
    const p = typeof this.first === "function" ? this.first() : this.first;
    let option: Option<T> = p instanceof Promise ? await p : p;
    if (option.some && option.value instanceof Promise) {
      option = some(await option.value);
    }

    for (let i = 0; i < this.op.length; i++) {
      const op = this.op[i];

      if ("and" in op && option.some) {
        const p = op.and(option.value);
        option = p instanceof Promise ? await p : p;
        continue;
      }

      if ("or" in op && !option.some) {
        const p = op.or();
        option = p instanceof Promise ? await p : p;
        continue;
      }

      if ("map" in op && option.some) {
        const p = op.map(option.value);
        option = some(p instanceof Promise ? await p : p);
        continue;
      }

      if ("filter" in op && option.some) {
        const p = op.filter(option.value);
        const result = p instanceof Promise ? await p : p;
        if (!result) option = none();
        continue;
      }

      if ("tee" in op && option.some) {
        const p = op.tee(option.value);
        if (p instanceof Promise) await p;
        continue;
      }
    }
    return option as Eval;
  }

  toString(): string {
    if (this.op.length === 0) {
      return `Lazy<${this.first}>`;
    }

    const op = this.op.map((op) =>
      Object.entries(op).map(([fn, arg]) => `${fn}(${arg})`)
    ).flat().join(".");
    return `Lazy<${this.first}.${op}>`;
  }
}

/**
 * impl {@link OptionToInstance}
 */
function toInstance<T>(option: Option<T>): OptionInstance<T> {
  return (option.some ? some(option.value) : none() as never);
}

/**
 * impl {@link OptionStatic.and}
 */
function and<T>(
  options: OrFunction<OrPromise<Option<T>>>[],
  i: number = 0,
  values: T[] = new Array(options.length),
): OrPromise<Option<T[]>> {
  for (; i < options.length; i++) {
    const fn = options[i];
    const option = typeof fn === "function" ? fn() : fn;

    if (option instanceof Promise) {
      return option.then((option) => {
        if (!option.some) {
          return option;
        }

        values[i] = option.value;
        return and(options, i + 1, values);
      });
    }

    if (!option.some) {
      return option;
    }
    values[i] = option.value;
  }

  return some(values);
}

/**
 * impl {@link OptionStatic.or}
 */
function or<T>(
  options: OrFunction<OrPromise<Option<T>>>[],
  last?: OrPromise<Option<T>>,
): OrPromise<Option<T>> {
  for (let i = 0; i < options.length; i++) {
    const fn = options[i];
    last = typeof fn === "function" ? fn() : fn;

    if (last instanceof Promise) {
      return last.then((last) => {
        if (last.some) return last;

        return or(options.slice(i + 1), last);
      });
    }

    if (last.some) return last;
  }

  return last!;
}

/**
 * impl {@link OptionStatic.lazy}
 */
function lazy<T>(
  option: OrFunction<OrPromise<Option<T>>>,
): OptionLazyContext<T, Option<T>> {
  return new _Lazy(option);
}

/**
 * impl {@link OptionStatic.fromResult}
 */
function fromResult<T, E>(
  result: Result<T, E>,
  orElse?: (e: E) => OptionInstance<T>,
): OptionInstance<T> {
  if (result.ok) return some(result.value);
  if (orElse) return orElse(result.error);
  throw new Error(
    "Option.fromResult: no value and no orElse function provided",
    {
      cause: result.error,
    },
  );
}

/**
 * impl {@link OptionStatic.fromNullable}
 */
function fromNullable<T>(value: T | null | undefined): OptionInstance<T> {
  if (value === null || value === undefined) return none<T>();
  return some(value);
}
