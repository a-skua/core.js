/**
 * Result type represented as plain objects for JSON serialization compatibility.
 *
 * This module provides {@link Result}<T, E> = {@link Ok}<T> | {@link Err}<E>,
 * and {@link ResultInstance}<T, E> with chainable methods.
 *
 * ## Why Object-based?
 *
 * Object-based representation allows seamless JSON serialization between server and browser:
 *
 * ```ts
 * const json = '{"ok":true,"value":1}';
 * const result: Result<number> = JSON.parse(json);
 * if (result.ok) {
 *   console.log(result.value); // 1
 * }
 * ```
 *
 * @example Basic usage
 * ```ts
 * import { ok } from "@askua/core/result";
 *
 * const value = ok(Math.random())
 *   .filter((n) => n >= 0.5, (n) => new Error(`too small: ${n}`))
 *   .map((n) => n.toFixed(2))
 *   .unwrap(() => "0.00");
 * ```
 *
 * @example Async operations with lazy
 * ```ts
 * import { Result, ok } from "@askua/core/result";
 *
 * const result = await Result.lazy(Promise.resolve(ok(1)))
 *   .map((n) => n + 1)
 *   .eval();
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import type { None, Option, Some } from "./option.ts";
import type {
  InferReturnTypeOr,
  NonEmptyArray,
  OrFunction,
  OrPromise,
} from "./types.ts";

/**
 * Represents a {@link Result} that contains a success value.
 *
 * @example
 * ```ts
 * import { ok, type Ok } from "@askua/core/result";
 *
 * const a: Ok<number> = { ok: true, value: 1 };
 * const b: Ok<number> = ok(1);
 * ```
 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/**
 * {@link Ok} with {@link ResultContext} methods.
 *
 * @example
 * ```ts
 * import { ok, type OkInstance } from "@askua/core/result";
 *
 * const a: OkInstance<number> = ok(1);
 * a.map((n) => n + 1);
 * ```
 */
export type OkInstance<T, E = Error> = Ok<T> & ResultContext<T, E>;

/**
 * Infers {@link Ok} or {@link OkInstance} based on the input {@link Result} type.
 *
 * @example
 * ```ts
 * import type { Result, ResultInstance, InferOk } from "@askua/core/result";
 *
 * type A = InferOk<Result<string, Error>, number, Error>;       // Ok<number>
 * type B = InferOk<ResultInstance<string, Error>, number, Error>; // OkInstance<number, Error>
 * ```
 */
export type InferOk<R extends Result<unknown, unknown>, T, E> = R extends
  ResultContext<unknown, unknown> ? OkInstance<T, E> : Ok<T>;

/**
 * Creates an {@link OkInstance} containing the given value.
 *
 * @example
 * ```ts
 * import { ok } from "@askua/core/result";
 *
 * const a = ok(1);
 * const b = ok(1).map((n) => n + 1); // ok(2)
 * ```
 */
export function ok<T, E = never>(
  value: T,
): OkInstance<T, E> {
  return new _Ok(value);
}

/**
 * Type guard that checks if a {@link Result} is {@link Ok}.
 *
 * @example
 * ```ts
 * import { ok, isOk, type Result } from "@askua/core/result";
 *
 * const a: Result<number> = ok(1);
 * if (isOk(a)) {
 *   console.log(a.value); // number
 * }
 * ```
 */
export function isOk<T, E>(
  result: Result<T, E>,
): result is InferOk<typeof result, T, E> {
  return result.ok;
}

/**
 * Represents a {@link Result} that contains an error.
 *
 * @example
 * ```ts
 * import { err, type Err } from "@askua/core/result";
 *
 * const a: Err<string> = { ok: false, error: "is error" };
 * const b: Err<string> = err("is error");
 * ```
 */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * {@link Err} with {@link ResultContext} methods.
 *
 * @example
 * ```ts
 * import { err, type ErrInstance } from "@askua/core/result";
 *
 * const a: ErrInstance<number, string> = err("is error");
 * a.map((n) => n + 1);
 * ```
 */
export type ErrInstance<T, E> = Err<E> & ResultContext<T, E>;

