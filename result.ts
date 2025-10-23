/**
 * Result is Object base type, Ok<T> and Err<E>.
 *
 * ```ts
 * import { assert } from "@std/assert";
 * import type { Result } from "@askua/core/result";
 * import { ok, err, isOk, isErr } from "@askua/core/result";
 *
 * const a: Result<number> = { ok: true, value: 1 };
 * assert(isOk(a));
 *
 * const b: Result<number> = { ok: false, error: new Error("error") };
 * assert(isErr(b));
 *
 * const c: Result<number> = ok(1);
 * assert(isOk(c));
 *
 * const d: Result<number> = err(new Error("error"));
 * assert(isErr(d));
 * ```
 *
 * ## Usage
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Result, ok, err } from "@askua/core/result";
 *
 * const value = Result({ ok: true, value: 1 })
 *   .map((n) => n + 1)
 *   .filter((n) => n >= 2, () => new Error("less than 2"))
 *   .unwrapOr(0);
 *
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
 * import type { Result } from "@askua/core/result";
 *
 * const json: string = '{"ok":true,"value":1}';
 *
 * const result: Result<number> = JSON.parse(json);
 * assert(result.ok);
 *
 * console.log(result.value); // 1
 * ```
 *
 * ## Using with method
 *
 * ```ts
 * import type { ResultInstance } from "@askua/core/result";
 * import { ok, err } from "@askua/core/result";
 *
 * const result: ResultInstance<number> = ok(Math.random());
 *
 * const value = result
 *   .filter((n) => n >= 0.5, () => new Error("less than 0.5"))
 *   .map((n) => n.toFixed(2))
 *   .unwrapOr("0.00");
 *
 * console.log(value);
 * ```
 *
 * ## Using Iterable
 *
 * ```ts
 * import { Result } from "@askua/core/result";
 *
 * const getNumber = () => ok(Math.random())
 *   .filter((n) => n >= 0.5, () => new Error("less than 0.5"));
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
 * import { ok, err } from "@askua/core/result";
 *
 * const getNumber = () => Promise.resolve(ok(Math.random()));
 *
 * const result = await Result.lazy(getNumber())
 *   .filter((n) => n >= 0.5, () => new Error("less than 0.5"))
 *   .map((n) => n.toFixed(2))
 *   .eval();
 *
 * console.log(result.unwrapOr("0.00"));
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import { none, some } from "./option.ts";
import type { None, Option, OptionInstance, Some } from "./option.ts";
import type { OrPromise } from "./types.ts";

/**
 * Result element Ok
 *
 * ```ts
 * import type { Ok } from "@askua/core/result";
 *
 * const result: Ok<number> = { ok: true, value: 1 };
 * ```
 *
 * @typeParam T value type
 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/**
 * Result element Err
 *
 * ```ts
 * import type { Err } from "@askua/core/result";
 *
 * const result: Err<string> = { ok: false, error: "is error" };
 * ```
 *
 * @typeParam E error type
 */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * Infer Ok type from Result or ResultInstance
 *
 * ```ts
 * import type { Result, InferOk } from "@askua/core/result";
 *
 * type A = Result<number>;
 * type B = InferOk<A>; // = Ok<number>
 * ```
 */
export type InferOk<R extends Result<unknown, unknown>> = R extends
  ResultContext<infer T, infer E> ? ResultContext<T, E> & Ok<T>
  : Ok<R extends Ok<infer T> ? T : never>;

/**
 * Infer Err type from Result or ResultInstance
 *
 * ```ts
 * import type { Result, InferErr } from "@askua/core/result";
 *
 * type A = Result<number, string>;
 * type B = InferErr<A>; // = Err<string>
 * ```
 */
export type InferErr<R extends Result<unknown, unknown>> = R extends
  ResultContext<infer T, infer E> ? ResultContext<T, E> & Err<E>
  : Err<R extends Err<infer E> ? E : never>;

