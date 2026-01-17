/**
 * Result is Object base type, Ok<T> and Err<E>.
 *
 * ```ts
 * import { assert } from "@std/assert";
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
import type { None, Option, Some } from "./option.ts";
import type { InferReturnTypeOr, OrFunction, OrPromise } from "./types.ts";

/**
 * ```ts
 * const a: Ok<number> = { ok: true, value: 1 };
 * const b: Ok<number> = ok(1);
 * ```
 *
 * @typeParam T value type
 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/**
 * ```ts
 * const a: Ok<number> = { ok: true, value: 1 };
 * const b: OkInstance<number> = ok(1);
 * ```
 *
 * @typeParam T value type
 */
export type OkInstance<T> = Ok<T> & ResultContext<T, never>;

/**
 * Infer Ok type from Result or ResultInstance
 *
 * ```ts
 * const a: InferOk<Result<number>> = { ok: true, value: 1 };
 * const b: Ok<number> = a;
 *
 * const c: InferOk<ResultInstance<number>> = ok(1);
 * const d: OkInstance<number> = c;
 * ```
 */
export type InferOk<R extends Result<unknown, unknown>> = R extends
  ResultContext<infer T, infer _> ? OkInstance<T>
  : Ok<R extends Ok<infer T> ? T : never>;

/**
 * ```ts
 * const a: Err<string> = { ok: false, error: "is error" };
 * const b: Err<string> = err("is error");
 * ```
 *
 * @typeParam E error type
 */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * ```ts
 * const a: Err<string> = { ok: false, error: "is error" };
 * const b: ErrInstance<string> = err("is error");
 * ```
 *
 * @typeParam E error type
 */
export type ErrInstance<E> = Err<E> & ResultContext<never, E>;

/**
 * Infer Err type from Result or ResultInstance
 *
 * ```ts
 * const a: InferErr<Result<number, string>> = { ok: false, error: "is error" };
 * const b: Err<string> = a;
 *
 * const c: InferErr<ResultInstance<number, string>> = err("is error");
 * const d: ErrInstance<string> = c;
 * ```
 */
export type InferErr<R extends Result<unknown, unknown>> = R extends
  ResultContext<infer _, infer E> ? ErrInstance<E>
  : Err<R extends Err<infer E> ? E : never>;

/**
 * Result is Object base type, Ok<T> and Err<E>.
 *
 * ```ts
 * const a: Result<number> = { ok: true, value: 1 };
 * const b: Result<number> = { ok: false, error: new Error("error") };
 *
 * const c: Result<number> = ok(1);
 * const d: Result<number> = err(new Error("error"));
 * ```
 *
 * @typeParam T value type
 * @typeParam E error type
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * Infer Result type from ResultInstance or Result
 *
 * ```ts
 * const a: InferResult<Result<unknown, unknown>, number, string> = { ok: true, value: 1 };
 * const b: Result<number, string> = a;
 *
 * const c: InferResult<ResultInstance<unknown, unknown>, number, string> = ok(1);
 * const d: ResultInstance<number, string> = c;
 * ```
 *
 * @typeParam R Result type
 * @typeParam T value type
 * @typeParam E error type
 */
export type InferResult<R extends Result<unknown, unknown>, T, E> = R extends
  ResultInstance<unknown, unknown> ? ResultInstance<T, E> : Result<T, E>;

/**
 * WIP
 *
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
 *
 * const a = Result({ ok: true, value: 1 });
 * assertEquals(a, ok(1));
 *
 * const b = Result({ ok: false, error: "error" });
 * assertEquals(b, err("error"));
 * ```
 */
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
 * Result Instance
 *
 * @typeParam T value type
 * @typeParam E error type
 */
export type ResultInstance<T, E = Error> = Result<T, E> & ResultContext<T, E>;

/**
 * Result ToInstance
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const a: ResultInstance<number> = Result({ ok: true, value: 1 });
 * assertEquals(a, ok(1));
 *
 * const b: ResultInstance<number, string> = Result({ ok: false, error: "error" });
 * assertEquals(b, err("error"));
 * ```
 */
export type ResultToInstance = {
  <T, E = never>(ok: Ok<T>): InferOk<ResultInstance<T, E>>;
  <T = never, E = never>(err: Err<E>): InferErr<ResultInstance<T, E>>;
  <T = never, E = never>(result: Result<T, E>): ResultInstance<T, E>;
  <T, E>(result: { ok: boolean; value: T; error: E }): ResultInstance<T, E>;
};

type InferT<R extends Result<unknown, unknown>, U = never> = R extends
  Ok<infer T> ? T | U
  : (R extends Err<unknown> ? U
    : (R extends Result<infer T, unknown> ? T | U : unknown));

type InferE<R extends Result<unknown, unknown>, F = never> = R extends
  Ok<unknown> ? F
  : (R extends Err<infer E> ? E | F
    : (R extends Result<unknown, infer E> ? E | F : unknown));

type AndT<R extends Result<unknown, unknown>> = InferT<R>;
type AndE<R extends Result<unknown, unknown>, E> = InferE<R, E>;

type OrT<R extends Result<unknown, unknown>, T> = InferT<R, T>;
type OrE<R extends Result<unknown, unknown>> = InferE<R>;

/**
 * Result Context Methods
 *
 * @typeParam T - value type
 * @typeParam E - error type
 */