/**
 * Infers {@link Err} or {@link ErrInstance} based on the input {@link Result} type.
 *
 * @example
 * ```ts
 * import type { Result, ResultInstance, InferErr } from "@askua/core/result";
 *
 * type A = InferErr<Result<number, string>, number, string>;       // Err<string>
 * type B = InferErr<ResultInstance<number, string>, number, string>; // ErrInstance<number, string>
 * ```
 */
export type InferErr<R extends Result<unknown, unknown>, T, E> = R extends
  ResultContext<unknown, unknown> ? ErrInstance<T, E> : Err<E>;

/**
 * Creates an {@link ErrInstance} containing the given error.
 *
 * @example
 * ```ts
 * import { err, ok } from "@askua/core/result";
 *
 * const a = err(new Error("error"));
 * const b = err<number>(new Error("error")).or(() => ok(0)); // ok(0)
 * ```
 */
export function err<T, E = Error>(
  error: E,
): InferErr<ResultInstance<T, E>, T, E> {
  return new _Err(error);
}

/**
 * Type guard that checks if a {@link Result} is {@link Err}.
 *
 * @example
 * ```ts
 * import { err, isErr, type Result } from "@askua/core/result";
 *
 * const a: Result<number> = err(new Error("error"));
 * if (isErr(a)) {
 *   console.log(a.error); // Error
 * }
 * ```
 */
export function isErr<T, E>(
  result: Result<T, E>,
): result is InferErr<typeof result, T, E> {
  return !result.ok;
}

/**
 * Union of {@link Ok} or {@link Err}
 *
 * @example Plain Object
 * ```ts
 * import type { Result } from "@askua/core/result";
 *
 * const a: Result<number> = { ok: true, value: 1 };
 * const b: Result<number> = { ok: false, error: new Error("error") };
 * ```
 *
 * @example Converted to Instance
 * ```ts
 * import { Result, type ResultInstance } from "@askua/core/result";
 *
 * const plain: Result<number> = { ok: true, value: 1 };
 * const b: Result<number> = Result(plain);
 * ```
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;
export const Result: ResultToInstance & ResultStatic = Object.assign(
  toInstance,
  {
    ok,
    err,
    and: (...results: never[]) => and(results),
    or: (...results: never[]) => or(results),
    lazy,
    fromOption,
    try: tryCatch,
  } as never,
);

/**
 * Infers {@link Result} or {@link ResultInstance} based on the input type.
 *
 * @example
 * ```ts
 * import type { Result, ResultInstance, InferResult } from "@askua/core/result";
 *
 * type A = InferResult<Result<unknown, unknown>, number, string>;       // Result<number, string>
 * type B = InferResult<ResultInstance<unknown, unknown>, number, string>; // ResultInstance<number, string>
 * ```
 */
export type InferResult<R extends Result<unknown, unknown>, T, E> = R extends
  ResultInstance<unknown, unknown> ? ResultInstance<T, E> : Result<T, E>;

/**
 * {@link Result} with chainable {@link ResultContext} methods.
 *
 * @example
 * ```ts
 * import { ok, type ResultInstance } from "@askua/core/result";
 *
 * const a: ResultInstance<number> = ok(1);
 * const b = a
 *   .filter((n) => n > 0, () => new Error("not positive"))
 *   .map((n) => n + 1)
 *   .unwrap(() => 0);
 * ```
 */
export type ResultInstance<T, E = Error> = Result<T, E> & ResultContext<T, E>;

/**
 * WIP
 *
 * @example
 * ```ts
 * JSON.stringify(ok(1));           // '{"value":1,"ok":true}'
 * JSON.stringify(err("is error")); // '{"error":"is error","ok":false}'
 * JSON.stringify([0, 1]);          // '[0,1]'
 * JSON.stringify([1, "is error"]); // '[1,"is error"]'
 * ```
 */
export type SerializedResult<T, E> = [1, T] | [0, E];

/**
 * Callable signature for converting {@link Result} to {@link ResultInstance}.
 *
 * @example
 * ```ts
 * import { Result, ok, type ResultInstance } from "@askua/core/result";
 *
 * const plain = { ok: true, value: 1 } as const;
 * const instance: ResultInstance<number> = Result(plain);
 * ```
 */