/**
 * Result
 *
 * ```ts
 * import type { Result } from "@askua/core/result";
 *
 * const a: Result<number> = { ok: true, value: 1 };
 * const b: Result<number> = { ok: false, error: new Error("error") };
 * ```
 *
 * @typeParam T value type
 * @typeParam E error type
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * Result is Object base type, Ok<T> and Err<E>.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Result, ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1),
 *   Result({ ok: true, value: 1 }),
 * );
 *
 * assertEquals(
 *   err(new Error("error")),
 *   Result({ ok: false, error: new Error("error") }),
 * );
 *
 * assertEquals(
 *   JSON.stringify(ok(1)),
 *   '{"value":1,"ok":true}',
 * );
 *
 * assertEquals(
 *   JSON.stringify(err("is error")),
 *   '{"error":"is error","ok":false}',
 * );
 * ```
 *
 * ## Static Methods
 *
 * ### ok
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Result, ok } from "@askua/core/result";
 *
 * assertEquals(
 *   Result.ok("is ok"),
 *   ok("is ok"),
 * );
 * ```
 *
 * ### err
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Result, err } from "@askua/core/result";
 *
 * assertEquals(
 *   Result.err("is error"),
 *   err("is error"),
 * );
 * ```
 *
 * ### andThen
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { ResultInstance } from "@askua/core/result";
 * import { Result, ok } from "@askua/core/result";
 *
 * const a = await Result.andThen(
 *   ok(1),
 *   () => ok(2),
 *   Promise.resolve(ok(3)),
 *   () => Promise.resolve(ok(4)),
 * );
 * const b: ResultInstance<[number, number, number, number]> = ok([1, 2, 3, 4]);
 *
 * assertEquals(a, b);
 * ```
 *
 * ### orElse
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { ResultInstance } from "@askua/core/result";
 * import { Result, ok } from "@askua/core/result";
 *
 * const a = await Result.orElse(
 *   err("error"),
 *   () => err("error"),
 *   Promise.resolve(err("error")),
 *   () => Promise.resolve(ok(4)),
 * );
 * const b: ResultInstance<number, string> = ok(4);
 *
 * assertEquals(a, b);
 * ```
 *
 * ### lazy
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Result, ok } from "@askua/core/result";
 *
 * const result = await Result.lazy(ok(1))
 *   .or(ok(2))
 *   .map((n) => n.toFixed(2))
 *   .eval();
 *
 * assertEquals(result, ok("1.00"));
 * ```
 *
 * ### fromOption
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Result, ok } from "@askua/core/result";
 * import { some } from "@askua/core/option";
 *
 * const a = Result.fromOption(some(1));
 * const b = ok(1);
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
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).andThen((n) => ok(n + 1)),
 *   ok(2),
 * );
 *
 * assertEquals(
 *   err("error").andThen((n) => ok(n + 1)),
 *   err("error"),
 * );
 * ```
 *
 * ### and
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).and(ok(2)),
 *   ok(2),
 * );
 *
 * assertEquals(
 *   err("error").and(ok(2)),
 *   err("error"),
 * );
 * ```
 *
 * ## orElse
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).orElse(() => ok(2)),
 *   ok(1),
 * );
 *
 * assertEquals(
 *   err("error").orElse(() => ok(2)),
 *   ok(2),
 * );
 * ```
 *
 * ## or
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).or(ok(2)),
 *   ok(1),
 * );
 *
 * assertEquals(
 *   err("error").or(ok(2)),
 *   ok(2),
 * );
 * ```
 *
 * ## map
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).map((n) => n + 1),
 *   ok(2),
 * );
 *
 * assertEquals(
 *   err("error").map((n) => n + 1),
 *   err("error"),
 * );
 * ```
 *
 * ## filter
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).filter((n) => n > 0),
 *   ok(1),
 * );
 *
 * assertEquals(
 *   err("error").filter((n) => n > 0),
 *   err("error"),
 * );
 * ```
 *
 * ## unwrap
 *
 * ```ts
 * import { assertEquals, assertThrows } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).unwrap(),
 *   1,
 * );
 *
 * assertThrows(() => err(new Error("error")).unwrap());
 * ```
 *
 * ## unwrapOr
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).unwrapOr(0),
 *   1,
 * );
 *
 * assertEquals(
 *   err("error").unwrapOr(0),
 *   0,
 * );
 * ```
 *
 * ## unwrapOrElse
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).unwrapOrElse(() => 0),
 *   1,
 * );
 *
 * assertEquals(
 *   err("error").unwrapOrElse(() => 0),
 *   0,
 * );
 * ```
 *
 * ## lazy
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * const a = await ok(1)
 *   .lazy()
 *   .map((n) => Promise.resolve(n + 1))
 *   .eval();
 * const b = ok(2);
 *
 * assertEquals(a, b);
 * ```
 *
 * ## [Symbol.iterator]
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   [...ok(1)],
 *   [1],
 * );
 *
 * assertEquals(
 *   [...err("error")],
 *   [],
 * );
 * ```
 *
 * ## toString
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok("is ok").toString(),
 *   "Ok(is ok)",
 * );
 *
 * assertEquals(
 *   err("is error").toString(),
 *   "Err(is error)",
 * );
 *   ```
 */
export const Result: ResultToInstance & ResultStatic = Object.assign(
  toInstance,
  { ok, err, andThen, orElse, lazy, fromOption },
);

