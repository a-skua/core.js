/**
 * Option is Object base type, Some<T> and None.
 *
 * ```ts
 * import { assert } from "@std/assert";
 * import { some, none, isSome, isNone } from "@askua/core/option";
 * import type { Option } from "@askua/core/option";
 *
 * const a: Option<number> = { some: true, value: 1 };
 * assert(isSome(a));
 *
 * const b: Option<number> = { some: false };
 * assert(isNone(b));
 *
 * const c: Option<number> = some(2);
 * assert(isSome(c));
 *
 * const d: Option<number> = none();
 * assert(isNone(d));
 * ```
 *
 * ## Usage
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Option, some, none } from "@askua/core/option";
 *
 * const value = Option({ some: true, value: 1 })
 *   .map((n) => n + 1)
 *   .andThen((n) => n >= 2 ? some(n) : none())
 *   .unwrapOr(0);
 * assertEquals(value, 2);
 * ```
 *
 * ## Why Object base?
 *
 * If you use on Server and Browser, using JSON.stringify and JSON.parse.
 * So, Object base is easy to use.
 *
 * ```ts
 * import { assert } from "@std/assert";
 * import type { Option } from "@askua/core/option";
 *
 * const json: string = '{"some":true,"value":1}';
 *
 * const option: Option<number> = JSON.parse(json);
 * assert(option.some);
 *
 * console.log(option.value); // 1
 * ```
 *
 * ## Using with method
 *
 * ```ts
 * import type { OptionInstance } from "@askua/core/option";
 * import { some, none } from "@askua/core/option";
 *
 * const option: OptionInstance<number> = some(Math.random());
 *
 * const value = option
 *   .andThen((n) => n >= 0.5 ? some(n) : none())
 *   .map((n) => n.toFixed(2))
 *   .unwrapOr("0.00");
 *
 * console.log(value);
 * ```
 *
 * ## Using Iterable
 *
 * ```ts
 * import { some, none } from "@askua/core/option";
 *
 * const getNumber = () => some(Math.random())
 *   .andThen((n) => n >= 0.5 ? some(n) : none());
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
 * ## Using Lazy type
 *
 * ```ts
 * import { some, none } from "@askua/core/option";
 *
 * const getNumber = () => Promise.resolve(some(Math.random()));
 *
 * const option = await Option.lazy(getNumber())
 *   .andThen((n) => n >= 0.5 ? some(n) : none())
 *   .map((n) => n.toFixed(2))
 *   .eval();
 *
 * console.log(option.unwrapOr("0.00"));
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import type { Err, Ok, Result, ResultInstance } from "./result.ts";
import { err, ok } from "./result.ts";
import type { OrPromise } from "./types.ts";

/**
 * Option element Some
 *
 * ```ts
 * import type { Some } from "@askua/core/option";
 *
 * const option: Some<number> = { some: true, value: 1 };
 * ```
 *
 * @typeParam T value type
 */
export interface Some<T> {
  readonly some: true;
  readonly value: T;
}

/**
 * Option element None
 *
 * ```ts
 * import type { None } from "@askua/core/option";
 *
 * const option: None = { some: false };
 * ```
 */
export interface None {
  readonly some: false;
}

/**
 * Infer Some from Option or OptionInstance
 *
 * ```ts
 * import type { InferSome, Option } from "@askua/core/option";
 *
 * type A = Option<number>;
 * type B = InferSome<A>; // = Same<number>
 * ```
 */
export type InferSome<O extends Option<unknown>> = O extends
  OptionContext<infer T> ? OptionContext<T> & Some<T>
  : Some<O extends Some<infer T> ? T : never>;

/**
 * Infer None from Option or OptionInstance
 *
 * ```ts
 * import type { InferNone, Option } from "@askua/core/option";
 *
 * type A = Option<number>;
 * type B = InferNone<A>; // = None
 * ```
 */
export type InferNone<O extends Option<unknown>> = O extends
  OptionContext<infer T> ? OptionContext<T> & None
  : None;