export type ResultToInstance = {
  <T, E = never>(ok: Ok<T>): OkInstance<T, E>;
  <T, E>(err: Err<E>): ErrInstance<T, E>;
  <T, E>(result: Result<T, E>): ResultInstance<T, E>;
};

type InferT<R extends Result<unknown, unknown>, T = never> = R extends
  Ok<infer U> ? T | U
  : (R extends Err<unknown> ? T
    : (R extends Result<infer U, unknown> ? T | U : unknown));

type InferE<R extends Result<unknown, unknown>, E = never> = R extends
  Ok<unknown> ? E
  : (R extends Err<infer F> ? E | F
    : (R extends Result<unknown, infer F> ? E | F : E));

type AndT<R extends Result<unknown, unknown>> = InferT<R>;
type AndE<R extends Result<unknown, unknown>, E> = InferE<R, E>;

type OrT<R extends Result<unknown, unknown>, T> = InferT<R, T>;
type OrE<R extends Result<unknown, unknown>> = InferE<R>;

/**
 * Chainable methods for {@link Result}.
 *
 * Provides `and`, `or`, `map`, `filter`, `tee`, `unwrap`, and `lazy` support.
 *
 * @example
 * ```ts
 * import { ok, err } from "@askua/core/result";
 *
 * const result = ok(10)
 *   .filter((n) => n > 5, () => new Error("too small"))
 *   .map((n) => n * 2)
 *   .unwrap(() => 0); // 20
 * ```
 */
