/**
 * @example
 * ```ts
 * import { type Instance, Result } from "@askua/core/result";
 *
 * const n: Instance<number> = Result.ok(Math.random())
 *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")));
 *
 * console.log(n.map((n) => n.toFixed(2)).unwrapOr("0.00"));
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import type { Instance as OptionInstance } from "./option.ts";
import { Option } from "./option.ts";

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
export interface Ok<T, _> {
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
export interface Err<_, E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * Result
 *
 * @example
 * ```ts
 * const ok: Result<number> = Result.ok(1);
 * const err: Result<number> = Result.err(new Error("error"));
 * ```
 *
 * @typeParam T - value type
 * @typeParam E - error type (default: Error)
 */
export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

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
 * const ok: Result<number> = Instance({ ok: true, value: 1 });
 * const err: Result<number> = Instance({ ok: false, error: new Error("error") });
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
export type ToInstance = <Ok, Err>(
  result: Result<Ok, Err>,
) => Instance<Ok, Err>;

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
  andThen<
    U extends Result<unknown, unknown>,
    Fn extends (value: T) => U,
    Ok extends ReturnType<Fn> extends Result<infer Ok, infer _> ? Ok : never,
    Err extends ReturnType<Fn> extends Result<infer _, infer Err> ? E | Err
      : never,
    Return extends ReturnType<Fn> extends Instance<infer _, infer __>
      ? Instance<Ok, Err>
      : Result<Ok, Err>,
  >(fn: Fn): Return;

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
  and<
    R extends Result<unknown, unknown>,
    Ok extends R extends Result<infer Ok, infer _> ? Ok : never,
    Err extends R extends Result<infer _, infer Err> ? E | Err : never,
    Return extends R extends Instance<infer _, infer __> ? Instance<Ok, Err>
      : Result<Ok, Err>,
  >(result: R): Return;

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
  orElse<
    U extends Result<unknown, unknown>,
    Fn extends (error: E) => U,
    Ok extends ReturnType<Fn> extends Result<infer Ok, infer _> ? T | Ok
      : never,
    Err extends ReturnType<Fn> extends Result<infer _, infer Err> ? E | Err
      : never,
    Return extends ReturnType<Fn> extends Instance<infer _, infer __>
      ? Instance<Ok, Err>
      : Result<Ok, Err>,
  >(fn: Fn): Return;

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
  or<
    R extends Result<unknown, unknown>,
    Ok extends R extends Result<infer Ok, unknown> ? T | Ok : never,
    Err extends R extends Result<unknown, infer Err> ? E | Err : never,
    Return extends R extends Instance<infer _, infer __> ? Instance<Ok, Err>
      : Result<Ok, Err>,
  >(result: R): Return;

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
  map<
    U extends unknown,
    Fn extends (value: T) => U,
    Ok extends ReturnType<Fn>,
    Err extends E,
    Return extends Result<Ok, Err> = Instance<Ok, Err>,
  >(fn: Fn): Return;

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
  unwrapOr<Ok>(value: Ok): T | Ok;

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
  unwrapOrElse<Ok>(fn: (error: E) => Ok): T | Ok;

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
  lazy<Eval extends Result<T, E> = Instance<T, E>>(): Lazy<T, E, Eval>;
}

/**
 * Result Lazy eval
 *
 * @typeParam T - value type
 * @typeParam E - error type
 * @typeParam Eval - eval Result
 */