/**
 * Option is Object base type, Some<T> and None.
 *
 * ```ts
 * import type { Option } from "@askua/core/option";
 *
 * const a: Option<number> = { some: true, value: 1 };
 * const b: Option<number> = { some: false };
 * ```
 *
 * @typeParam T value type
 */
export type Option<T> = Some<T> | None;

/**
 * Option is Object base type, Some<T> and None.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Option, some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   some(1),
 *   Option({ some: true, value: 1 }),
 * );
 *
 * assertEquals(
 *   none(),
 *   Option({ some: false }),
 * );
 *
 * assertEquals(
 *   JSON.stringify(some(1)),
 *   '{"value":1,"some":true}',
 * );
 *
 * assertEquals(
 *   JSON.stringify(none()),
 *   '{"some":false}',
 * );
 * ```
 *
 * ## Static Methods
 *
 * ### some
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Option, some } from "@askua/core/option";
 *
 * assertEquals(
 *   Option.some(1),
 *   some(1),
 * );
 * ```
 *
 * ### none
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Option, none } from "@askua/core/option";
 *
 * assertEquals(
 *   Option.none(),
 *   none(),
 * );
 * ```
 *
 * ### andThen
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { OptionInstance } from "@askua/core/option";
 * import { Option, some } from "@askua/core/option";
 *
 * const a = await Option.andThen(
 *   some(1),
 *   () => some(2),
 *   Promise.resolve(some(3)),
 *   () => Promise.resolve(some(4)),
 * );
 * const b: OptionInstance<[number, number, number, number]> = some([1, 2, 3, 4]);
 *
 * assertEquals(a, b);
 * ```
 *
 * ### orElse
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { OptionInstance } from "@askua/core/option";
 * import { Option, some, none } from "@askua/core/option";
 *
 * const a = await Option.orElse(
 *   none<number>(),
 *   Promise.resolve(none<number>()),
 *   () => none<number>(),
 *   () => Promise.resolve(some(4)),
 * );
 * const b: OptionInstance<number> = some(4);
 *
 * assertEquals(a, b);
 * ```
 *
 * ### lazy
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Option, some } from "@askua/core/option";
 *
 * const a = await Option.lazy(Promise.resolve(some(1)))
 *   .or(some(2))
 *   .map((n) => n + 1)
 *   .eval();
 * const b = some(2);
 *
 * assertEquals(a, b);
 * ```
 *
 * ### fromResult
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Option, some } from "@askua/core/option";
 * import { ok } from "@askua/core/result";
 *
 * const a = Option.fromResult(ok(1));
 * const b = some(1);
 *
 * assertEquals(a, b);
 * ```
 *
 * ## Instance Methods
 *
 * ### andThen
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   some(1).andThen((n) => some(n + 1)),
 *   some(2),
 * );
 *
 * assertEquals(
 *   some(1).andThen(() => none()),
 *   none(),
 * );
 * ```
 *
 * ### and
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   some(1).and(some(2)),
 *   some(2),
 * );
 *
 * assertEquals(
 *   some(1).and(none()),
 *   none(),
 * );
 * ```
 *
 * ### orElse
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   some(1).orElse(() => some(2)),
 *   some(1),
 * );
 *
 * assertEquals(
 *   none().orElse(() => some(2)),
 *   some(2),
 * );
 * ```
 *
 * ### or
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   some(1).or(some(2)),
 *   some(1),
 * );
 *
 * assertEquals(
 *   none().or(some(2)),
 *   some(2),
 * );
 * ```
 *
 * ### map
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   some(1).map((n) => n + 1),
 *   some(2),
 * );
 *
 * assertEquals(
 *   none().map((n) => n + 1),
 *   none(),
 * );
 * ```
 *
 * ### unwrap
 *
 * ```ts
 * import { assertEquals, assertThrows } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   some(1).unwrap(),
 *   1,
 * );
 *
 * assertThrows(() => none().unwrap());
 * ```
 *
 * ### unwrapOr
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   some(1).unwrapOr(0),
 *   1,
 * );
 *
 * assertEquals(
 *   none().unwrapOr(0),
 *   0,
 * );
 * ```
 *
 * ### unwrapOrElse
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   some(1).unwrapOrElse(() => 0),
 *   1,
 * );
 *
 * assertEquals(
 *   none().unwrapOrElse(() => 0),
 *   0,
 * );
 * ```
 *
 * ### lazy
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * const a = await some(1)
 *   .lazy()
 *   .map((n) => Promise.resolve(n + 1))
 *   .eval();
 * const b = some(2);
 *
 * assertEquals(a, b);
 * ```
 *
 * ### [Symbol.iterator]
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   [...some("is some")],
 *   ["is some"],
 * );
 *
 * assertEquals(
 *   [...none()],
 *   [],
 * );
 * ```
 *
 * ### toString
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { some, none } from "@askua/core/option";
 *
 * assertEquals(
 *   some("is some").toString(),
 *   "Some(is some)",
 * );
 *
 * assertEquals(
 *   none().toString(),
 *   "None",
 * );
 * ```
 */
