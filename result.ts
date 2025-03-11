/**
 * Result is Object base type, Ok<T> and Err<E>.
 *
 * ```ts
 * import type { Ok, Err, Result } from "@askua/core/result";
 *
 * const ok: Ok<number> = { ok: true, value: 1 };
 * const err: Err<Error> = { ok: false, error: new Error("error") };
 * ```
 *
 * @example
 * ## Usage
 *
 * ```ts
 * import type { Result } from "@askua/core/result";
 *
 * const result = ((): Result<number> => ({ ok: true, value: 1 }))();
 * if (result.ok) {
 *   console.log(`Ok: ${result.value}`);
 * } else {
 *   console.error(`Err: ${result.error}`);
 * }
 * ```
 *
 * @example
 * ## Why Object base?
 *
 * If you use on Server and Browser, using JSON.stringify and JSON.parse.
 * So, Object base is easy to use.
 *
 * ```ts
 * import type { Result } from "@askua/core/result";
 *
 * const json: string = `{"ok":true,"value":1}`;
 *
 * const result: Result<number> = JSON.parse(json);
 * if (result.ok) {
 *   console.log(`Ok: ${result.value}`);
 * } else {
 *   console.error(`Err: ${result.error}`);
 * }
 * ```
 *
 * @example
 * ## Using with method
 *
 * ```ts
 * import { Result } from "@askua/core/result";
 *
 * const result: Result<string> = Result.ok(Math.random())
 *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err(new Error("less than 0.5")))
 *   .map((n) => n.toFixed(2));
 *
 * if (result.ok) {
 *   console.log(`Ok: ${result.value}`);
 * } else {
 *   console.error(`Err: ${result.error}`);
 * }
 * ```
 *
 * @example
 * ## Using Instance type
 *
 * ```ts
 * import { Instance as Result } from "@askua/core/result";
 *
 * const result: Result<string> = Result.ok(Math.random())
 *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err(new Error("less than 0.5")))
 *   .map((n) => n.toFixed(2));
 *
 * console.log(result.unwrapOrElse((e) => {
 *   console.error(e.message);
 *   return "Error!";
 * }));
 * ```
 *
 * @example
 * ## Using Iterable type
 *
 * ```ts
 * import { Result } from "@askua/core/result";
 *
 * const getNumber = () => Result.ok(Math.random())
 *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")));
 *
 * const list = [
 *   [...getNumber().map((n) => n.toFixed(2))],
 *   [...getNumber().map((n) => n.toFixed(2))],
 *   [...getNumber().map((n) => n.toFixed(2))],
 * ];
 * console.log(list.flat());
 * ```
 *
 * @example
 * ## Using Lazy type
 *
 * ```ts
 * import { Result } from "@askua/core/result";
 *
 * const getNumber = () => Promise.resolve(Result.ok(Math.random()));
 *
 * const result = await Result.lazy(getNumber())
 *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err(new Error("less than 0.5")))
 *   .map((n) => n.toFixed(2))
 *   .eval();
 *
 * console.log(result.unwrapOrElse((e) => {
 *   console.error(e.message);
 *   return "Error!";
 * }));
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import { Instance as Option } from "./option.ts";
import type { OrPromise } from "./types.ts";

/**
 * Result element Ok
 *
 * @example
 * ```ts
 * import { assertObjectMatch } from "@std/assert";
 *
 * const result = Result.ok("is ok");
 *
 * assertObjectMatch(result, {
 *   ok: true,
 *   value: "is ok",
 * });
 * ```
 *
 * @typeParam T - value type
 * @typeParam E - error type
 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/**
 * Result element Err
 *
 * @example
 * ```ts
 * import { assertObjectMatch } from "@std/assert";
 *
 * const result = Result.err("is error");
 *
 * assertObjectMatch(result, {
 *   ok: false,
 *   error: "is error",
 * });
 * ```
 *
 * @typeParam _ - value type
 * @typeParam E - error type
 */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * Result
 *
 * @example
 * ```ts
 * const ok: Result<number> = Result.ok(1);
 * const err: Result<number> = Result.err<number>(new Error("error"));
 * ```
 *
 * @typeParam T - value type
 * @typeParam E - error type (default: Error)
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * impl Result
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const result = Result({ ok: true, value: 1 })
 *   .map((n) => n + 1);
 *
 * assertEquals(result, Result.ok(2));
 * ```
 */
export const Result: ToInstance & Static = Object.assign(
  toInstance,
  { ok, err, andThen, orElse, lazy },
);

/**
 * Result Instance
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const value = Result.err<number>(new Error("error"))
 *   .map((n) => n + 1)
 *   .unwrapOr(0);
 *
 * assertEquals(value, 0);
 * ```
 *
 * @typeParam T - value type
 * @typeParam E - error type (default: Error)
 */