export interface Lazy<T, E, Eval extends Result<unknown, unknown>>
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
    U extends Result<unknown, unknown>,
    Fn extends (v: T) => Promise<U> | U,
    Ok extends Awaited<ReturnType<Fn>> extends Result<infer Ok, infer _> ? Ok
      : never,
    Err extends Awaited<ReturnType<Fn>> extends Result<infer _, infer Err>
      ? E | Err
      : never,
    Z extends Awaited<ReturnType<Fn>> extends Instance<infer _, infer __>
      ? (Eval extends Instance<infer _, infer __> ? Instance<Ok, Err>
        : Result<Ok, Err>)
      : Result<Ok, Err>,
    Return extends Lazy<Ok, Err, Z>,
  >(fn: Fn): Return;

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
    U extends Result<unknown, unknown>,
    R extends Promise<U> | U,
    Ok extends Awaited<R> extends Result<infer Ok, infer _> ? Ok : never,
    Err extends Awaited<R> extends Result<infer _, infer Err> ? E | Err : never,
    Z extends Awaited<R> extends Instance<infer _, infer __>
      ? (Eval extends Instance<infer _, infer __> ? Instance<Ok, Err>
        : Result<Ok, Err>)
      : Result<Ok, Err>,
    Return extends Lazy<Ok, Err, Z>,
  >(result: R): Return;

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
    U extends Result<unknown, unknown>,
    Fn extends (error: E) => Promise<U> | U,
    Ok extends Awaited<ReturnType<Fn>> extends Result<infer Ok, infer _>
      ? T | Ok
      : never,
    Err extends Awaited<ReturnType<Fn>> extends Result<infer _, infer Err>
      ? E | Err
      : never,
    Z extends Awaited<ReturnType<Fn>> extends Instance<infer _, infer __>
      ? (Eval extends Instance<infer _, infer __> ? Instance<Ok, Err>
        : Result<Ok, Err>)
      : Result<Ok, Err>,
    Return extends Lazy<Ok, Err, Z>,
  >(fn: Fn): Return;

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
    U extends Result<unknown, unknown>,
    R extends Promise<U> | U,
    Ok extends Awaited<R> extends Result<infer Ok, infer _> ? T | Ok : never,
    Err extends Awaited<R> extends Result<infer _, infer Err> ? E | Err : never,
    Z extends Awaited<R> extends Instance<infer _, infer __>
      ? (Eval extends Instance<infer _, infer __> ? Instance<Ok, Err>
        : Result<Ok, Err>)
      : Result<Ok, Err>,
    Return extends Lazy<Ok, Err, Z>,
  >(result: R): Return;

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
    U extends unknown,
    Fn extends (value: T) => Promise<U> | U,
    Ok extends Awaited<ReturnType<Fn>> extends infer Ok ? Ok : never,
    Err extends E,
    Z extends Eval extends Instance<infer _, infer __> ? Instance<Ok, Err>
      : Result<Ok, Err>,
    Return extends Lazy<Ok, Err, Z>,
  >(fn: Fn): Return;

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
   *   () => Promise.resolve(Result.ok(4)),
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
  toOption<O extends Option<T> = OptionInstance<T>>(): O;
}

/**
 * impl Ok<T, E>
 */
class _Ok<T, E> implements Ok<T, E>, Context<T, E> {
  readonly ok = true;
  constructor(readonly value: T) {
  }

  toOption<O>(): O {
    return Option.some(this.value) as O;
  }

  andThen<U, V>(fn: (v: T) => U): V {
    return fn(this.value) as unknown as V;
  }

  and<U, V>(result: U): V {
    return result as unknown as V;
  }

  orElse<U>(): U {
    return this as unknown as U;
  }