export interface ResultContext<T, E>
  extends
    Iterable<T>,
    c.Context<T>,
    c.And<T>,
    c.Or<T>,
    c.Map<T>,
    c.Filter<T>,
    c.Unwrap<T>,
    c.Lazy<T> {
  /**
   * @example `and` method
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = ok(1).and((n) => ok(n + 1));
   * assertEquals(a, ok(2));
   *
   * const b = err("error").and((n) => ok(n + 1));
   * assertEquals(b, err("error"));
   * ```
   */
  and<
    U,
    F,
    R extends Result<U, F> = ResultInstance<U, F>,
  >(
    andThen: (value: T) => R,
  ): InferResult<R, AndT<R>, AndE<R, E>>;

  /**
   * @example `or` method
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
    orElse: (error: E) => R,
  ): InferResult<R, OrT<R, T>, OrE<R>>;

  /**
   * @example `map` method
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = ok(1).map((n) => n + 1);
   * assertEquals(a, ok(2));
   *
   * const b = err("error").map((n) => n + 1);
   * assertEquals(b, err("error"));
   * ```
   */
  map<U>(fn: (value: T) => U): ResultInstance<U, E>;

  /**
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
   * const e = err("error").filter((n) => n > 0);
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
   * @typeParam U return type of orElse
   */
  unwrap<U>(orElse: (error: E) => U): T | U;
  unwrap(): T;

  /**
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
  lazy(): T extends Promise<infer U>
    ? ResultLazyContext<ResultInstance<U, E>, U, E>
    : ResultLazyContext<ResultInstance<T, E>, T, E>;

  /**
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
  Eval extends Result<unknown, unknown>,
  T,
  E,
> = ResultLazyContext<InferResult<Eval, T, E>, T, E>;

/**
 * Result Lazy eval
 *
 * @typeParam T - value type
 * @typeParam E - error type
 * @typeParam Eval - eval Result
 */
export interface ResultLazyContext<
  Eval extends Result<T, E>,
  T = InferT<Eval>,
  E = InferE<Eval>,
> extends c.LazyContext<T>, c.And<T>, c.Or<T>, c.Map<T>, c.Filter<T> {
  /**
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
   *
   * @typeParam R Result type of andThen return
   * @typeParam T2 value type of Eval
   * @typeParam E2 error type of Eval
   */
  and<
    R extends Result<T2, E2>,
    T2 = AndT<R>,
    E2 = AndE<R, E>,
  >(andThen: (value: T) => OrPromise<R>): InferResultLazy<R, T2, E2>;

  /**
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
   *
   * @typeParam R Result type of orElse return
   * @typeParam T2 value type of Eval
   * @typeParam E2 error type of Eval
   */
  or<
    R extends Result<T2, E2>,
    T2 = OrT<R, T>,
    E2 = OrE<R>,
  >(orElse: (error: E) => OrPromise<R>): InferResultLazy<R, T2, E2>;

  /**
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
   *
   * @typeParam T2 value type of Eval
   */
  map<
    T2,
  >(fn: (value: T) => OrPromise<T2>): InferResultLazy<Eval, T2, E>;

  /**
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
   *
   *  @typeParam E2 error type of Eval
   *  @typeParam IsOk boolean result of isOk
   */
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
 * Static Methods
 */
export interface ResultStatic {
  /**
   * @example `Result.ok`
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(Result.ok(1), ok(1));
   * ```
   */
  ok: typeof ok;

  /**
   * @example `Result.err`
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(Result.err("is error"), err("is error"));
   * ```
   */
  err: typeof err;

  /**
   * @example `Result.and`
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
    Args extends [Fn, ...Fn[]],
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
   * @example `Result.or`
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
    Args extends [Fn, ...Fn[]],
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
   * @example `Result.lazy`
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
  lazy: typeof lazy;

  /**
   * @example `Result.fromOption`
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
  fromOption<T>(o: Some<T>): OkInstance<T>;
  fromOption<T>(o: None): ErrInstance<null>;
  fromOption<T>(o: Option<T>): ResultInstance<T, null>;

  /**
   * @example `Result.try`
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

/**
 * impl Ok<T, E>
 */
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
    if (isOk(this.value)) return this as never;
    return err(onErr(this.value));
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

  and() {
    return this as never;
  }

  map() {
    return this as never;
  }

  filter() {
    return this as never;
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

  [Symbol.iterator](): Iterator<T> {
    throw this.error;
  }
}

type Op<T, E> =
  | { and: <U = never, D = never>(value: T) => OrPromise<Result<U, D>> }
  | { or: <U = never, D = never>(error: E) => OrPromise<Result<U, D>> }
  | { map: <U = never>(value: T) => OrPromise<U> }
  | {
    filter: (value: T) => OrPromise<boolean>;
    onErr: <D = never>(value: T) => D;
  };

/**
 * impl Lazy<T, E, Eval>
 */
class _Lazy<T, E, Eval extends Result<T, E>>
  implements ResultLazyContext<Eval, T, E> {
  readonly op: Op<T, E>[] = [];

  constructor(
    readonly first: (() => Promise<Eval> | Eval) | Promise<Eval> | Eval,
  ) {
  }

  and<U, V>(and: U): V {
    this.op.push({ and } as typeof this.op[number]);
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

function lazy<
  Fn extends OrFunction<OrPromise<Eval>>,
  Eval extends Result<T, E> = Fn extends OrFunction<OrPromise<infer R>> ? R
    : never,
  T = InferT<Eval>,
  E = InferE<Eval>,
>(result: Fn): ResultLazyContext<Eval, T, E> {
  return new _Lazy(result);
}

function fromOption<T>(o: Option<T>): ResultInstance<T, null> {
  return o.some ? ok(o.value) : err(null);
}

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