export const Option: OptionToInstance & OptionStatic = Object.assign(
  toInstance,
  { some, none, andThen, orElse, lazy, fromResult },
);

/**
 * Option Instance
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { OptionInstance } from "@askua/core/option";
 * import { some, none } from "@askua/core/option";
 *
 * const a: OptionInstance<number> = some(1);
 * const b: OptionInstance<number> = none();
 *
 * assertEquals(a.map((n) => n + 1), some(2));
 * assertEquals(b.map((n) => n + 1), none());
 * ```
 *
 * @typeParam T value type
 */
export type OptionInstance<T> = Option<T> & OptionContext<T>;

/**
 * Option ToInstance
 *
 * ```ts
 * const a: Option<number> = Option({ some: true, value: 1 });
 * const b: Option<number> = Option({ some: false });
 * ```
 */
type OptionToInstance = {
  <T>(option: Some<T>): InferSome<OptionInstance<T>>;
  <T>(option: None): InferNone<OptionInstance<T>>;
  <T>(option: Option<T>): OptionInstance<T>;
};

type NextT<O extends Option<unknown>, T> = O extends Some<infer T2> ? T | T2
  : (O extends None ? T
    : (O extends Option<infer T2> ? T | T2
      : unknown));

type AndT<O extends Option<unknown>> = NextT<O, never>;

type OrT<O extends Option<unknown>, T> = NextT<O, T>;

/**
 * Option Context
 *
 * @typeParam T - value type
 */
