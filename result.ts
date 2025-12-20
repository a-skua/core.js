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
 *   .unwrap(() => 0);
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
 *   .unwrap(() => "0.00");
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
 *   .filter((n) => n >= 0.5, () => new Error("less than 0.5"))
 *   .or((e) => {
 *     console.error(`Error: ${e}`);
 *     return ok(-1);
 *   });
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
 * console.log(result.unwrap(() => "0.00"));
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import { none, some } from "./option.ts";
import type { None, Option, OptionInstance, Some } from "./option.ts";
import type { OrFunction, OrPromise } from "./types.ts";

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

type OkInstance<T> = Ok<T> & ResultContext<T, never>;

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
  ResultContext<infer T, infer _> ? OkInstance<T>
  : Ok<R extends Ok<infer T> ? T : never>;

type ErrInstance<E> = Err<E> & ResultContext<never, E>;

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
  ResultContext<infer _, infer E> ? ErrInstance<E>
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
 * Motivation:
 * ```ts
 * JSON.stringify(ok(1));           // '{"value":1,"ok":true}'
 * JSON.stringify(err("is error")); // '{"error":"is error","ok":false}'
 * JSON.stringify([0, 1]);          // '[0,1]'
 * JSON.stringify([1, "is error"]); // '[1,"is error"]'
 * ```
 */