export type Instance<T, E = Error> = Result<T, E> & Context<T, E>;

/**
 * impl Instance
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Instance as Result } from "@askua/core/result";
 *
 * const ok: Result<number> = Result({ ok: true, value: 1 });
 * assertEquals(ok.unwrap(), 1);
 *
 * const err: Result<number> = Result({ ok: false, error: new Error("error") });
 * assertEquals(err.unwrapOr(0), 0);
 * ```
 */
export const Instance: ToInstance & Static = Result;

/**
 * Result ToInstance
 *
 * @example
 * ```ts
 * const ok: Result<number> = Result({ ok: true, value: 1 });
 * const err: Result<number> = Result({ ok: false, error: new Error("error") });
 * ```
 */
export type ToInstance = {
  <T, E = never>(ok: Ok<T>): Ok<T> & Context<T, E>;
  <T = never, E = never>(err: Err<E>): Err<E> & Context<T, E>;
  <T = never, E = never>(result: Result<T, E>): Instance<T, E>;
  <T, E>(result: { ok: boolean; value: T; error: E }): Instance<T, E>;
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
export interface Context<T, E>
  extends Iterable<T>, ToOption<T>, c.And<T>, c.Or<E>, c.Map<T>, c.Unwrap<T> {
  /**
   * andThen
   *
   * @example
   * ```ts
   * console.log("[Example] (Result).andThen");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Result.ok(n.toFixed(2)));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  andThen<R extends Result<T2, E2>, T2 = AndT<R>, E2 = AndE<R, E>>(
    fn: (value: T) => R,
  ): R extends Instance<infer _, infer _> ? Instance<T2, E2> : Result<T2, E2>;

  /**
   * and
   *
   * @example
   * ```ts
   * console.log("[Example] (Result).and");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .and(Result.ok("TOO LARGE"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  and<R extends Result<T2, E2>, T2 = AndT<R>, E2 = AndE<R, E>>(
    result: R,
  ): R extends Instance<infer _, infer _> ? Instance<T2, E2> : Result<T2, E2>;

  /**
   * orElse
   *
   * @example
   * ```ts
   * console.log("[Example] (Result).orElse");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
   *   .orElse((e) => {
   *     console.error(`Error: ${e}`);
   *     return Result.ok(0);
   *   })
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  orElse<R extends Result<T2, E2>, T2 = OrT<R, T>, E2 = OrE<R>>(
    fn: (error: E) => R,
  ): R extends Instance<infer _, infer _> ? Instance<T2, E2> : Result<T2, E2>;

  /**
   * or
   *
   * @example
   * ```ts
   * console.log("[Example] (Result).or");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
   *   .or(Result.ok(0));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  or<R extends Result<T2, E2>, T2 = OrT<R, T>, E2 = OrE<R>>(
    result: R,
  ): R extends Instance<infer _, infer _> ? Instance<T2, E2> : Result<T2, E2>;

  /**
   * map
   *
   * @example
   * ```ts
   * console.log("[Example] (Result).map");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .map((n) => n.toFixed(2))
   *   .or(Result.ok("0.00"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  map<T2>(fn: (value: T) => T2): Instance<T2, E>;

  /**
   * unwrap
   *
   * @example
   * ```ts
   * console.log("[Example] (Result).unwrap");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
   *   .or(Result.ok("0.00"))
   *   .unwrap();
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  unwrap(): T;

  /**
   * unwrapOr
   *
   * @example
   * ```ts
   * console.log("[Example] (Result).unwrapOr");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
   *   .unwrapOr("0.00");
   *
   * console.log(`Result: ${fn()}`);
   */
  unwrapOr<T2>(value: T2): T | T2;

  /**
   * unwrapOrElse
   *
   * @example
   * ```ts
   * console.log("[Example] (Result).unwrapOrElse");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
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
   * toString
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const ok = Result.ok("is ok");
   * assertEquals(ok.toString(), "Ok(is ok)");
   *
   * const err = Result.err("is error");
   * assertEquals(err.toString(), "Err(is error)");
   * ```
   */
  toString(): string;

  /**
   * lazy
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const result = await Result.ok(1).lazy().and((Result.ok(2))).eval();
   * assertEquals(result, Result.ok(2));
   * ```
   */
  lazy(): Lazy<T, E, Instance<T, E>>;
}

type LazyEval<
  T,
  E,
  R extends Result<T, E>,
  Eval extends Result<unknown, unknown>,
> = R extends Instance<unknown, unknown>
  ? (Eval extends Instance<unknown, unknown> ? Instance<T, E> : Result<T, E>)
  : R;

/**
 * Result Lazy eval
 *
 * @typeParam T - value type
 * @typeParam E - error type
 * @typeParam Eval - eval Result
 */
export interface Lazy<T, E, Eval extends Result<T, E>>
  extends c.And<T>, c.Or<E>, c.Map<T> {
  /**
   * andThen
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).andThen");
   *
   * const getNumber = () => Promise.resolve(Result.ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? Result.ok<number>(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Promise.resolve(Result.ok(n.toFixed(2))))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  andThen<
    R extends Result<T2, E2>,
    T2 = AndT<R>,
    E2 = AndE<R, E>,
    Z extends Result<T2, E2> = LazyEval<T2, E2, R, Eval>,
  >(fn: (value: T) => OrPromise<R>): Lazy<T2, E2, Z>;

  /**
   * and
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).and");
   *
   * const getNumber = () => Promise.resolve(Result.ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? Result.ok<number>(n) : Result.err<number>(new Error("less than 0.5")))
   *   .and(Promise.resolve(Result.ok("TOO LARGE")))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  and<
    R extends Result<T2, E2>,
    T2 = AndT<R>,
    E2 = AndE<R, E>,
    Z extends Result<T2, E2> = LazyEval<T2, E2, R, Eval>,
  >(result: OrPromise<R>): Lazy<T2, E2, Z>;

  /**
   * orElse
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).orElse");
   *
   * const getNumber = () => Promise.resolve(Result.ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? Result.ok<number>(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
   *   .orElse((e) => {
   *     console.error(`Error: ${e}`);
   *     return Promise.resolve(Result.ok("0.50"));
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
    Z extends Result<T2, E2> = LazyEval<T2, E2, R, Eval>,
  >(fn: (error: E) => OrPromise<R>): Lazy<T2, E2, Z>;

  /**
   * or
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).or");
   *
   * const getNumber = () => Promise.resolve(Result.ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? Result.ok<number>(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
   *   .or(Promise.resolve(Result.ok("0.50")))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  or<
    R extends Result<T2, E2>,
    T2 = OrT<R, T>,
    E2 = OrE<R>,
    Z extends Result<T2, E2> = LazyEval<T2, E2, R, Eval>,
  >(result: OrPromise<R>): Lazy<T2, E2, Z>;

  /**
   * map
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).map");
   *
   * const getNumber = () => Promise.resolve(Result.ok(Math.random()));
   *
   * const fn = () => Result.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? Result.ok<number>(n) : Result.err<number>(new Error("less than 0.5")))
   *   .map((n) => Promise.resolve(n.toFixed(2)))
   *   .eval();
   *
   * console.debug(`Result: ${await fn()}`);
   * ```
   */
  map<
    T2,
    Z extends Result<T2, E> = LazyEval<T2, E, Instance<T2, E>, Eval>,
  >(fn: (value: T) => OrPromise<T2>): Lazy<T2, E, Z>;

  /**
   * eval
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).eval");
   *
   * const result: Result<number> = await Result.lazy(Result.ok(1)).eval();
   *
   * console.debug(`Result: ${result}`);
   * ```
   */
  eval(): Promise<Eval>;

  /**
   * toString
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(
   *   Result.lazy(Result.ok(1)).toString(),
   *   "Lazy<Ok(1)>",
   * );
   *
   * assertEquals(
   *   Result.lazy(() => Result.ok(1)).map((n) => n * 100).or(Result.ok(0)).toString(),
   *   "Lazy<()=>Result.ok(1).map((n)=>n * 100).or(Ok(0))>",
   * );
   * ```
   */
  toString(): string;
}

/**
 * Static Result
 */
export interface Static {
  /**
   * Create a Result instance
   *
   * @example
   * ```ts
   * import { assertEquals, assertObjectMatch } from "@std/assert";
   *
   * const result = Result.ok("is ok");
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
   * Create a Result instance
   *
   * @example
   * ```ts
   * import { assert, assertEquals, assertObjectMatch } from "@std/assert";
   *
   * const result = Result.err("is error");
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
   * andThen
   *
   * @example
   * ```ts
   * console.log("[Example] Result.andThen");
   *
   * const getNumber = (count: number) => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.2 ? Result.ok(n) : Result.err<number>(new Error(`${count}: less than 0.2`)))
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
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const result = await Result.andThen(
   *   Result.ok(1),
   *   () => Result.ok(2),
   *   Promise.resolve(Result.ok(3)),
   *   () => Promise.resolve(Result.ok(4)),
   * ).then((r) => r.unwrap().join(", "));
   *
   * assertEquals(result, "1, 2, 3, 4");
   * ```
   */
  andThen: typeof andThen;

  /**
   * orElse
   *
   * @example
   * ```ts
   * console.log("[Example] Result.orElse");
   *
   * const getNumber = (count: number) => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.8 ? Result.ok(n) : Result.err<number>(new Error(`${count}: less than 0.8`)))
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
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const result = await Result.orElse(
   *   Result.err<number>(new Error("1")),
   *   () => Result.err<number>(new Error("2")),
   *   Promise.resolve(Result.err<number>(new Error("3"))),
   *   () => Promise.resolve(Result.ok<number>(4)),
   * ).then((r) => r.map((n) => n.toFixed(2)).unwrap());
   *
   * assertEquals(result, "4.00");
   * ```
   */
  orElse: typeof orElse;

  /**
   * lazy
   *
   * @example
   * ```ts
   * console.log("[Example] Result.lazy");
   *
   * const result = await Result.lazy(Result.ok(1))
   *   .and(Result.ok(2))
   *   .eval();
   *
   * console.log(`Result: ${result}`);
   * ```
   *
   * ```ts
   * console.log("[Example] Result.lazy");
   *
   * const result = await Result.lazy(() => Result.ok(1))
   *   .and(Result.ok(2))
   *   .map((n) => n.toFixed(2))
   *   .eval();
   *
   * console.log(`Result: ${result}`);
   * ```
   */
  lazy: typeof lazy;
}

/**
 * Result ToOption
 */
export interface ToOption<T> {
  /**
   * toOption
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Option } from "@askua/core/option";
   *
   * const some = Result.ok("is ok").toOption();
   * assertEquals(some, Option.some("is ok"));
   *
   * const none = Result.err("is error").toOption();
   * assertEquals(none, Option.none());
   * ```
   */
  toOption(): Option<T>;
}

/**
 * impl Ok<T, E>
 */
class _Ok<T, E> implements Ok<T>, Context<T, E> {
  readonly ok = true;
  constructor(readonly value: T) {
  }

  toOption<O>(): O {
    return Option.some(this.value) as O;
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
    return Result.ok(fn(this.value)) as V;
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

  lazy<Z extends Result<T, E>>(): Lazy<T, E, Z> {
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
class _Err<T, E> implements Err<E>, Context<T, E> {
  readonly ok = false;
  constructor(readonly error: E) {}

  toOption<O>(): O {
    return Option.none() as O;
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

  lazy<Z extends Result<T, E>>(): Lazy<T, E, Z> {
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
  | { andThen: (value: T) => Promise<Result<U, D>> }
  | { and: Promise<Result<U, D>> }
  | { orElse: (error: E) => Promise<Result<U, D>> }
  | { or: Promise<Result<U, D>> }
  | { map: (value: T) => Promise<U> };

/**
 * impl Lazy<T, E, Eval>
 */
class _Lazy<T, E, Eval extends Result<T, E>> implements Lazy<T, E, Eval> {
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
        result = Result.ok(p instanceof Promise ? await p : p);
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

/**
 * impl ToInstance
 */
function toInstance<T, E>(result: Ok<T>): Ok<T> & Context<T, E>;
function toInstance<T, E>(result: Err<E>): Err<E> & Context<T, E>;
function toInstance<T, E>(result: Result<T, E>): Instance<T, E>;
function toInstance<T, E>(
  result: { ok: boolean; value: T; error: E },
): Instance<T, E>;
function toInstance<T, E>(result: Result<T, E>): Instance<T, E> {
  return (result.ok
    ? Result.ok(result.value)
    : Result.err(result.error)) as Instance<T, E>;
}

/**
 * impl Static.ok
 */
function ok<T, E = never>(value: T): Ok<T> & Context<T, E> {
  return new _Ok(value);
}

/**
 * impl Static.err
 */
function err<T = never, E = Error>(error: E): Err<E> & Context<T, E> {
  return new _Err(error);
}

/**
 * impl Static.andThen
 */
async function andThen<
  R extends Fn[number] extends (() => infer R) | infer R
    ? (Awaited<R> extends Instance<infer _, infer _> ? Instance<T, E>
      : Result<T, E>)
    : never,
  Fn extends {
    [K in keyof T]:
      | OrPromise<Result<T[K], E>>
      | (() => OrPromise<Result<T[K], E>>);
  }[number][] = R extends Instance<infer T, infer E> ? (T extends unknown[] ? {
        [K in keyof T]:
          | OrPromise<Instance<T[K], E>>
          | (() => OrPromise<Instance<T[K], E>>);
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
    [K in keyof Fn]: Fn[K] extends (() => infer R) | infer R
      ? (Awaited<R> extends Result<unknown, unknown> ? AndT<Awaited<R>> : never)
      : never;
  }),
  E = ({
    [K in keyof Fn]: Fn[K] extends (() => infer R) | infer R
      ? (Awaited<R> extends Result<unknown, unknown> ? AndE<Awaited<R>, never>
        : never)
      : never;
  })[number],
>(
  ...fn: Fn
): Promise<R> {
  const oks: T[number][] = new Array(fn.length);
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: OrPromise<Result<T[number], E>> = typeof f === "function"
      ? f()
      : f;
    const result = p instanceof Promise ? await p : p;
    if (result.ok) {
      oks[i] = result.value;
    } else {
      return result as R;
    }
  }
  return Result.ok(oks) as never;
}

/**
 * impl Static.orElse
 */
async function orElse<
  R extends Fn[number] extends (() => infer R) | infer R
    ? (Awaited<R> extends Instance<infer _, infer _> ? Instance<T, E>
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

/**
 * impl Static.lazy
 */
function lazy<
  R extends Eval,
  Fn extends
    | OrPromise<Eval>
    | (() => OrPromise<Eval>) =
      | OrPromise<R>
      | (() => OrPromise<R>),
  Eval extends Result<T, E> = Fn extends (() => infer R) | infer R ? Awaited<R>
    : never,
  T = NextT<Eval, never>,
  E = NextE<Eval, never>,
>(result: Fn): Lazy<T, E, Eval> {
  return new _Lazy(result);
}