interface OptionContext<T>
  extends
    Iterable<T>,
    ToResult<T>,
    c.And<T>,
    c.Or<never>,
    c.Map<T>,
    c.Unwrap<T> {
  /**
   * ```ts
   * console.log("[Example] (Option).andThen");
   *
   * const fn = () => some(Math.random())
   *   .andThen((n) => n >= 0.5 ? some(n) : none())
   *   .andThen((n) => some(n.toFixed(2)));
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  andThen<O extends Option<T2>, T2 = AndT<O>>(
    fn: (value: T) => O,
  ): O extends OptionInstance<infer _> ? OptionInstance<T2> : Option<T2>;

  /**
   * ```ts
   * console.log("[Example] (Option).and");
   *
   * const fn = () => some(Math.random())
   *   .andThen((n) => n >= 0.5 ? some(n) : none())
   *   .and(some("TOO LARGE"));
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  and<O extends Option<T2>, T2 = AndT<O>>(
    option: O,
  ): O extends OptionInstance<infer _> ? OptionInstance<T2> : Option<T2>;

  /**
   * ```ts
   * console.log("[Example] (Option).orElse");
   *
   * const fn = () => some(Math.random())
   *   .andThen((n) => n >= 0.5 ? some(n) : none())
   *   .andThen((n) => some(n.toFixed(2)))
   *   .orElse(() => some("0.00"));
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  orElse<O extends Option<T2>, T2 = OrT<O, T>>(
    fn: () => O,
  ): O extends OptionInstance<infer _> ? OptionInstance<T2> : Option<T2>;

  /**
   * ```ts
   * console.log("[Example] (Option).or");
   *
   * const fn = () => some(Math.random())
   *   .andThen((n) => n >= 0.5 ? some(n) : none())
   *   .andThen((n) => some(n.toFixed(2)))
   *   .or(some("0.00"));
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  or<O extends Option<T2>, T2 = OrT<O, T>>(
    option: O,
  ): O extends OptionInstance<infer _> ? OptionInstance<T2> : Option<T2>;

  /**
   * ```ts
   * console.log("[Example] (Option).map");
   *
   * const fn = () => some(Math.random())
   *   .andThen((n) => n >= 0.5 ? some(n) : none())
   *   .map((n) => n.toFixed(2));
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  map<T2>(fn: (value: T) => T2): OptionInstance<T2>;

  /**
   * ```ts
   * console.log("[Example] (Option).unwrap");
   *
   * const fn = () => some(Math.random())
   *   .andThen((n) => n >= 0.5 ? some(n) : none())
   *   .andThen((n) => some(n.toFixed(2)))
   *   .or(some("0.00"))
   *   .unwrap();
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  unwrap(): T;

  /**
   * ```ts
   * console.log("[Example] (Option).unwrapOr");
   *
   * const fn = () => some(Math.random())
   *   .andThen((n) => n >= 0.5 ? some(n) : none())
   *   .andThen((n) => some(n.toFixed(2)))
   *   .unwrapOr("0.00");
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  unwrapOr<T2>(value: T2): T | T2;

  /**
   * ```ts
   * console.log("[Example] (Option).unwrapOrElse");
   *
   * const fn = () => some(Math.random())
   *   .andThen((n) => n >= 0.5 ? some(n) : none())
   *   .andThen((n) => some(n.toFixed(2)))
   *   .unwrapOrElse(() => "0.00");
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  unwrapOrElse<T2>(fn: () => T2): T | T2;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const option = await some(1)
   *   .lazy()
   *   .and(some(2))
   *   .eval();
   * assertEquals(option, some(2));
   * ```
   */
  lazy(): Lazy<T, OptionInstance<T>>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some("is some");
   * assertEquals(a.toString(), "Some(is some)");
   *
   * const b = none();
   * assertEquals(b.toString(), "None");
   * ```
   */
  toString(): string;
}

type LazyEval<T, O extends Option<T>, Eval extends Option<unknown>> = O extends
  OptionInstance<unknown>
  ? (Eval extends OptionInstance<unknown> ? OptionInstance<T> : Option<T>)
  : O;

/**
 * Option Lazy eval
 *
 * @typeParam T - value type
 * @typeParam Eval - eval Option
 */
interface Lazy<T, Eval extends Option<T>>
  extends c.And<T>, c.Or<never>, c.Map<T> {
  /**
   * ```ts
   * console.log("[Example] (Lazy).andThen");
   *
   * const getNumber = () => Promise.resolve(some(Math.random()));
   *
   * const fn = () => Option.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? some(n) : none<number>())
   *   .andThen((n) => Promise.resolve(some(n.toFixed(2))))
   *   .eval();
   *
   * console.log(`Option: ${await fn()}`);
   * ```
   */
  andThen<
    O extends Option<T2>,
    T2 = AndT<O>,
    Z extends Option<T2> = LazyEval<T2, O, Eval>,
  >(fn: (value: T) => OrPromise<O>): Lazy<T2, Z>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).and");
   *
   * const getNumber = () => Promise.resolve(some(Math.random()));
   *
   * const fn = () => Option.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? some(n) : none<number>())
   *   .and(Promise.resolve(some("TOO LARGE")))
   *   .eval();
   *
   * console.log(`Option: ${await fn()}`);
   * ```
   */
  and<
    O extends Option<T2>,
    T2 = AndT<O>,
    Z extends Option<T2> = LazyEval<T2, O, Eval>,
  >(option: OrPromise<O>): Lazy<T2, Z>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).orElse");
   *
   * const getNumber = () => Promise.resolve(some(Math.random()));
   *
   * const fn = () => Option.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? some(n) : none<number>())
   *   .andThen((n) => Promise.resolve(some(n.toFixed(2))))
   *   .orElse(() => Promise.resolve(some("0.50")))
   *   .eval();
   *
   * console.log(`Option: ${await fn()}`);
   * ```
   */
  orElse<
    O extends Option<T2>,
    T2 = OrT<O, T>,
    Z extends Option<T2> = LazyEval<T2, O, Eval>,
  >(fn: () => OrPromise<O>): Lazy<T2, Z>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).or");
   *
   * const getNumber = () => Promise.resolve(some(Math.random()));
   *
   * const fn = () => Option.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? some(n) : none<number>())
   *   .andThen((n) => Promise.resolve(some(n.toFixed(2))))
   *   .or(Promise.resolve(some("0.50")))
   *   .eval();
   *
   * console.log(`Option: ${await fn()}`);
   * ```
   */
  or<
    O extends Option<T2>,
    T2 = OrT<O, T>,
    Z extends Option<T2> = LazyEval<T2, O, Eval>,
  >(option: OrPromise<O>): Lazy<T2, Z>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).map");
   *
   * const getNumber = () => Promise.resolve(some(Math.random()));
   *
   * const fn = () => Option.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? some(n) : none<number>())
   *   .map((n) => Promise.resolve(n.toFixed(2)))
   *   .eval();
   *
   * console.log(`Option: ${await fn()}`);
   * ```
   */
  map<
    T2,
    Z extends Option<T2> = LazyEval<T2, OptionInstance<T2>, Eval>,
  >(fn: (value: T) => OrPromise<T2>): Lazy<T2, Z>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).eval");
   *
   * const option = await some(1).lazy().eval();
   *
   * console.log(`Option: ${option}`);
   * ```
   */
  eval(): Promise<Eval>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(
   *   some(1).lazy().toString(),
   *   "Lazy<Some(1)>",
   * );
   *
   * assertEquals(
   *   none<number>().lazy().map((n) => n * 100).or(some(0)).toString(),
   *   "Lazy<None.map((n)=>n * 100).or(Some(0))>",
   * );
   * ```
   */
  toString(): string;
}

/**
 * Static Methods
 */
interface OptionStatic {
  /**
   * ```ts
   * import { assertEquals, assertObjectMatch } from "@std/assert";
   *
   * assertObjectMatch(
   *   some("is some"),
   *   { some: true, value: "is some" },
   * );
   *
   * for (const value of some("is some")) {
   *   assertEquals(value, "is some");
   * }
   *
   * const array = Array.from(some("is some"));
   * assertEquals(array, ["is some"]);
   * ```
   */
  some: typeof some;

  /**
   * ```ts
   * import { assert, assertEquals, assertObjectMatch } from "@std/assert";
   *
   * assertObjectMatch(
   *   none(),
   *   { some: false },
   * );
   *
   * for (const _ of none()) {
   *   assert(false);
   * }
   *
   * const array = Array.from(none());
   * assertEquals(array, []);
   */
  none: typeof none;

  /**
   * ```ts
   * console.log("[Example] Option.andThen");
   *
   * const getNumber = () => some(Math.random())
   *   .andThen((n) => n >= 0.2 ? some(n) : none())
   *   .map((n) => n.toFixed(2));
   *
   * const fn = () => Option.andThen(
   *   () => getNumber(),
   *   () => getNumber(),
   *   () => getNumber(),
   * );
   *
   * console.log(`Option: ${await fn()}`);
   * ```
   *
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const option = await Option.andThen(
   *   some(1),
   *   () => some(2),
   *   Promise.resolve(some(3)),
   *   () => Promise.resolve(some(4)),
   * ).then((o) => o.unwrap().join(", "));
   *
   * assertEquals(option, "1, 2, 3, 4");
   * ```
   */
  andThen: typeof andThen;

  /**
   * ```ts
   * console.log("[Example] Option.orElse");
   *
   * const getNumber = () => some(Math.random())
   *   .andThen((n) => n >= 0.8 ? some(n) : none())
   *   .map((n) => n.toFixed(2));
   *
   * const fn = () => Option.orElse(
   *   () => getNumber(),
   *   () => getNumber(),
   *   () => getNumber(),
   * );
   *
   * console.log(`Option: ${await fn()}`);
   * ```
   *
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const option = await Option.orElse(
   *   none<number>(),
   *   Promise.resolve(none<number>()),
   *   () => none<number>(),
   *   () => Promise.resolve(some(4)),
   * ).then((o) => o.unwrap().toFixed(2));
   *
   * assertEquals(option, "4.00");
   * ```
   */
  orElse: typeof orElse;

  /**
   * ```ts
   * console.log("[Example] Option.lazy");
   *
   * const option = await Option.lazy(some(1))
   *   .and(some(2))
   *   .eval();
   *
   * console.log(`Option: ${option}`);
   * ```
   *
   * ```ts
   * console.log("[Example] Option.lazy");
   *
   * const option = await Option.lazy(() => some(1))
   *   .and(some(2))
   *   .map((n) => n.toFixed(2))
   *   .eval();
   *
   * console.log(`Option: ${option}`);
   * ```
   */
  lazy: typeof lazy;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { ok, err } from "@askua/core/result";
   *
   * const a: Some<number> = Option.fromResult(ok(1));
   * assertEquals(a, some(1));
   *
   * const b: None = Option.fromResult(err(new Error("Error")));
   * assertEquals(b, none());
   * ```
   */
  fromResult: typeof fromResult;
}

/**
 * Option ToResult
 *
 * @deprecated use Result.fromOption()
 */
interface ToResult<T> {
  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Result } from "@askua/core/result";
   *
   * const ok = some("is some").toResult();
   * assertEquals(ok, Result.ok("is some"));
   *
   * const err = none().toResult<Error>();
   * assertEquals(err, Result.err(new Error("None")));
   *
   * const customErr = none().toResult<string>("is none");
   * assertEquals(customErr, Result.err("is none"));
   * ```
   *
   * @deprecated use Result.fromOption()
   */
  toResult<E = Error>(error?: E): ResultInstance<T, E>;
}

