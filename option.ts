/**
 * Optional value type represented as plain objects for JSON serialization compatibility.
 *
 * This module provides {@link Option}<T> = {@link Some}<T> | {@link None},
 * and {@link OptionInstance}<T> with chainable methods.
 *
 * ## Why Object-based?
 *
 * Object-based representation allows seamless JSON serialization between server and browser:
 *
 * ```ts
 * const json = '{"some":true,"value":1}';
 * const option: Option<number> = JSON.parse(json);
 * if (option.some) {
 *   console.log(option.value); // 1
 * }
 * ```
 *
 * @example Basic usage
 * ```ts
 * import { some } from "@askua/core/option";
 *
 * const value = some(Math.random())
 *   .filter((n) => n >= 0.5)
 *   .map((n) => n.toFixed(2))
 *   .unwrap(() => "0.00");
 * ```
 *
 * @example Iterable spread
 * ```ts
 * import { some, none } from "@askua/core/option";
 *
 * const list = [...some(1), ...none(), ...some(2)];
 * // [1, 2]
 * ```
 *
 * @example Async operations with lazy
 * ```ts
 * import { Option, some } from "@askua/core/option";
 *
 * const option = await Option.lazy(Promise.resolve(some(1)))
 *   .map((n) => n + 1)
 *   .eval();
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import type { Err, Ok, Result } from "./result.ts";
import type {
  InferReturnTypeOr,
  NonEmptyArray,
  OrFunction,
  OrPromise,
} from "./types.ts";

/**
 * Represents an {@link Option} that contains a value.
 *
 * @example
 * ```ts
 * import { some, type Some } from "@askua/core/option";
 *
 * const a: Some<number> = { some: true, value: 1 };
 * const b: Some<number> = some(1);
 * ```
 */
export interface Some<T> {
  readonly some: true;
  readonly value: T;
}
/**
 * {@link Some} with {@link OptionContext} methods.
 *
 * @example
 * ```ts
 * import { some, type SomeInstance } from "@askua/core/option";
 *
 * const a: SomeInstance<number> = some(1);
 * a.map((n) => n + 1);
 * ```
 */
export type SomeInstance<T> = OptionContext<T> & Some<T>;

/**
 * Infers {@link Some} or {@link SomeInstance} based on the input {@link Option} type.
 *
 * @example
 * ```ts
 * import type { Option, OptionInstance, InferSome } from "@askua/core/option";
 *
 * type A = InferSome<Option<string>, number>;         // Some<number>
 * type B = InferSome<OptionInstance<string>, number>; // SomeInstance<number>
 * ```
 */
export type InferSome<O extends Option<unknown>, T> = O extends
  OptionContext<unknown> ? SomeInstance<T> : Some<T>;

/**
 * Creates a {@link SomeInstance} containing the given value.
 *
 * @example
 * ```ts
 * import { some } from "@askua/core/option";
 *
 * const a = some(1);
 * const b = some(1).map((n) => n + 1); // some(2)
 * ```
 */
export function some<T>(value: T): SomeInstance<T> {
  return new _Some(value);
}

/**
 * Type guard that checks if an {@link Option} is {@link Some}.
 *
 * @example
 * ```ts
 * import { some, isSome, type Option } from "@askua/core/option";
 *
 * const a: Option<number> = some(1);
 * if (isSome(a)) {
 *   console.log(a.value); // number
 * }
 * ```
 */
export function isSome<T>(
  option: Option<T>,
): option is InferSome<typeof option, T> {
  return option.some;
}

/**
 * Represents an {@link Option} that contains no value.
 *
 * @example
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
 * {@link None} with {@link OptionContext} methods.
 *
 * @example
 * ```ts
 * import { none, type NoneInstance } from "@askua/core/option";
 *
 * const a: NoneInstance<number> = none();
 * a.map((n) => n + 1); // NoneInstance<number>
 * ```
 */
export type NoneInstance<T> = OptionContext<T> & None;

/**
 * Infers {@link None} or {@link NoneInstance} based on the input {@link Option} type.
 *
 * @example
 * ```ts
 * import type { Option, OptionInstance, InferNone } from "@askua/core/option";
 *
 * type A = InferNone<Option<string>, number>;         // None
 * type B = InferNone<OptionInstance<string>, number>; // NoneInstance<number>
 * ```
 */
export type InferNone<O extends Option<unknown>, T> = O extends
  OptionContext<unknown> ? NoneInstance<T> : None;

/**
 * Creates a {@link NoneInstance} representing the absence of a value.
 *
 * @example
 * ```ts
 * import { none, some } from "@askua/core/option";
 *
 * const a = none<number>();
 * const b = none<number>().or(() => some(0)); // some(0)
 * ```
 */
export function none<T>(): InferNone<OptionInstance<T>, T> {
  return new _None();
}

/**
 * Type guard that checks if an {@link Option} is {@link None}.
 *
 * @example
 * ```ts
 * import { none, isNone, type Option } from "@askua/core/option";
 *
 * const a: Option<number> = none();
 * if (isNone(a)) {
 *   console.log("No value");
 * }
 * ```
 */
export function isNone<T>(
  option: Option<T>,
): option is InferNone<typeof option, T> {
  return !option.some;
}