/**
 * Result Instance
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { ResultInstance } from "@askua/core/result";
 * import { ok, err } from "@askua/core/result";
 *
 * const a: ResultInstance<number> = ok(1);
 * const b: ResultInstance<number> = err(new Error("error"));
 *
 * assertEquals(a.map((n) => n + 1), ok(2));
 * assertEquals(b.map((n) => n + 1), err(new Error("error")));
 * ```
 *
 * @typeParam T value type
 * @typeParam E error type
 */
export type ResultInstance<T, E = Error> = Result<T, E> & ResultContext<T, E>;

/**
 * Result ToInstance
 *
 * ```ts
 * const a: Result<number> = Result({ ok: true, value: 1 });
 * const b: Result<number> = Result({ ok: false, error: new Error("error") });
 * ```
 */
type ResultToInstance = {
  <T, E = never>(ok: Ok<T>): InferOk<ResultInstance<T, E>>;
  <T = never, E = never>(err: Err<E>): InferErr<ResultInstance<T, E>>;
  <T = never, E = never>(result: Result<T, E>): ResultInstance<T, E>;
  <T, E>(result: { ok: boolean; value: T; error: E }): ResultInstance<T, E>;
};

type NextT<R extends Result<unknown, unknown>, T> = R extends Ok<infer T2>
  ? T | T2
  : (R extends Err<unknown> ? T
    : (R extends Result<infer T2, unknown> ? T | T2
      : unknown));

type NextE<R extends Result<unknown, unknown>, E> = R extends Ok<unknown> ? E
  : (R extends Err<infer E2> ? E | E2
    : (R extends Result<unknown, infer E2> ? E | E2
      : unknown));

type AndT<R extends Result<unknown, unknown>> = NextT<R, never>;
type AndE<R extends Result<unknown, unknown>, E> = NextE<R, E>;

type OrT<R extends Result<unknown, unknown>, T> = NextT<R, T>;
type OrE<R extends Result<unknown, unknown>> = NextE<R, never>;

/**
 * Result Context
 *
 * @typeParam T - value type
 * @typeParam E - error type
 */
interface ResultContext<T, E>
  extends
    Iterable<T>,
    ToOption<T>,
    c.And<T>,
    c.Or<E>,
    c.Map<T>,
    c.Filter<T>,
    c.Unwrap<T> {
  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).andThen");
   *
   * const fn = () => ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .andThen((n) => ok(n.toFixed(2)));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  andThen<R extends Result<T2, E2>, T2 = AndT<R>, E2 = AndE<R, E>>(
    fn: (value: T) => R,
  ): R extends ResultInstance<infer _, infer _> ? ResultInstance<T2, E2>
    : Result<T2, E2>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).and");
   *
   * const fn = () => ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .and(ok("TOO LARGE"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  and<R extends Result<T2, E2>, T2 = AndT<R>, E2 = AndE<R, E>>(
    result: R,
  ): R extends ResultInstance<infer _, infer _> ? ResultInstance<T2, E2>
    : Result<T2, E2>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).orElse");
   *
   * const fn = () => ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .andThen((n) => ok(n.toFixed(2)))
   *   .orElse((e) => {
   *     console.error(`Error: ${e}`);
   *     return ok(0);
   *   })
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  orElse<R extends Result<T2, E2>, T2 = OrT<R, T>, E2 = OrE<R>>(
    fn: (error: E) => R,
  ): R extends ResultInstance<infer _, infer _> ? ResultInstance<T2, E2>
    : Result<T2, E2>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).or");
   *
   * const fn = () => ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .andThen((n) => ok(n.toFixed(2)))
   *   .or(ok(0));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  or<R extends Result<T2, E2>, T2 = OrT<R, T>, E2 = OrE<R>>(
    result: R,
  ): R extends ResultInstance<infer _, infer _> ? ResultInstance<T2, E2>
    : Result<T2, E2>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).map");
   *
   * const fn = () => ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .map((n) => n.toFixed(2))
   *   .or(ok("0.00"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  map<T2>(fn: (value: T) => T2): ResultInstance<T2, E>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).[Symbol.iterator]");
   *
   * const fn = () => ok(Math.random())
   *   .filter((n) => n >= 0.5, () => new Error("less than 0.5"))
   *   .map((n) => n.toFixed(2))
   *   .or(ok("0.00"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  filter(isOk: (value: T) => boolean): ResultInstance<T, E | Error>;
  filter<E2>(
    isOk: (value: T) => boolean,
    err: () => E2,
  ): ResultInstance<T, E | E2>;
  filter<E2>(
    isOk: (value: T) => boolean,
    err?: () => E2,
  ): ResultInstance<T, E | E2 | Error>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).unwrap");
   *
   * const fn = () => ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .andThen((n) => ok(n.toFixed(2)))
   *   .or(ok("0.00"))
   *   .unwrap();
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  unwrap(): T;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).unwrapOr");
   *
   * const fn = () => ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .andThen((n) => ok(n.toFixed(2)))
   *   .unwrapOr("0.00");
   *
   * console.log(`Result: ${fn()}`);
   */
  unwrapOr<T2>(value: T2): T | T2;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).unwrapOrElse");
   *
   * const fn = () => ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .andThen((n) => ok(n.toFixed(2)))
   *   .unwrapOrElse((e) => {
   *     console.error(`Error: ${e}`);
   *     return "0.00";
   *   });
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  unwrapOrElse<T2>(fn: (error: E) => T2): T | T2;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * import { assertEquals } from "@std/assert";
   *
   * const a = ok("is ok");
   * assertEquals(a.toString(), "Ok(is ok)");
   *
   * const b = err("is error");
   * assertEquals(b.toString(), "Err(is error)");
   * ```
   */
  toString(): string;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * import { assertEquals } from "@std/assert";
   *
   * const result = await ok(1).lazy().and((ok(2))).eval();
   * assertEquals(result, ok(2));
   * ```
   */
  lazy(): ResultLazy<T, E, ResultInstance<T, E>>;
}