export interface ResultContext<T, E>
  extends
    c.Context<T>,
    c.And<T>,
    c.Or<T>,
    c.Map<T>,
    c.Filter<T>,
    c.Tee<T>,
    c.Unwrap<T>,
    c.Lazy<T> {
  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = ok(1).and((n) => ok(n + 1));
   * assertEquals(a, ok(2));
   *
   * const b = err<number, string>("error").and((n) => ok(n + 1));
   * assertEquals(b, err("error"));
   * ```
   */
  and<
    U,
    F,
    R extends Result<U, F> = ResultInstance<U, F>,
  >(
    fn: (value: T) => R,
  ): InferResult<R, AndT<R>, AndE<R, E>>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = ok(1).or(() => ok(2));
   * assertEquals(a, ok(1));
   *
   * const b = err("error").or(() => ok(2));
   * assertEquals(b, ok(2));
   * ```
   */
  or<U, F, R extends Result<U, F> = ResultInstance<U, F>>(
    fn: (error: E) => R,
  ): InferResult<R, OrT<R, T>, OrE<R>>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = ok(1).map((n) => n + 1);
   * assertEquals(a, ok(2));
   *
   * const b = err<number, string>("error").map((n) => n + 1);
   * assertEquals(b, err("error"));
   * ```
   */
  map<U>(fn: (value: T) => U): ResultInstance<U, E>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = ok(1).filter((n) => n > 0);
   * assertEquals(a, ok(1));
   *
   * const b = ok(1).filter((n) => n > 0, () => "error");
   * assertEquals(b, ok(1));
   *
   * const c = ok(0).filter((n) => n > 0);
   * assertEquals(c, err(0));
   *
   * const d = ok(0).filter((n) => n > 0, () => "error");
   * assertEquals(d, err("error"));
   *
   * const e = err<number, string>("error").filter((n) => n > 0);
   * assertEquals(e, err("error"));
   * ```
   */
  filter<U extends T>(isOk: (value: T) => value is U): ResultInstance<U, T | E>;
  filter<U extends T, F>(
    isOk: (value: T) => value is U,
    onErr: (value: T) => F,
  ): ResultInstance<U, E | F>;
  filter(isOk: (value: T) => boolean): ResultInstance<T, T | E>;
  filter<F>(
    isOk: (value: T) => boolean,
    onErr: (value: T) => F,
  ): ResultInstance<T, E | F>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * let count = 0;
   * const a = ok(1).tee((n) => { count += 1; });
   * assertEquals(a, ok(1));
   * assertEquals(count, 1);
   * ```
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * let count = 0;
   * const b = err("error").tee((n) => { count += 1; });
   * assertEquals(b, err("error"));
   * assertEquals(count, 0);
   * ```
   */
  tee(callback: (value: T) => void): ResultInstance<T, E>;

  /**
   * @example
   * ```ts
   * import { assertEquals, assertThrows } from "@std/assert";
   *
   * const a = ok(1);
   * assertEquals(a.unwrap(), 1);
   *
   * const b = err("error");
   * assertEquals(b.unwrap(() => 0), 0);
   *
   * const c = err("error");
   * assertThrows(() => c.unwrap());
   * ```
   *
   * @throws {Error} when called on {@link Err} and no orElse is provided
   */
  unwrap<U>(orElse: (error: E) => U): T | U;
  unwrap(): T;

  /**
   * @example to {@link ResultLazyContext}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await ok(1)
   *   .lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(a, ok(2));
   *
   * const b = await ok(Promise.resolve(1))
   *   .lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(b, ok(2));
   * ```
   */
  lazy(): T extends Promise<infer T>
    ? ResultLazyContext<T, E, ResultInstance<T, E>>
    : ResultLazyContext<T, E, ResultInstance<T, E>>;

  /**
   * @example
   * ```ts
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
}

type InferResultLazy<
  R extends Result<unknown, unknown>,
  T,
  E,
  Eval extends Result<unknown, unknown>,
> = ResultLazyContext<
  T,
  E,
  R extends ResultContext<unknown, unknown>
    ? (Eval extends ResultContext<unknown, unknown> ? ResultInstance<T, E>
      : Result<T, E>)
    : Result<T, E>
>;

/**
 * Lazy chainable methods for async {@link Result} operations.
 *
 * Operations are deferred until {@link ResultLazyContext.eval | eval()} is called.
 *
 * @example
 * ```ts
 * import { Result, ok } from "@askua/core/result";
 *
 * const result = await Result.lazy(Promise.resolve(ok(1)))
 *   .map((n) => Promise.resolve(n + 1))
 *   .filter((n) => n > 0)
 *   .eval(); // ok(2)
 * ```
 */
export interface ResultLazyContext<
  T,
  E,
  Eval extends Result<T, E> = ResultInstance<T, E>,
> extends c.LazyContext<T>, c.And<T>, c.Or<T>, c.Map<T>, c.Filter<T>, c.Tee<T> {
  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await ok(1).lazy()
   *   .and((n) => Promise.resolve(ok(n + 1)))
   *   .eval();
   * assertEquals(a, ok(2));
   *
   * const e: ResultInstance<number, string> = err("error");
   * const b = await e.lazy()
   *   .and((n) => Promise.resolve(ok(n + 1)))
   *   .eval();
   * assertEquals(b, err("error"));
   * ```
   */
  and<
    U,
    F,
    R extends Result<U, F> = ResultInstance<U, F>,
  >(
    andThen: (value: T) => OrPromise<R>,
  ): InferResultLazy<R, AndT<R>, AndE<R, E>, Eval>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await ok(1).lazy()
   *   .or(() => Promise.resolve(ok(2)))
   *   .eval();
   * assertEquals(a, ok(1));
   *
   * const e: ResultInstance<number, string> = err("error");
   * const b = await e.lazy()
   *   .or(() => Promise.resolve(ok(2)))
   *   .eval();
   * assertEquals(b, ok(2));
   * ```
   */
  or<
    U,
    F,
    R extends Result<U, F> = ResultInstance<U, F>,
  >(
    orElse: (error: E) => OrPromise<R>,
  ): InferResultLazy<R, OrT<R, T>, OrE<R>, Eval>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const result = await ok(1).lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(result, ok(2));
   *
   * const e: ResultInstance<number, string> = err("error");
   * const resultErr = await e.lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(resultErr, err("error"));
   * ```
   */
  map<
    U,
    R extends Result<U, E> = ResultInstance<U, E>,
  >(fn: (value: T) => OrPromise<U>): InferResultLazy<R, AndT<R>, E, Eval>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await ok(1).lazy()
   *  .filter((n) => Promise.resolve(n > 0))
   *  .eval();
   * assertEquals(a, ok(1));
   *
   * const b = await ok(1).lazy()
   *  .filter((n) => Promise.resolve(n > 0), () => "error")
   *  .eval();
   * assertEquals(b, ok(1));
   *
   * const c = await ok(0).lazy()
   *   .filter((n) => Promise.resolve(n > 0))
   *   .eval();
   * assertEquals(c, err(0));
   *
   * const d = await ok(0).lazy()
   *   .filter((n) => Promise.resolve(n > 0), () => "error")
   *   .eval();
   * assertEquals(d, err("error"));
   *
   * const e: ResultInstance<number, string> = err("error");
   *
   * const f = await e.lazy()
   *   .filter((n) => Promise.resolve(n > 0))
   *   .eval();
   * assertEquals(f, err("error"));
   *
   * const g = await e.lazy()
   *   .filter((n) => Promise.resolve(n > 0), () => "another error")
   *   .eval();
   * assertEquals(g, err("error"));
   *  ```
   */
  filter<U extends T>(
    isOk: (value: T) => value is U,
  ): InferResultLazy<Eval, U, T | E, Eval>;
  filter<U extends T, F>(
    isOk: (value: T) => value is U,
    err: (value: T) => F,
  ): InferResultLazy<Eval, U, E | F, Eval>;
  filter(
    isOk: (value: T) => OrPromise<boolean>,
  ): InferResultLazy<Eval, T, T | E, Eval>;
  filter<F>(
    isOk: (value: T) => OrPromise<boolean>,
    err: (value: T) => F,
  ): InferResultLazy<Eval, T, E | F, Eval>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * let count = 0;
   * const a = await ok(Promise.resolve(1)).lazy()
   *   .tee((n) => { count += 1; })
   *   .eval();
   * assertEquals(a, ok(1));
   * assertEquals(count, 1);
   * ```
   */
  tee(
    callback: (value: T) => OrPromise<void>,
  ): InferResultLazy<Eval, T, E, Eval>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const result = await ok(1).lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(result, ok(2));
   * ```
   */
  eval(): Promise<Eval>;

  /**
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = Result.lazy(ok(1));
   * assertEquals(
   *   a.toString(),
   *   "Lazy<Ok(1)>",
   * );
   *
   * const b = Result.lazy(() => ok(1)).map((n) => n * 100).or(() => ok(0));
   * assertEquals(
   *   b.toString(),
   *   "Lazy<()=>ok(1).map((n)=>n * 100).or(()=>ok(0))>",
   * );
   * ```
   */
  toString(): string;
}

/**
 * Static methods available on the {@link Result} namespace.
 *
 * @example
 * ```ts
 * import { Result, ok, err } from "@askua/core/result";
 *
 * Result.ok(1);                            // same as ok(1)
 * Result.err("error");                     // same as err("error")
 * Result.and(ok(1), () => ok(2));          // ok([1, 2])
 * Result.or(err("error"), () => ok(2));    // ok(2)
 * Result.try(() => JSON.parse("{}"));      // ok({})
 * ```
 */
export interface ResultStatic {
  /**
   * @example {@link ResultStatic.ok}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(Result.ok(1), ok(1));
   * ```
   */
  ok: typeof ok;

  /**
   * @example {@link ResultStatic.err}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(Result.err("is error"), err("is error"));
   * ```
   */
  err: typeof err;

  /**
   * @example sync {@link ResultStatic.and}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = Result.and(
   *   ok(1),
   *   () => ok(2),
   *   ok(3),
   *   () => ok(4),
   * );
   * assertEquals(a, ok([1, 2, 3, 4]));
   *
   * const b = Result.and(
   *   ok(1),
   *   () => ok(2),
   *   ok(3),
   *   () => err("is error"),
   * );
   * assertEquals(b, err("is error"));
   * ```
   *
   * @example async {@link ResultStatic.and}
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
  and<
    T extends {
      [K in keyof Args]: InferReturnTypeOr<Args[K]> extends infer R
        ? (Awaited<R> extends Result<infer T, unknown> ? T : unknown)
        : unknown;
    },
    E extends {
      [K in keyof Args]: InferReturnTypeOr<Args[K]> extends infer R
        ? (Awaited<R> extends Ok<unknown> ? never
          : (Awaited<R> extends Result<unknown, infer E> ? E : unknown))
        : unknown;
    }[number],
    Fn extends OrFunction<OrPromise<Result<T[number], E>>>,
    Args extends NonEmptyArray<Fn>,
  >(
    ...args: Args
  ): InferReturnTypeOr<Args[number]> extends infer R
    ? (Extract<R, Promise<unknown>> extends never
      ? (R extends Result<unknown, unknown> ? InferResult<R, T, E> : unknown)
      : Promise<
        (Awaited<R> extends Result<unknown, unknown>
          ? InferResult<Awaited<R>, T, E>
          : unknown)
      >)
    : unknown;

  /**
   * @example sync {@link ResultStatic.or}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = Result.or(
   *   ok(1),
   *   () => ok(2),
   *   ok(3),
   *   () => ok(4),
   * );
   * assertEquals(a, ok(1));
   *
   * const b = Result.or(
   *   err("is error"),
   *   () => err("is error"),
   *   err("is error"),
   *   () => ok(4),
   * );
   * assertEquals(b, ok(4));
   * ```
   *
   * @example async {@link ResultStatic.or}
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
  or<
    T extends {
      [K in keyof Args]: InferReturnTypeOr<Args[K]> extends infer R
        ? (Awaited<R> extends Err<unknown> ? never
          : (Awaited<R> extends Result<infer T, unknown> ? T : unknown))
        : unknown;
    }[number],
    E extends {
      [K in keyof Args]: InferReturnTypeOr<Args[K]> extends infer R
        ? (Awaited<R> extends Ok<unknown> ? never
          : (Awaited<R> extends Result<unknown, infer E> ? E : unknown))
        : unknown;
    }[number],
    Fn extends OrFunction<OrPromise<Result<T, E>>>,
    Args extends NonEmptyArray<Fn>,
  >(
    ...args: Args
  ): InferReturnTypeOr<Args[number]> extends infer R
    ? (Extract<R, Promise<unknown>> extends never
      ? (R extends Result<unknown, unknown> ? InferResult<R, T, E> : unknown)
      : Promise<
        (Awaited<R> extends Result<unknown, unknown>
          ? InferResult<Awaited<R>, T, E>
          : unknown)
      >)
    : unknown;

  /**
   * @example to {@link ResultLazyContext}
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const result = await Result.lazy(Promise.resolve(ok(1)))
   *   .map((n) => n + 1)
   *   .map((n) => Promise.resolve(n * 2))
   *   .eval();
   * assertEquals(result, ok(4));
   * ```
   */
  lazy<
    T extends InferT<Awaited<InferReturnTypeOr<Fn>>, never>,
    E extends InferE<Awaited<InferReturnTypeOr<Fn>>, never>,
    Fn extends OrFunction<OrPromise<Result<unknown, unknown>>>,
  >(
    fn: Fn,
  ): InferReturnTypeOr<Fn> extends infer R
    ? (Awaited<R> extends Result<unknown, unknown>
      ? ResultLazyContext<T, E, InferResult<Awaited<R>, T, E>>
      : unknown)
    : unknown;

  /**
   * @example from {@link Option}
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { some, none } from "@askua/core/option";
   *
   * const a = Result.fromOption(some(1));
   * assertEquals(a, ok(1));
   *
   * const b = Result.fromOption(none());
   * assertEquals(b, err(null));
   * ```
   */
  fromOption<T>(o: Some<T>): OkInstance<T, null>;
  fromOption<T>(o: None): ErrInstance<T, null>;
  fromOption<T>(o: Option<T>): ResultInstance<T, null>;

  /**
   * @example
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
  try<T, E = unknown>(
    fn: () => T,
  ): T extends Promise<infer U> ? Promise<ResultInstance<U, E>>
    : ResultInstance<T, E>;
}

/** @internal */
class _Ok<T, E> implements Ok<T>, ResultContext<T, E> {
  readonly ok = true;
  constructor(readonly value: T) {
  }

  and<U>(andThen: (value: T) => U) {
    return andThen(this.value) as never;
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
    if (isOk(this.value)) return this;
    return err(onErr(this.value)) as never;
  }

  tee(callback: (value: T) => void) {
    callback(this.value);
    return this as never;
  }

  unwrap(): T {
    return this.value;
  }

  lazy() {
    return new _Lazy(this) as never;
  }

  toString(): string {
    return `Ok(${this.value})`;
  }
}

/** @internal */
class _Err<T, E> implements Err<E>, ResultContext<T, E> {
  readonly ok = false;
  constructor(readonly error: E) {}

  and() {
    return this as never;
  }

  map() {
    return this as never;
  }

  filter() {
    return this;
  }

  tee() {
    return this;
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

  lazy() {
    return new _Lazy(this) as never;
  }

  toString(): string {
    return `Err(${this.error})`;
  }
}

/** @internal */
type Op<T, E> =
  | { and: <U = never, D = never>(value: T) => OrPromise<Result<U, D>> }
  | { or: <U = never, D = never>(error: E) => OrPromise<Result<U, D>> }
  | { map: <U = never>(value: T) => OrPromise<U> }
  | {
    filter: (value: T) => OrPromise<boolean>;
    onErr: <D = never>(value: T) => D;
  }
  | { tee: (value: T) => OrPromise<void> };

/** @internal */
class _Lazy<T, E, Eval extends Result<T, E>>
  implements ResultLazyContext<T, E, Eval> {
  readonly op: Op<T, E>[] = [];

  constructor(
    readonly first: OrFunction<OrPromise<Eval>>,
  ) {
  }

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

  filter(filter: unknown, onErr = (v: T) => v) {
    this.op.push({ filter, onErr } as typeof this.op[number]);
    return this as never;
  }

  tee(tee: unknown) {
    this.op.push({ tee } as typeof this.op[number]);
    return this as never;
  }

  async eval(): Promise<Eval> {
    const p = typeof this.first === "function" ? this.first() : this.first;
    let result: Result<T, E> = p instanceof Promise ? await p : p;
    if (result.ok && result.value instanceof Promise) {
      result = ok(await result.value);
    }

    for (let i = 0; i < this.op.length; i++) {
      const op = this.op[i];

      if ("and" in op && result.ok) {
        const p = op.and(result.value);
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
        continue;
      }

      if ("tee" in op && result.ok) {
        const p = op.tee(result.value);
        if (p instanceof Promise) await p;
        continue;
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

/** @internal */
function toInstance<T, E>(result: Result<T, E>): ResultInstance<T, E> {
  return (result.ok ? ok(result.value) : err(result.error));
}

/** @internal */
function and<T, E>(
  results: OrFunction<OrPromise<Result<T, E>>>[],
  i: number = 0,
  values: T[] = new Array(results.length),
): OrPromise<Result<T[], E>> {
  for (; i < results.length; i++) {
    const fn = results[i];
    const result = typeof fn === "function" ? fn() : fn;

    if (result instanceof Promise) {
      return result.then((result) => {
        if (!result.ok) {
          return result;
        }

        values[i] = result.value;
        return and(results, i + 1, values);
      });
    }

    if (!result.ok) {
      return result;
    }
    values[i] = result.value;
  }
  return ok(values);
}

/** @internal */
function or<T, E>(
  results: OrFunction<OrPromise<Result<T, E>>>[],
  last?: OrPromise<Result<T, E>>,
): OrPromise<Result<T, E>> {
  for (let i = 0; i < results.length; i++) {
    const fn = results[i];
    last = typeof fn === "function" ? fn() : fn;

    if (last instanceof Promise) {
      return last.then((last) => {
        if (last.ok) return last;

        return or(results.slice(i + 1), last);
      });
    }

    if (last.ok) return last;
  }
  return last!;
}

/** @internal */
function lazy<T, E, Eval extends Result<T, E>>(
  result: Eval,
): ResultLazyContext<T, E, Eval> {
  return new _Lazy<T, E, Eval>(result);
}

/** @internal */
function fromOption<T>(o: Option<T>): ResultInstance<T, null> {
  return o.some ? ok(o.value) : err(null);
}

/** @internal */
function tryCatch<T, E>(
  fn: () => OrPromise<T>,
): OrPromise<ResultInstance<T, E>> {
  try {
    const v = fn();
    if (v instanceof Promise) {
      return v.then((v) => ok<T, E>(v)).catch((e) => err<T, E>(e));
    }
    return ok(v);
  } catch (e) {
    return err(e as E);
  }
}