/**
 * Union type of {@link Some}<T> | {@link None}.
 *
 * Use {@link isSome} or {@link isNone} for type narrowing,
 * or convert to {@link OptionInstance} for chainable methods.
 *
 * @example Plain object
 * ```ts
 * import type { Option } from "@askua/core/option";
 *
 * const a: Option<number> = { some: true, value: 1 };
 * const b: Option<number> = { some: false };
 *
 * if (a.some) {
 *   console.log(a.value);
 * }
 * ```
 *
 * @example Convert to OptionInstance
 * ```ts
 * import { Option, type OptionInstance } from "@askua/core/option";
 *
 * const plain: Option<number> = { some: true, value: 1 };
 * const instance: OptionInstance<number> = Option(plain);
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
 * Infers {@link Option} or {@link OptionInstance} based on the input type.
 *
 * @example
 * ```ts
 * import type { Option, OptionInstance, InferOption } from "@askua/core/option";
 *
 * type A = InferOption<Option<string>, number>;       // Option<number>
 * type B = InferOption<OptionInstance<string>, number>; // OptionInstance<number>
 * ```
 */
export type InferOption<O extends Option<unknown>, T> = O extends
  OptionInstance<unknown> ? OptionInstance<T> : Option<T>;

/**
 * {@link Option} with chainable {@link OptionContext} methods.
 *
 * @example
 * ```ts
 * import { some, type OptionInstance } from "@askua/core/option";
 *
 * const a: OptionInstance<number> = some(1);
 * const b = a
 *   .filter((n) => n > 0)
 *   .map((n) => n * 2)
 *   .unwrap(() => 0);
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
 * Callable signature for converting {@link Option} to {@link OptionInstance}.
 *
 * @example
 * ```ts
 * import { Option, some, type OptionInstance } from "@askua/core/option";
 *
 * const plain = { some: true, value: 1 } as const;
 * const instance: OptionInstance<number> = Option(plain);
 * ```
 */
export type OptionToInstance = {
  <T>(option: Some<T>): SomeInstance<T>;
  <T>(option: None): NoneInstance<T>;
  <T>(option: Option<T>): OptionInstance<T>;
};

type InferT<O extends Option<unknown>, T = never> = O extends Some<infer U>
  ? T | U
  : (O extends None ? T
    : (O extends Option<infer U> ? T | U : unknown));

type AndT<O extends Option<unknown>> = InferT<O>;

type OrT<O extends Option<unknown>, T> = InferT<O, T>;

/**
 * Chainable methods for {@link Option}.
 *
 * Provides `and`, `or`, `map`, `filter`, `tee`, `unwrap`, `lazy`, and `Iterable` support.
 *
 * @example
 * ```ts
 * import { some, none } from "@askua/core/option";
 *
 * const result = some(10)
 *   .filter((n) => n > 5)
 *   .map((n) => n * 2)
 *   .unwrap(() => 0); // 20
 *
 * const list = [...some(1), ...none(), ...some(2)]; // [1, 2]
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
   * @throws {Error} when called on {@link None} without argument
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

type InferOptionLazy<
  O extends Option<unknown>,
  T,
  Eval extends Option<unknown>,
> = OptionLazyContext<
  T,
  O extends OptionContext<unknown>
    ? (Eval extends Option<unknown> ? OptionInstance<T> : Option<T>)
    : Option<T>
>;

/**
 * Lazy chainable methods for async {@link Option} operations.
 *
 * Operations are deferred until {@link OptionLazyContext.eval | eval()} is called.
 *
 * @example
 * ```ts
 * import { Option, some } from "@askua/core/option";
 *
 * const result = await Option.lazy(Promise.resolve(some(1)))
 *   .map((n) => Promise.resolve(n + 1))
 *   .filter((n) => n > 0)
 *   .eval(); // some(2)
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
  >(andThen: (value: T) => OrPromise<O>): InferOptionLazy<O, AndT<O>, Eval>;

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
  >(orElse: () => OrPromise<O>): InferOptionLazy<O, OrT<O, T>, Eval>;

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
  map<U>(fn: (value: T) => OrPromise<U>): InferOptionLazy<Eval, U, Eval>;

  /**
   * @example
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
  filter<U extends T>(
    fn: (value: T) => value is U,
  ): InferOptionLazy<Eval, U, Eval>;
  filter(fn: (value: T) => OrPromise<boolean>): InferOptionLazy<Eval, T, Eval>;

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
  tee(callback: (value: T) => OrPromise<void>): InferOptionLazy<Eval, T, Eval>;

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
 * Static methods available on the {@link Option} namespace.
 *
 * @example
 * ```ts
 * import { Option, some, none } from "@askua/core/option";
 *
 * Option.some(1);           // same as some(1)
 * Option.none();            // same as none()
 * Option.and(some(1), () => some(2)); // some([1, 2])
 * Option.or(none(), () => some(1));   // some(1)
 * Option.fromNullable(null);          // none()
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
    Args extends NonEmptyArray<Fn>,
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
    Args extends NonEmptyArray<Fn>,
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

/** @internal */
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

/** @internal */
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

/** @internal */
type Op<T, U> =
  | { and: (value: T) => OrPromise<Option<U>> }
  | { or: () => OrPromise<Option<U>> }
  | { map: (value: T) => OrPromise<U> }
  | { filter: (value: T) => OrPromise<boolean> }
  | { tee: (value: T) => OrPromise<void> };

/** @internal */
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

/** @internal */
function toInstance<T>(option: Option<T>): OptionInstance<T> {
  return (option.some ? some(option.value) : none() as never);
}

/** @internal */
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

/** @internal */
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

/** @internal */
function lazy<T>(
  option: OrFunction<OrPromise<Option<T>>>,
): OptionLazyContext<T, Option<T>> {
  return new _Lazy(option);
}

/** @internal */
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

/** @internal */
function fromNullable<T>(value: T | null | undefined): OptionInstance<T> {
  if (value === null || value === undefined) return none<T>();
  return some(value);
}