type ResultLazyEval<
  T,
  E,
  R extends Result<T, E>,
  Eval extends Result<unknown, unknown>,
> = R extends ResultInstance<unknown, unknown>
  ? (Eval extends ResultInstance<unknown, unknown> ? ResultInstance<T, E>
    : Result<T, E>)
  : R;

/**
 * Result Lazy eval
 *
 * @typeParam T - value type
 * @typeParam E - error type
 * @typeParam Eval - eval Result
 */
interface ResultLazy<T, E, Eval extends Result<T, E>>
  extends c.And<T>, c.Or<E>, c.Map<T>, c.Filter<T> {
  /**
   * ```ts
   * console.log("[Example] (Lazy).andThen");
   *
   * const getNumber = () => Promise.resolve(ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? ok<number>(n) : err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Promise.resolve(ok(n.toFixed(2))))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  andThen<
    R extends Result<T2, E2>,
    T2 = AndT<R>,
    E2 = AndE<R, E>,
    Z extends Result<T2, E2> = ResultLazyEval<T2, E2, R, Eval>,
  >(fn: (value: T) => OrPromise<R>): ResultLazy<T2, E2, Z>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).and");
   *
   * const getNumber = () => Promise.resolve(ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? ok<number>(n) : err<number>(new Error("less than 0.5")))
   *   .and(Promise.resolve(ok("TOO LARGE")))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  and<
    R extends Result<T2, E2>,
    T2 = AndT<R>,
    E2 = AndE<R, E>,
    Z extends Result<T2, E2> = ResultLazyEval<T2, E2, R, Eval>,
  >(result: OrPromise<R>): ResultLazy<T2, E2, Z>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).orElse");
   *
   * const getNumber = () => Promise.resolve(ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? ok<number>(n) : err<number>(new Error("less than 0.5")))
   *   .andThen((n) => ok(n.toFixed(2)))
   *   .orElse((e) => {
   *     console.error(`Error: ${e}`);
   *     return Promise.resolve(ok("0.50"));
   *   })
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  orElse<
    R extends Result<T2, E2>,
    T2 = OrT<R, T>,
    E2 = OrE<R>,
    Z extends Result<T2, E2> = ResultLazyEval<T2, E2, R, Eval>,
  >(fn: (error: E) => OrPromise<R>): ResultLazy<T2, E2, Z>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).or");
   *
   * const getNumber = () => Promise.resolve(ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? ok<number>(n) : err<number>(new Error("less than 0.5")))
   *   .andThen((n) => ok(n.toFixed(2)))
   *   .or(Promise.resolve(ok("0.50")))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  or<
    R extends Result<T2, E2>,
    T2 = OrT<R, T>,
    E2 = OrE<R>,
    Z extends Result<T2, E2> = ResultLazyEval<T2, E2, R, Eval>,
  >(result: OrPromise<R>): ResultLazy<T2, E2, Z>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).map");
   *
   * const getNumber = () => Promise.resolve(ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? ok<number>(n) : err<number>(new Error("less than 0.5")))
   *   .map((n) => Promise.resolve(n.toFixed(2)))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  map<
    T2,
    Z extends Result<T2, E> = ResultLazyEval<
      T2,
      E,
      ResultInstance<T2, E>,
      Eval
    >,
  >(fn: (value: T) => OrPromise<T2>): ResultLazy<T2, E, Z>;

  filter<
    Z extends Result<T, E | Error> = ResultLazyEval<
      T,
      E | Error,
      ResultInstance<T, E | Error>,
      Eval
    >,
  >(isOk: (value: T) => OrPromise<boolean>): ResultLazy<T, E | Error, Z>;
  filter<
    E2,
    Z extends Result<T, E | E2> = ResultLazyEval<
      T,
      E | E2,
      ResultInstance<T, E | E2>,
      Eval
    >,
  >(
    isOk: (value: T) => OrPromise<boolean>,
    err: () => E2,
  ): ResultLazy<T, E | E2, Z>;
  filter<
    E2,
    Z extends Result<T, E | E2 | Error> = ResultLazyEval<
      T,
      E | E2 | Error,
      ResultInstance<T, E | E2 | Error>,
      Eval
    >,
  >(
    isOk: (value: T) => OrPromise<boolean>,
    err?: () => E2,
  ): ResultLazy<T, E | E2 | Error, Z>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Lazy).eval");
   *
   * const result: Result<number> = await Result.lazy(ok(1)).eval();
   *
   * console.debug(`Result: ${result}`);
   * ```
   */
  eval(): Promise<Eval>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(
   *   Result.lazy(ok(1)).toString(),
   *   "Lazy<Ok(1)>",
   * );
   *
   * assertEquals(
   *   Result.lazy(() => ok(1)).map((n) => n * 100).or(ok(0)).toString(),
   *   "Lazy<()=>ok(1).map((n)=>n * 100).or(Ok(0))>",
   * );
   * ```
   */
  toString(): string;
}

/**
 * Static Methods
 */
interface ResultStatic {
  /**
   * ```ts
   * import { ok } from "@askua/core/result";
   * import { assertEquals, assertObjectMatch } from "@std/assert";
   *
   * const result = ok("is ok");
   *
   * assertEquals(result.toString(), "Ok(is ok)");
   * assertObjectMatch(result, { ok: true, value: "is ok" });
   * assertEquals(Array.from(result), ["is ok"]);
   *
   * for (const value of result) {
   *   assertEquals(value, "is ok");
   * }
   * ```
   */
  ok: typeof ok;

  /**
   * ```ts
   * import { err } from "@askua/core/result";
   * import { assert, assertEquals, assertObjectMatch } from "@std/assert";
   *
   * const result = err("is error");
   *
   * assertEquals(result.toString(), "Err(is error)");
   * assertObjectMatch(result, { ok: false, error: "is error" });
   * assertEquals(Array.from(result), []);
   *
   * for (const _ of result) {
   *   assert(false);
   * }
   * ```
   */
  err: typeof err;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   *
   * console.log("[Example] Result.andThen");
   *
   * const getNumber = (count: number) => ok(Math.random())
   *   .andThen((n) => n >= 0.2 ? ok(n) : err<number>(new Error(`${count}: less than 0.2`)))
   *   .map((n) => n.toFixed(2));
   *
   * const fn = () => Result.andThen(
   *   () => getNumber(1),
   *   () => getNumber(2),
   *   () => getNumber(3),
   * );
   *
   * console.log(`Result: ${await fn()}`);
   * ```
   *
   * ```ts
   * import { Result } from "@askua/core/result";
   * import { assertEquals } from "@std/assert";
   *
   * const result = await Result.andThen(
   *   ok(1),
   *   () => ok(2),
   *   Promise.resolve(ok(3)),
   *   () => Promise.resolve(ok(4)),
   * ).then((r) => r.unwrap().join(", "));
   *
   * assertEquals(result, "1, 2, 3, 4");
   * ```
   */
  andThen: typeof andThen;

  /**
   * ```ts
   * console.log("[Example] Result.orElse");
   *
   * const getNumber = (count: number) => ok(Math.random())
   *   .andThen((n) => n >= 0.8 ? ok(n) : err<number>(new Error(`${count}: less than 0.8`)))
   *   .map((n) => n.toFixed(2));
   *
   * const fn = () => Result.orElse(
   *   () => getNumber(1),
   *   () => getNumber(2),
   *   () => getNumber(3),
   * );
   *
   * console.log(`Result: ${await fn()}`);
   * ```
   *
   * ```ts
   * import { Result } from "@askua/core/result";
   * import { assertEquals } from "@std/assert";
   *
   * const result = await Result.orElse(
   *   err<number>(new Error("1")),
   *   () => err<number>(new Error("2")),
   *   Promise.resolve(err<number>(new Error("3"))),
   *   () => Promise.resolve(ok<number>(4)),
   * ).then((r) => r.map((n) => n.toFixed(2)).unwrap());
   *
   * assertEquals(result, "4.00");
   * ```
   */
  orElse: typeof orElse;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] Result.lazy");
   *
   * const result = await Result.lazy(ok(1))
   *   .and(ok(2))
   *   .eval();
   *
   * console.log(`Result: ${result}`);
   * ```
   *
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] Result.lazy");
   *
   * const result = await Result.lazy(() => ok(1))
   *   .and(ok(2))
   *   .map((n) => n.toFixed(2))
   *   .eval();
   *
   * console.log(`Result: ${result}`);
   * ```
   */
  lazy: typeof lazy;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { some, none } from "@askua/core/option";
   *
   * const a: Ok<number> = Result.fromOption(some(1));
   * assertEquals(a, ok(1));
   *
   * const b: Err<Error> = Result.fromOption(none());
   * assertEquals(b, err(new Error("Option is None")));
   *
   * const c: Err<string> = Result.fromOption(none(), () => "ERR!");
   * assertEquals(c, err("ERR!"));
   * ```
   */
  fromOption: typeof fromOption;
}

/**
 * Result ToOption
 *
 * @deprecated use Option.fromResult()
 */
interface ToOption<T> {
  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Option } from "@askua/core/option";
   *
   * const some = ok("is ok").toOption();
   * assertEquals(some, Option.some("is ok"));
   *
   * const none = err("is error").toOption();
   * assertEquals(none, Option.none());
   * ```
   *
   * @deprecated use Option.fromResult()
   */
  toOption(): OptionInstance<T>;
}