export type SerializedResult<T, E> = [1, T] | [0, E];

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
 * ### and
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { ResultInstance } from "@askua/core/result";
 * import { Result, ok } from "@askua/core/result";
 *
 * const a: ResultInstance<[number, number, number, number]> = await Result.and(
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
 * ### or
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { ResultInstance } from "@askua/core/result";
 * import { Result, ok } from "@askua/core/result";
 *
 * const a = await Result.or(
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
 *   .or(() => ok(2))
 *   .map((n) => n.toFixed(2))
 *   .eval();
 *
 * assertEquals(result, ok("1.00"));
 * ```
 *
 * ### fromNullable
 *
 * DEPRECATED: use `Option.fromNullable` and `Result.fromOption`
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Result, ok } from "@askua/core/result";
 *
 * const a = Result.fromNullable(1);
 * const b = ok(1);
 *
 * assertEquals(a, b);
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
 * ### try
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Result, ok, err } from "@askua/core/result";
 *
 * {
 *   const a = Result.try(() => {
 *     throw new Error("error");
 *   });
 *   const b = err(new Error("error"));
 *
 *   assertEquals(a, b);
 * }
 *
 * {
 *   const a = Result.try(() => 1);
 *   const b = ok(1);
 *
 *   assertEquals(a, b);
 * }
 * ```
 *
 * ## Instance Methods
 *
 * ### and
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).and((n) => ok(n + 1)),
 *   ok(2),
 * );
 *
 * assertEquals(
 *   ok(1).and(() => ok(2)),
 *   ok(2),
 * );
 *
 * assertEquals(
 *   err("error").and((n) => ok(n + 1)),
 *   err("error"),
 * );
 * ```
 *
 * ### or
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   ok(1).or(() => ok(2)),
 *   ok(1),
 * );
 *
 * assertEquals(
 *   err("error").or(() => ok(2)),
 *   ok(2),
 * );
 * ```
 *
 * ### map
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
 * ### filter
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
 * ### unwrap
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
 * assertEquals(
 *   err("error").unwrap(() => 1),
 *   1,
 * );
 *
 * assertThrows(() => err(new Error("error")).unwrap());
 * ```
 *
 * ### lazy
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
 * ### [Symbol.iterator]
 *
 * ```ts
 * import { assertEquals, assertThrows } from "@std/assert";
 * import { ok, err } from "@askua/core/result";
 *
 * assertEquals(
 *   [...ok(1)],
 *   [1],
 * );
 *
 * assertThrows(() => [...err("error")]);
 * ```
 *
 * ### toString
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
  {
    ok,
    err,
    and,
    or,
    andThen: and,
    orElse: or,
    lazy,
    fromOption,
    fromNullable,
    try: tryCatch,
  },
);

type InferResult<R extends Result<unknown, unknown>, T, E> = R extends
  ResultInstance<unknown, unknown> ? ResultInstance<T, E> : Result<T, E>;

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
    c.Or<T>,
    c.Map<T>,
    c.Filter<T>,
    c.Unwrap<T> {
  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).andThen");
   *
   * const fn = () => ok(Math.random())
   *   .and((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .and((n) => ok(n.toFixed(2)));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   * @deprecated
   */
  andThen<R extends Result<T2, E2>, T2 = AndT<R>, E2 = AndE<R, E>>(
    fn: (value: T) => R,
  ): InferResult<R, T2, E2>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).and");
   *
   * const fn = () => ok(Math.random())
   *   .and((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .and(() => ok("TOO LARGE"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  and<R extends Result<T2, E2>, T2 = AndT<R>, E2 = AndE<R, E>>(
    andThen: (value: T) => R,
  ): InferResult<R, T2, E2>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).orElse");
   *
   * const fn = () => ok(Math.random())
   *   .and((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .and((n) => ok(n.toFixed(2)))
   *   .or((e) => {
   *     console.error(`Error: ${e}`);
   *     return ok(0);
   *   })
   *
   * console.log(`Result: ${fn()}`);
   * ```
   * @deprecated
   */
  orElse<R extends Result<T2, E2>, T2 = OrT<R, T>, E2 = OrE<R>>(
    fn: (error: E) => R,
  ): InferResult<R, T2, E2>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).or");
   *
   * const fn = () => ok(Math.random())
   *   .and((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .and((n) => ok(n.toFixed(2)))
   *   .or(() => ok(0));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  or<R extends Result<T2, E2>, T2 = OrT<R, T>, E2 = OrE<R>>(
    orElse: (error: E) => R,
  ): InferResult<R, T2, E2>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).map");
   *
   * const fn = () => ok(Math.random())
   *   .and((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .map((n) => n.toFixed(2))
   *   .or(() => ok("0.00"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  map<T2>(fn: (value: T) => T2): ResultInstance<T2, E>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).filter");
   *
   * const fn = () => ok(Math.random())
   *   .filter((n) => n >= 0.5, () => new Error("less than 0.5"))
   *   .map((n) => n.toFixed(2))
   *   .or(() => ok("0.00"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  filter<IsOk extends boolean>(
    isOk: (value: T) => IsOk,
  ): ResultInstance<T, T | E>;
  filter<E2, IsOk extends boolean = boolean>(
    isOk: (value: T) => IsOk,
    err: (value: T) => E2,
  ): ResultInstance<T, E | E2>;
  filter<E2, IsOk extends boolean = boolean>(
    isOk: (value: T) => IsOk,
    err?: (value: T) => E2,
  ): ResultInstance<T, T | E | E2>;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).unwrap");
   *
   * const fn = () => ok(Math.random())
   *   .and((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .and((n) => ok(n.toFixed(2)))
   *   .or(() => ok("0.00"))
   *   .unwrap();
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  unwrap<U>(orElse: (error: E) => U): T | U;
  unwrap(): T;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).unwrapOr");
   *
   * const fn = () => ok(Math.random())
   *   .and((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .and((n) => ok(n.toFixed(2)))
   *   .unwrap(() => "0.00");
   *
   * console.log(`Result: ${fn()}`);
   * ```
   *
   * @deprecated use `unwrap(() => U)`
   */
  unwrapOr<T2>(value: T2): T | T2;

  /**
   * ```ts
   * import { Result } from "@askua/core/result";
   * console.log("[Example] (Result).unwrapOrElse");
   *
   * const fn = () => ok(Math.random())
   *   .and((n) => n >= 0.5 ? ok(n) : err<number>(new Error("less than 0.5")))
   *   .and((n) => ok(n.toFixed(2)))
   *   .unwrap((e) => {
   *     console.error(`Error: ${e}`);
   *     return "0.00";
   *   });
   *
   * console.log(`Result: ${fn()}`);
   * ```
   *
   * @deprecated use `unwrap(() => U)`
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
   * const result = await ok(1).lazy().and(() => (ok(2))).eval();
   * assertEquals(result, ok(2));
   * ```
   */
  lazy(): ResultLazy<ResultInstance<T, E>, T, E>;
}

type InferResultLazy<
  Eval extends Result<unknown, unknown>,
  T,
  E,
> = ResultLazy<InferResult<Eval, T, E>, T, E>;

/**
 * Result Lazy eval
 *
 * @typeParam T - value type
 * @typeParam E - error type
 * @typeParam Eval - eval Result
 */
export interface ResultLazy<
  Eval extends Result<T, E>,
  T = NextT<Eval, never>,
  E = NextE<Eval, never>,
> extends c.And<T>, c.Or<T>, c.Map<T>, c.Filter<T> {
  /**
   * ```ts
   * console.log("[Example] (Lazy).andThen");
   *
   * const getNumber = () => Promise.resolve(ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .and((n) => n >= 0.5 ? ok<number>(n) : err<number>(new Error("less than 0.5")))
   *   .and((n) => Promise.resolve(ok(n.toFixed(2))))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   *
   * @deprecated use `and` method
   */
  andThen<
    Next extends Result<T2, E2>,
    T2 = AndT<Next>,
    E2 = AndE<Next, E>,
  >(andThen: (value: T) => OrPromise<Next>): InferResultLazy<Next, T2, E2>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).and");
   *
   * const getNumber = () => Promise.resolve(ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .and((n) => n >= 0.5 ? ok<number>(n) : err<number>(new Error("less than 0.5")))
   *   .and(() => Promise.resolve(ok("TOO LARGE")))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  and<
    Next extends Result<T2, E2>,
    T2 = AndT<Next>,
    E2 = AndE<Next, E>,
  >(andThen: (value: T) => OrPromise<Next>): InferResultLazy<Next, T2, E2>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).orElse");
   *
   * const getNumber = () => Promise.resolve(ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .and((n) => n >= 0.5 ? ok<number>(n) : err<number>(new Error("less than 0.5")))
   *   .and((n) => ok(n.toFixed(2)))
   *   .or((e) => {
   *     console.error(`Error: ${e}`);
   *     return Promise.resolve(ok("0.50"));
   *   })
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   *
   * @deprecated use `or` method
   */
  orElse<
    Next extends Result<T2, E2>,
    T2 = OrT<Next, T>,
    E2 = OrE<Next>,
  >(orElse: (error: E) => OrPromise<Next>): InferResultLazy<Next, T2, E2>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).or");
   *
   * const getNumber = () => Promise.resolve(ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .and((n) => n >= 0.5 ? ok<number>(n) : err<number>(new Error("less than 0.5")))
   *   .and((n) => ok(n.toFixed(2)))
   *   .or(() => Promise.resolve(ok("0.50")))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  or<
    Next extends Result<T2, E2>,
    T2 = OrT<Next, T>,
    E2 = OrE<Next>,
  >(orElse: (error: E) => OrPromise<Next>): InferResultLazy<Next, T2, E2>;

  /**
   * ```ts
   * console.log("[Example] (Lazy).map");
   *
   * const getNumber = () => Promise.resolve(ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .and((n) => n >= 0.5 ? ok<number>(n) : err<number>(new Error("less than 0.5")))
   *   .map((n) => Promise.resolve(n.toFixed(2)))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  map<
    T2,
  >(fn: (value: T) => OrPromise<T2>): InferResultLazy<Eval, T2, E>;

  filter<IsOk extends boolean>(
    isOk: (value: T) => OrPromise<IsOk>,
  ): InferResultLazy<Eval, T, T | E>;
  filter<
    E2,
    IsOk extends boolean = boolean,
  >(
    isOk: (value: T) => OrPromise<IsOk>,
    err: (value: T) => E2,
  ): InferResultLazy<Eval, T, E | E2>;
  filter<
    E2,
    IsOk extends boolean = boolean,
  >(
    isOk: (value: T) => OrPromise<IsOk>,
    err?: (value: T) => E2,
  ): InferResultLazy<Eval, T, T | E | E2>;

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
   *   Result.lazy(() => ok(1)).map((n) => n * 100).or(() => ok(0)).toString(),
   *   "Lazy<()=>ok(1).map((n)=>n * 100).or(()=>ok(0))>",
   * );
   * ```
   */
  toString(): string;
}

/**
 * Static Methods
 */
export interface ResultStatic {
  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(Result.ok(1), ok(1));
   * ```
   */
  ok: typeof ok;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(Result.err("is error"), err("is error"));
   * ```
   */
  err: typeof err;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await Result.and(
   *   ok(1),
   *   () => ok(2),
   *   Promise.resolve(ok(3)),
   *   () => Promise.resolve(ok(4)),
   * );
   * assertEquals(a, ok([1, 2, 3, 4]));
   *
   * const b = await Result.and(
   *   ok(1),
   *   () => ok(2),
   *   Promise.resolve(ok(3)),
   *   () => Promise.resolve(err("is error")),
   * );
   * assertEquals(b, err("is error"));
   * ```
   */
  and: typeof and;

  /**
   * @deprecated use `and` method
   */
  andThen: typeof and;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await Result.or(
   *   ok(1),
   *   () => ok(2),
   *   Promise.resolve(ok(3)),
   *   () => Promise.resolve(ok(4)),
   * );
   * assertEquals(a, ok(1));
   *
   * const b = await Result.or(
   *   err("is error"),
   *   () => err("is error"),
   *   Promise.resolve(err("is error")),
   *   () => Promise.resolve(ok(4)),
   * );
   * assertEquals(b, ok(4));
   * ```
   */
  or: typeof or;

  /**
   * @deprecated use `or` method
   */
  orElse: typeof or;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const result = await Result.lazy(Promise.resolve(ok(1)))
   *   .map((n) => n + 1)
   *   .map((n) => n * 2)
   *   .eval();
   * assertEquals(result, ok(4));
   * ```
   */
  lazy: typeof lazy;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { some, none } from "@askua/core/option";
   *
   * const a = Result.fromOption(some(1));
   * assertEquals(a, ok(1));
   *
   * const b = Result.fromOption(none());
   * assertEquals(b, err(new Error("Option is None")));
   *
   * const c = Result.fromOption(none(), () => "ERR!");
   * assertEquals(c, err("ERR!"));
   * ```
   */
  fromOption: typeof fromOption;

  /**
   * @deprecated use `Option.fromNullable` and `Result.fromOption`
   */
  fromNullable: typeof fromNullable;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = Result.try(() => {
   *   return "is ok";
   * });
   * assertEquals(a, ok("is ok"));
   *
   * const b = Result.try(() => {
   *   throw new Error("is error");
   * });
   * assertEquals(b, err(new Error("is error")));
   * ```
   */
  try: typeof tryCatch;
}

/**
 * @deprecated use Option.fromResult()
 */
interface ToOption<T> {
  /**
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

  andThen<U>(fn: (value: T) => U) {
    return fn(this.value) as never;
  }

  and<U>(andThen: (value: T) => U) {
    return andThen(this.value) as never;
  }

  orElse() {
    return this as never;
  }

  or() {
    return this as never;
  }

  map<U, V>(fn: (v: T) => U): V {
    return ok(fn(this.value)) as V;
  }

  filter(
    isOk: (v: T) => boolean,
    onErr = (v: T) => v,
  ) {
    if (isOk(this.value)) return this as never;
    return err(onErr(this.value));
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

  lazy() {
    return new _Lazy(this) as never;
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

  andThen() {
    return this as never;
  }

  and() {
    return this as never;
  }

  map() {
    return this as never;
  }

  filter() {
    return this as never;
  }

  orElse<U>(orElse: (error: E) => U) {
    return orElse(this.error) as never;
  }

  or<U>(orElse: (error: E) => U) {
    return orElse(this.error) as never;
  }

  unwrap<U>(orElse: (error: E) => U): T | U;
  unwrap(): T;
  unwrap<U>(orElse?: (error: E) => U): T | U {
    if (orElse) return orElse(this.error);

    if (this.error instanceof Error) throw this.error;

    throw new Error(`${this.error}`);
  }

  unwrapOr<U>(value: U): U {
    return value;
  }

  unwrapOrElse<U>(fn: (error: E) => U): U {
    return fn(this.error);
  }

  lazy() {
    return new _Lazy(this) as never;
  }

  toString(): string {
    return `Err(${this.error})`;
  }

  [Symbol.iterator](): Iterator<T> {
    throw this.error;
  }
}

type Op<T, E> =
  | { andThen: <U = never, D = never>(value: T) => OrPromise<Result<U, D>> }
  | { and: <U = never, D = never>(value: T) => OrPromise<Result<U, D>> }
  | { orElse: <U = never, D = never>(error: E) => OrPromise<Result<U, D>> }
  | { or: <U = never, D = never>(error: E) => OrPromise<Result<U, D>> }
  | { map: <U = never>(value: T) => OrPromise<U> }
  | {
    filter: (value: T) => OrPromise<boolean>;
    onErr: <D = never>(value: T) => D;
  };

/**
 * impl Lazy<T, E, Eval>
 */
class _Lazy<T, E, Eval extends Result<T, E>> implements ResultLazy<Eval, T, E> {
  readonly op: Op<T, E>[] = [];

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

  orElse<U>(orElse: U) {
    this.op.push({ orElse } as typeof this.op[number]);
    return this as never;
  }

  or<U>(or: U) {
    this.op.push({ or } as typeof this.op[number]);
    return this as never;
  }

  map<U>(map: U) {
    this.op.push({ map } as typeof this.op[number]);
    return this as never;
  }

  filter<Op, E>(filter: Op, onErr: (v: T) => E = (v) => v as never) {
    this.op.push({ filter, onErr } as typeof this.op[number]);
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
        const p = op.and(result.value);
        result = p instanceof Promise ? await p : p;
        continue;
      }

      if ("orElse" in op && !result.ok) {
        const p = op.orElse(result.error);
        result = p instanceof Promise ? await p : p;
        continue;
      }

      if ("or" in op && !result.ok) {
        const p = op.or(result.error);
        result = p instanceof Promise ? await p : p;
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
          const e = op.onErr(result.value);
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
  result: ResultInstance<T, E>,
): result is InferOk<typeof result>;
/**
 * @typeParam T value type
 * @typeParam E error type
 */
export function isOk<T, E>(
  result: Result<T, E>,
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
  result: ResultInstance<T, E>,
): result is InferErr<typeof result>;
/**
 * @typeParam T value type
 * @typeParam E error type
 */
export function isErr<T, E>(
  result: Result<T, E>,
): result is InferErr<typeof result>;
export function isErr<T, E>({ ok }: Result<T, E>) {
  return !ok;
}

async function and<
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

async function or<
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
  Fn extends OrFunction<OrPromise<Eval>>,
  Eval extends Result<T, E> = Fn extends OrFunction<OrPromise<infer R>> ? R
    : never,
  T = NextT<Eval, never>,
  E = NextE<Eval, never>,
>(result: Fn): ResultLazy<Eval, T, E> {
  return new _Lazy(result);
}

function fromOption<T>(o: Some<T>): InferOk<ResultInstance<T, Error>>;
function fromOption<T>(o: None): InferErr<ResultInstance<T, Error>>;
function fromOption<T, E = Error>(
  o: None,
  e: () => E,
): InferErr<ResultInstance<T, E>>;
function fromOption<T>(o: Option<T>): ResultInstance<T, Error>;
function fromOption<T, E = Error>(
  o: Option<T>,
  e: () => E,
): ResultInstance<T, E>;
function fromOption<T, E>(o: Option<T>, e?: () => E): ResultInstance<T, E> {
  if (o.some) return ok(o.value);
  return e ? err(e()) : err(new Error("Option is None") as E);
}

function fromNullable<T>(v: NonNullable<T>): InferOk<ResultInstance<T>>;
function fromNullable<T, E>(
  v: NonNullable<T>,
  e: () => E,
): InferOk<ResultInstance<T, E>>;
function fromNullable<T, E>(
  v: null | undefined,
): InferErr<ResultInstance<T, Error>>;
function fromNullable<T, E>(
  v: null | undefined,
  e: () => E,
): InferErr<ResultInstance<T, E>>;
function fromNullable<T, E>(
  v: T | null | undefined,
): ResultInstance<T, Error>;
function fromNullable<T, E>(
  v: T | null | undefined,
  e: () => E,
): ResultInstance<T, E>;
function fromNullable<T, E>(
  v: T | null | undefined,
  e?: () => E,
): ResultInstance<T, E | Error>;
function fromNullable<T>(
  v: T | null | undefined,
  e?: () => Error,
): ResultInstance<T, Error> {
  if (v === null || v === undefined) {
    return err(e ? e() : new Error("Nullable"));
  }
  return ok(v);
}

function tryCatch<T, E = unknown>(
  fn: () => T,
): T extends Promise<infer U> ? Promise<ResultInstance<U, E>>
  : ResultInstance<T, E>;
function tryCatch<T, E = unknown>(
  fn: () => T | Promise<T>,
): ResultInstance<T, E> | Promise<ResultInstance<T, E>> {
  try {
    const v = fn();
    if (v instanceof Promise) {
      return v.then((v) => ok(v)).catch((e) => err(e));
    }
    return ok(v);
  } catch (e) {
    return err(e as E);
  }
}