  or<U>(): U {
    return this as unknown as U;
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
    return new _Lazy(this as unknown as Z);
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
class _Err<T, E> implements Err<T, E>, Context<T, E> {
  readonly ok = false;
  constructor(readonly error: E) {}

  toOption<O extends Option<T> = OptionInstance<T>>(): O {
    return Option.none() as unknown as O;
  }

  andThen<U>(): U {
    return this as unknown as U;
  }

  and<U>(): U {
    return this as unknown as U;
  }

  map<U>(): U {
    return this as unknown as U;
  }

  orElse<U, V>(fn: (error: E) => U): V {
    return fn(this.error) as unknown as V;
  }

  or<U, V>(result: U): V {
    return result as unknown as V;
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
    return new _Lazy(this as unknown as Z);
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
class _Lazy<T, E, Eval extends Result<unknown, unknown>>
  implements Lazy<T, E, Eval> {
  readonly op: Op<unknown, unknown, unknown, unknown>[] = [];

  constructor(
    readonly first: (() => Promise<Eval> | Eval) | Promise<Eval> | Eval,
  ) {
  }

  andThen<U, V>(andThen: U): V {
    this.op.push({ andThen } as typeof this.op[number]);
    return this as unknown as V;
  }

  and<U, V>(and: U): V {
    this.op.push({ and } as typeof this.op[number]);
    return this as unknown as V;
  }

  orElse<U, V>(orElse: U): V {
    this.op.push({ orElse } as typeof this.op[number]);
    return this as unknown as V;
  }

  or<U, V>(or: U): V {
    this.op.push({ or } as typeof this.op[number]);
    return this as unknown as V;
  }

  map<U, V>(map: U): V {
    this.op.push({ map } as typeof this.op[number]);
    return this as unknown as V;
  }

  async eval(): Promise<Eval> {
    const p = typeof this.first === "function" ? this.first() : this.first;
    let result: Result<unknown, unknown> = p instanceof Promise ? await p : p;
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
function toInstance<Ok, Err>(result: Result<Ok, Err>): Instance<Ok, Err> {
  return result.ok ? Result.ok(result.value) : Result.err(result.error);
}

/**
 * impl Static.ok
 */
function ok<Ok, Err = Error>(value: Ok): Instance<Ok, Err> {
  return new _Ok(value);
}

/**
 * impl Static.err
 */
function err<Ok, Err = Error>(error: Err): Instance<Ok, Err> {
  return new _Err(error);
}

/**
 * impl Static.andThen
 */
async function andThen<
  U extends Result<unknown, unknown>,
  F extends (() => Promise<U> | U) | Promise<U> | U,
  Fn extends F[],
  Ok extends ({
    [K in keyof Fn]: Fn[K] extends (() => infer R) | infer R
      ? (Awaited<R> extends Result<infer Ok, infer _> ? Ok : never)
      : never;
  }),
  Err extends ({
    [K in keyof Fn]: Fn[K] extends (() => infer R) | infer R
      ? (Awaited<R> extends Result<infer _, infer Err> ? Err : never)
      : never;
  })[number],
  Return extends Fn[number] extends (() => infer R) | infer R
    ? (Awaited<R> extends Instance<infer _, infer __> ? Instance<Ok, Err>
      : Result<Ok, Err>)
    : never,
>(
  ...fn: Fn
): Promise<Return> {
  const oks: unknown[] = new Array(fn.length);
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: Promise<Result<unknown, unknown>> | Result<unknown, unknown> =
      typeof f === "function" ? f() : f;
    const result = p instanceof Promise ? await p : p;
    if (result.ok) {
      oks[i] = result.value;
    } else {
      return result as Return;
    }
  }
  return Result.ok(oks) as unknown as Return;
}

/**
 * impl Static.orElse
 */
async function orElse<
  U extends Result<unknown, unknown>,
  F extends (() => Promise<U> | U) | Promise<U> | U,
  Fn extends [F, ...F[]],
  Ok extends ({
    [K in keyof Fn]: Fn[K] extends (() => infer R) | infer R
      ? (Awaited<R> extends Result<infer Ok, infer _> ? Ok : never)
      : never;
  })[number],
  Err extends ({
    [K in keyof Fn]: Fn[K] extends (() => infer R) | infer R
      ? (Awaited<R> extends Result<infer _, infer Err> ? Err : never)
      : never;
  })[number],
  Return extends Fn[number] extends (() => infer R) | infer R
    ? (Awaited<R> extends Instance<infer _, infer __> ? Instance<Ok, Err>
      : (Awaited<R> extends Result<infer _, infer __> ? Result<Ok, Err>
        : never))
    : never,
>(...fn: Fn): Promise<Return> {
  let last;
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: Promise<Result<unknown, unknown>> | Result<unknown, unknown> =
      typeof f === "function" ? f() : f;
    const result = p instanceof Promise ? await p : p;
    if (result.ok) {
      return result as Return;
    }
    last = result;
  }
  return last as Return;
}

/**
 * impl Static.lazy
 */
function lazy<
  U extends Result<unknown, unknown>,
  R extends (() => Promise<U> | U) | Promise<U> | U,
  Ok extends R extends (() => infer R) | infer R
    ? (Awaited<R> extends
      Instance<infer Ok, infer _> | Result<infer Ok, infer _> ? Ok : never)
    : never,
  Err extends R extends (() => infer R) | infer R
    ? (Awaited<R> extends
      Instance<infer _, infer Err> | Result<infer _, infer Err> ? Err : never)
    : never,
  Eval extends R extends (() => infer R) | infer R
    ? (Awaited<R> extends Instance<infer Ok, infer Err> ? Instance<Ok, Err>
      : Result<Ok, Err>)
    : never,
>(
  result: R,
): Lazy<Ok, Err, Eval> {
  return new _Lazy(result as unknown as Eval);
}