/**
 * impl Ok<T, E>
 */
class _Ok<T, E> implements Ok<T>, ResultContext<T, E> {
  readonly ok = true;
  constructor(readonly value: T) {
  }

  toOption<O>(): O {
    return some(this.value) as O;
  }

  andThen<U, V>(fn: (v: T) => U): V {
    return fn(this.value) as never;
  }

  and<U, V>(result: U): V {
    return result as never;
  }

  orElse<U>(): U {
    return this as never;
  }

  or<U>(): U {
    return this as never;
  }

  map<U, V>(fn: (v: T) => U): V {
    return ok(fn(this.value)) as V;
  }

  filter<E2>(
    isOk: (v: T) => boolean,
    e: () => E2 = () => new Error("Filtered out") as E2,
  ): ResultInstance<T, E | E2> {
    if (isOk(this.value)) return this as never;
    return err(e());
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(): T {
    return this.value;
  }

  unwrapOrElse(): T {
    return this.value;
  }

  lazy<Z extends Result<T, E>>(): ResultLazy<T, E, Z> {
    return new _Lazy(this as never);
  }

  toString(): string {
    return `Ok(${this.value})`;
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
 * impl Err<T, E>
 */
class _Err<T, E> implements Err<E>, ResultContext<T, E> {
  readonly ok = false;
  constructor(readonly error: E) {}

  toOption<O>(): O {
    return none() as O;
  }

  andThen<U>(): U {
    return this as never;
  }

  and<U>(): U {
    return this as never;
  }

  map<U>(): U {
    return this as never;
  }

  filter(): ResultInstance<T, E> {
    return this;
  }

  orElse<U, V>(fn: (error: E) => U): V {
    return fn(this.error) as never;
  }

  or<U, V>(result: U): V {
    return result as never;
  }

  unwrap(): T {
    throw this.error;
  }

  unwrapOr<U>(value: U): U {
    return value;
  }

  unwrapOrElse<U>(fn: (error: E) => U): U {
    return fn(this.error);
  }

  lazy<Z extends Result<T, E>>(): ResultLazy<T, E, Z> {
    return new _Lazy(this as never);
  }

  toString(): string {
    return `Err(${this.error})`;
  }

  [Symbol.iterator](): Iterator<T> {
    return Object.assign(this, {
      next(): IteratorResult<T> {
        return { done: true, value: undefined };
      },
    });
  }
}

type Op<T, U, E, D> =
  | { andThen: (value: T) => OrPromise<Result<U, D>> }
  | { and: OrPromise<Result<U, D>> }
  | { orElse: (error: E) => OrPromise<Result<U, D>> }
  | { or: OrPromise<Result<U, D>> }
  | { map: (value: T) => OrPromise<U> }
  | { filter: (value: T) => OrPromise<boolean>; err?: () => E };

/**
 * impl Lazy<T, E, Eval>
 */
class _Lazy<T, E, Eval extends Result<T, E>> implements ResultLazy<T, E, Eval> {
  readonly op: Op<T, never, E, never>[] = [];

  constructor(
    readonly first: (() => Promise<Eval> | Eval) | Promise<Eval> | Eval,
  ) {
  }

  andThen<U, V>(andThen: U): V {
    this.op.push({ andThen } as typeof this.op[number]);
    return this as never;
  }

  and<U, V>(and: U): V {
    this.op.push({ and } as typeof this.op[number]);
    return this as never;
  }

  orElse<U, V>(orElse: U): V {
    this.op.push({ orElse } as typeof this.op[number]);
    return this as never;
  }

  or<U, V>(or: U): V {
    this.op.push({ or } as typeof this.op[number]);
    return this as never;
  }

  map<U, V>(map: U): V {
    this.op.push({ map } as typeof this.op[number]);
    return this as never;
  }

  filter<Op, E, U>(filter: Op, err?: E): U {
    this.op.push({ filter, err } as typeof this.op[number]);
    return this as never;
  }

  async eval(): Promise<Eval> {
    const p = typeof this.first === "function" ? this.first() : this.first;
    let result: Result<T, E> = p instanceof Promise ? await p : p;
    for (let i = 0; i < this.op.length; i++) {
      const op = this.op[i];

      if ("andThen" in op && result.ok) {
        const p = op.andThen(result.value);
        result = p instanceof Promise ? await p : p;
        continue;
      }

      if ("and" in op && result.ok) {
        result = op.and instanceof Promise ? await op.and : op.and;
        continue;
      }

      if ("orElse" in op && !result.ok) {
        const p = op.orElse(result.error);
        result = p instanceof Promise ? await p : p;
        continue;
      }

      if ("or" in op && !result.ok) {
        result = op.or instanceof Promise ? await op.or : op.or;
        continue;
      }

      if ("map" in op && result.ok) {
        const p = op.map(result.value);
        result = ok(p instanceof Promise ? await p : p);
        continue;
      }

      if ("filter" in op && result.ok) {
        const p = op.filter(result.value);
        const isOk = p instanceof Promise ? await p : p;
        if (!isOk) {
          const e = op.err ? op.err() : new Error("Filtered out") as E;
          result = err(e);
        }
      }
    }
    return result as Eval;
  }

  toString(): string {
    if (this.op.length === 0) return `Lazy<${this.first}>`;

    const op = this.op.map((op) =>
      Object.entries(op).map(([fn, arg]) => `${fn}(${arg})`)
    ).flat().join(".");

    return `Lazy<${this.first}.${op}>`;
  }
}

/**
 * impl ToInstance
 */
function toInstance<T, E>(result: Ok<T>): InferOk<ResultInstance<T, E>>;
function toInstance<T, E>(result: Err<E>): InferErr<ResultInstance<T, E>>;
function toInstance<T, E>(result: Result<T, E>): ResultInstance<T, E>;
function toInstance<T, E>(result: Ok<T> | Err<E>): ResultInstance<T, E>;
function toInstance<T, E>(result: Result<T, E>): ResultInstance<T, E> {
  return (result.ok ? ok(result.value) : err(result.error)) as ResultInstance<
    T,
    E
  >;
}

/**
 * ok is create Ok
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { ResultInstance } from "@askua/core/result";
 * import { ok } from "@askua/core/result";
 *
 * const a: ResultInstance<number> = ok(1);
 * assertEquals(a.map((n) => n + 1), ok(2));
 * ```
 *
 * @typeParam T value type
 * @typeParam E error type
 */
export function ok<T, E = Error>(value: T): InferOk<ResultInstance<T, E>> {
  return new _Ok(value);
}

/**
 * isOk is check Result is Ok
 *
 * ```ts
 * import { assert } from "@std/assert";
 * import { ok, isOk } from "@askua/core/result";
 *
 * const result = ok(1);
 * assert(isOk(result));
 * ```
 *
 * @typeParam T value type
 * @typeParam E error type
 */
export function isOk<T, E>(
  result: Result<T, E>,
): result is InferOk<typeof result>;
/**
 * @typeParam T value type
 * @typeParam E error type
 */
export function isOk<T, E>(
  result: ResultInstance<T, E>,
): result is InferOk<typeof result>;
export function isOk<T, E>({ ok }: Result<T, E>) {
  return ok;
}

/**
 * err is create Err
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { ResultInstance } from "@askua/core/result";
 * import { err } from "@askua/core/result";
 *
 * const a: ResultInstance<number> = err(new Error("error"));
 * assertEquals(a.map((n) => n + 1), err(new Error("error")));
 * ```
 *
 * @typeParam T value type
 * @typeParam E error type
 */
export function err<T = never, E = Error>(
  error: E,
): InferErr<ResultInstance<T, E>> {
  return new _Err(error);
}

/**
 * isErr is check Result is Err
 *
 * ```ts
 * import { assert } from "@std/assert";
 * import { err, isErr } from "@askua/core/result";
 *
 * const result = err(new Error("error"));
 * assert(isErr(result));
 * ```
 *
 * @typeParam T value type
 * @typeParam E error type
 */
export function isErr<T, E>(
  result: Result<T, E>,
): result is InferErr<typeof result>;
/**
 * @typeParam T value type
 * @typeParam E error type
 */
export function isErr<T, E>(
  result: ResultInstance<T, E>,
): result is InferErr<typeof result>;
export function isErr<T, E>({ ok }: Result<T, E>) {
  return !ok;
}

async function andThen<
  R extends Fn[number] extends (() => OrPromise<infer R>) | OrPromise<infer R>
    ? (R extends ResultInstance<unknown, unknown> ? ResultInstance<T, E>
      : (R extends Result<unknown, unknown> ? Result<T, E> : unknown))
    : unknown,
  Fn extends {
    [K in keyof T]:
      | OrPromise<Result<T[K], E>>
      | (() => OrPromise<Result<T[K], E>>);
  }[number][] = R extends ResultInstance<infer T, infer E>
    ? (T extends unknown[] ? {
        [K in keyof T]:
          | OrPromise<ResultInstance<T[K], E>>
          | (() => OrPromise<ResultInstance<T[K], E>>);
      }
      : never)
    : (R extends Result<infer T, infer E> ? (T extends unknown[] ? {
          [K in keyof T]:
            | OrPromise<Result<T[K], E>>
            | (() => OrPromise<Result<T[K], E>>);
        }
        : never)
      : never),
  T extends unknown[] = ({
    [K in keyof Fn]: Fn[K] extends
      OrPromise<infer R> | (() => OrPromise<infer R>)
      ? (R extends Ok<unknown> ? AndT<R> : never)
      : never;
  }),
  E = ({
    [K in keyof Fn]: Fn[K] extends
      OrPromise<infer R> | (() => OrPromise<infer R>)
      ? (R extends ResultInstance<unknown, infer E> ? AndE<R, E>
        : (R extends Err<infer E> ? AndE<R, E> : unknown))
      : unknown;
  })[number],
>(
  ...fn: Fn
): Promise<R> {
  const values: T[number][] = new Array(fn.length);
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: OrPromise<Result<T[number], E>> = typeof f === "function"
      ? f()
      : f;
    const result = p instanceof Promise ? await p : p;
    if (result.ok) {
      values[i] = result.value;
    } else {
      return result as R;
    }
  }
  return ok(values) as never;
}

async function orElse<
  R extends Fn[number] extends (() => infer R) | infer R
    ? (Awaited<R> extends ResultInstance<infer _, infer _>
      ? ResultInstance<T, E>
      : Result<T, E>)
    : never,
  F extends
    | OrPromise<Result<T, E>>
    | (() => OrPromise<Result<T, E>>) =
      | OrPromise<R>
      | (() => OrPromise<R>),
  Fn extends [F, ...F[]] = [F, ...F[]],
  T extends unknown = ({
    [K in keyof Fn]: Fn[K] extends (() => infer R) | infer R
      ? (Awaited<R> extends Result<unknown, unknown> ? OrT<Awaited<R>, never>
        : never)
      : never;
  })[number],
  E extends unknown = ({
    [K in keyof Fn]: Fn[K] extends (() => infer R) | infer R
      ? (Awaited<R> extends Result<unknown, unknown> ? OrE<Awaited<R>> : never)
      : never;
  })[number],
>(...fn: Fn): Promise<R> {
  let last;
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: OrPromise<Result<T, E>> = typeof f === "function" ? f() : f;
    const result = p instanceof Promise ? await p : p;
    if (result.ok) {
      return result as R;
    }
    last = result;
  }
  return last as R;
}

function lazy<
  R extends Eval,
  Fn extends OrPromise<Eval> | (() => OrPromise<Eval>) =
    | OrPromise<R>
    | (() => OrPromise<R>),
  Eval extends Result<T, E> = Fn extends
    OrPromise<infer R> | (() => OrPromise<infer R>) ? R : never,
  T = NextT<Eval, never>,
  E = Eval extends ResultInstance<unknown, infer E> ? NextE<Eval, E>
    : NextE<Eval, never>,
>(result: Fn): ResultLazy<T, E, Eval> {
  return new _Lazy(result);
}

function fromOption<T>(
  option: Some<T>,
): InferOk<ResultInstance<T, Error>>;
function fromOption<T>(
  option: None,
): InferErr<ResultInstance<T, Error>>;
function fromOption<T, E = Error>(
  option: None,
  e: () => E,
): InferErr<ResultInstance<T, E>>;
function fromOption<T>(
  option: Option<T>,
): ResultInstance<T, Error>;
function fromOption<T, E = Error>(
  option: Option<T>,
  e: () => E,
): ResultInstance<T, E>;
function fromOption<T, E>(
  option: Option<T>,
  e?: () => E,
): ResultInstance<T, E> {
  if (option.some) return ok(option.value);
  return e ? err(e()) : err(new Error("Option is None") as E);
}