/**
 * impl Some<T>
 */
class _Some<T> implements Some<T>, OptionContext<T> {
  readonly some = true;
  constructor(readonly value: T) {}

  toResult<R>(): R {
    return ok(this.value) as R;
  }

  andThen<U, V>(fn: (v: T) => U): V {
    return fn(this.value) as never;
  }

  and<U, V>(option: U): V {
    return option as never;
  }

  orElse<U>(): U {
    return this as never;
  }

  or<U>(): U {
    return this as never;
  }

  map<U, V>(fn: (v: T) => U): V {
    return some(fn(this.value)) as V;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(): T {
    return this.value;
  }

  unwrapOrElse<U>(): U {
    return this.value as never;
  }

  lazy<Z extends Option<T>>(): Lazy<T, Z> {
    return new _Lazy(this as never);
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
 * impl None<T>
 */
class _None<T> implements None, OptionContext<T> {
  readonly some = false;
  constructor() {}

  toResult<E, R>(error: E = new Error("None") as E): R {
    return err(error) as R;
  }

  andThen<U>(): U {
    return this as never;
  }

  and<U>(): U {
    return this as never;
  }

  orElse<U, V>(fn: () => U): V {
    return fn() as never;
  }

  or<U, V>(option: U): V {
    return option as never;
  }

  map<U>(): U {
    return this as never;
  }

  unwrap(): T {
    throw new Error("None");
  }

  unwrapOr<U>(value: U): U {
    return value;
  }

  unwrapOrElse<U>(fn: () => U): U {
    return fn();
  }

  lazy<Z extends Option<T>>(): Lazy<T, Z> {
    return new _Lazy(this as never);
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
 * Lazy Operation
 */
type Op<T, U> =
  | { andThen: (value: T) => Promise<Option<U>> }
  | { and: Promise<Option<U>> }
  | { orElse: () => Promise<Option<U>> }
  | { or: Promise<Option<U>> }
  | { map: (value: T) => Promise<U> };

/**
 * impl Lazy<T, Eval>
 */
class _Lazy<T, Eval extends Option<T>> implements Lazy<T, Eval> {
  readonly op: Op<T, never>[] = [];

  constructor(
    private readonly first: (() => Promise<Eval> | Eval) | Promise<Eval> | Eval,
  ) {}

  andThen<U, Op>(andThen: Op): U {
    this.op.push({ andThen } as typeof this.op[number]);
    return this as never;
  }

  and<U, Op>(and: Op): U {
    this.op.push({ and } as typeof this.op[number]);
    return this as never;
  }

  orElse<U, Op>(orElse: Op): U {
    this.op.push({ orElse } as typeof this.op[number]);
    return this as never;
  }

  or<U, Op>(or: Op): U {
    this.op.push({ or } as typeof this.op[number]);
    return this as never;
  }

  map<U, Op>(map: Op): U {
    this.op.push({ map } as typeof this.op[number]);
    return this as never;
  }

  async eval(): Promise<Eval> {
    const p = typeof this.first === "function" ? this.first() : this.first;
    let option: Option<T> = p instanceof Promise ? await p : p;
    for (let i = 0; i < this.op.length; i++) {
      const op = this.op[i];

      if ("andThen" in op && option.some) {
        const p = op.andThen(option.value);
        option = p instanceof Promise ? await p : p;
        continue;
      }

      if ("and" in op && option.some) {
        option = op.and instanceof Promise ? await op.and : op.and;
        continue;
      }

      if ("orElse" in op && !option.some) {
        const p = op.orElse();
        option = p instanceof Promise ? await p : p;
        continue;
      }

      if ("or" in op && !option.some) {
        option = op.or instanceof Promise ? await op.or : op.or;
        continue;
      }

      if ("map" in op && option.some) {
        const p = op.map(option.value);
        option = some(p instanceof Promise ? await p : p);
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
 * impl OptionToInstance
 */
function toInstance<T>(option: Some<T>): InferSome<OptionInstance<T>>;
function toInstance<T>(option: None): InferNone<OptionInstance<T>>;
function toInstance<T>(option: Option<T>): OptionInstance<T>;
function toInstance<T>(option: Option<T>): OptionInstance<T> {
  return (option.some ? some(option.value) : none());
}

/**
 * some is create Some
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { OptionInstance } from "@askua/core/option";
 * import { some } from "@askua/core/option";
 *
 * const a: OptionInstance<number> = some(1);
 * assertEquals(a.map((n) => n + 1), some(2));
 * ```
 *
 * @typeParam T value type
 */
export function some<T>(value: T): InferSome<OptionInstance<T>> {
  return new _Some(value);
}

/**
 * isSome is check Some
 *
 * ```ts
 * import { assert } from "@std/assert";
 * import { some, isSome } from "@askua/core/option";
 *
 * const option = some(1);
 * assert(isSome(option));
 * ```
 *
 * @typeParam T value type
 */
export function isSome<T>(
  option: Option<T>,
): option is InferSome<typeof option>;
/**
 * @typeParam T value type
 */
export function isSome<T>(
  option: OptionInstance<T>,
): option is InferSome<typeof option>;
export function isSome<T>({ some }: Option<T>) {
  return some;
}

/**
 * none is create None
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { OptionInstance } from "@askua/core/option";
 * import { none } from "@askua/core/option";
 *
 * const a: OptionInstance<number> = none<number>();
 * assertEquals(a.map((n) => n + 1), none());
 * ```
 *
 * @typeParam T value type
 */
export function none<T = never>(): InferNone<OptionInstance<T>> {
  return new _None<T>();
}

/**
 * isNone is check None
 *
 * ```ts
 * import { assert } from "@std/assert";
 * import { none, isNone } from "@askua/core/option";
 *
 * const option = none();
 * assert(isNone(option));
 * ```
 *
 * @typeParam T value type
 */
export function isNone<T>(
  option: Option<T>,
): option is InferNone<typeof option>;

/**
 * @typeParam T value type
 */
export function isNone<T>(
  option: OptionInstance<T>,
): option is InferNone<typeof option>;
export function isNone<T>({ some }: Option<T>) {
  return !some;
}

async function andThen<
  O extends Fn[number] extends (() => infer O) | infer O
    ? (Awaited<O> extends OptionInstance<infer _> ? OptionInstance<T>
      : (Awaited<O> extends Option<infer _> ? Option<T> : unknown))
    : never,
  Fn extends {
    [K in keyof T]:
      | OrPromise<Option<T[K]>>
      | (() => OrPromise<Option<T[K]>>);
  }[number][] = O extends OptionInstance<infer T extends unknown[]> ? {
      [K in keyof T]:
        | OrPromise<OptionInstance<T[K]>>
        | (() => OrPromise<OptionInstance<T[K]>>);
    }
    : (O extends Option<infer T extends unknown[]> ? {
        [K in keyof T]:
          | OrPromise<Option<T[K]>>
          | (() => OrPromise<Option<T[K]>>);
      }
      : never),
  T extends unknown[] = {
    [K in keyof Fn]: Fn[K] extends
      infer O | (() => infer O) | Promise<infer O> | (() => Promise<infer O>)
      ? (O extends Option<unknown> ? AndT<O> : never)
      : never;
  },
>(...fn: Fn): Promise<O> {
  const values: T[number][] = new Array(fn.length);
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: OrPromise<Option<T[number]>> = typeof f === "function" ? f() : f;
    const option = p instanceof Promise ? await p : p;
    if (option.some) {
      values[i] = option.value;
    } else {
      return option as O;
    }
  }

  return some(values) as O;
}

async function orElse<
  O extends Fn[number] extends (() => infer O) | infer O
    ? (Awaited<O> extends OptionInstance<infer _> ? OptionInstance<T>
      : (Awaited<O> extends Option<infer _> ? Option<T> : never))
    : never,
  F extends
    | OrPromise<Option<T>>
    | (() => OrPromise<Option<T>>) =
      | OrPromise<O>
      | (() => OrPromise<O>),
  Fn extends [F, ...F[]] = [F, ...F[]],
  T = {
    [K in keyof Fn]: Fn[K] extends (() => infer O) | infer O
      ? (Awaited<O> extends Option<unknown> ? OrT<Awaited<O>, never> : never)
      : never;
  }[number],
>(...fn: Fn): Promise<O> {
  let last;
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: OrPromise<Option<T>> = typeof f === "function" ? f() : f;
    const option = p instanceof Promise ? await p : p;
    if (option.some) {
      return option as O;
    }
    last = option;
  }
  return last as O;
}

function lazy<
  O extends Eval,
  Fn extends
    | OrPromise<Eval>
    | (() => OrPromise<Eval>) =
      | OrPromise<O>
      | (() => OrPromise<O>),
  Eval extends Option<T> = Fn extends (() => infer O) | infer O ? Awaited<O>
    : never,
  T = NextT<Eval, never>,
>(option: Fn): Lazy<T, Eval> {
  return new _Lazy(option);
}

function fromResult<T, _>(result: Ok<T>): InferSome<OptionInstance<T>>;
function fromResult<T, E>(result: Err<E>): InferNone<OptionInstance<T>>;
function fromResult<T, E>(result: Result<T, E>): OptionInstance<T>;
function fromResult<T, E>(result: Result<T, E>): OptionInstance<T> {
  if (result.ok) return some(result.value);
  return none();
}
