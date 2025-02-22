import type * as c from "./context.ts";
import type { Instance as OptionInstance } from "./option.ts";
import { Option } from "./option.ts";

/**
 * Ok
 *
 * ### Example
 *
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
 */
export interface Ok<T> {
  /** ok: true */
  readonly ok: true;
  /** value: T */
  readonly value: T;
}

/**
 * Err
 *
 * ### Example
 *
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
 */
export interface Err<E> {
  /** ok: false */
  readonly ok: false;
  /** error: E */
  readonly error: E;
}

/** type Result */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/** type Instance */
export type Instance<T, E = Error> = Result<T, E> & Context<T, E>;

/** Context */
export interface Context<T, E>
  extends
    Iterable<T>,
    ResultToOption<T>,
    c.And<T>,
    c.Or<E>,
    c.Map<T>,
    c.Unwrap<T> {
  /**
   * andThen
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Result).andThen");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
   *   .andThen((n) => Result.ok(n.toFixed(2)));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  andThen<
    U,
    D,
    Fn extends (v: T) => Result<U, D>,
    Ok extends (
      ReturnType<Fn> extends Result<infer U, unknown> ? U : never
    ),
    Err extends (
      ReturnType<Fn> extends Result<unknown, infer D> ? E | D : E
    ),
    Return extends Result<Ok, Err> = Instance<Ok, Err>,
  >(fn: Fn): Return;

  /**
   * and
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Result).and");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
   *   .and(Result.ok("TOO LARGE"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  and<
    U,
    D,
    V extends Result<U, D>,
    Ok extends (
      V extends Result<infer U, unknown> ? U : never
    ),
    Err extends (
      V extends Result<unknown, infer D> ? E | D : E
    ),
    Return extends Result<Ok, Err> = Instance<Ok, Err>,
  >(
    result: V,
  ): Return;

  /**
   * orElse
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Result).orElse");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
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
    U,
    D,
    Fn extends (error: E) => Result<U, D>,
    Ok extends (
      ReturnType<Fn> extends Result<infer U, unknown> ? T | U : T
    ),
    Err extends (
      ReturnType<Fn> extends Result<unknown, infer D> ? E | D : E
    ),
    Return extends Result<Ok, Err> = Instance<Ok, Err>,
  >(fn: Fn): Return;

  /**
   * or
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Result).or");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
   *   .or(Result.ok(0));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  or<
    U,
    D,
    V extends Result<U, D>,
    Ok extends (
      V extends Result<infer U, unknown> ? T | U : T
    ),
    Err extends (
      V extends Result<unknown, infer D> ? E | D : E
    ),
    Return extends Result<Ok, Err> = Instance<Ok, Err>,
  >(result: V): Return;

  /**
   * map
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Result).map");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
   *   .map((n) => n.toFixed(2))
   *   .or(Result.ok("0.00"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  map<
    U,
    Fn extends (value: T) => U,
    Ok extends ReturnType<Fn>,
    Err extends E,
    Return extends Result<Ok, Err> = Instance<Ok, Err>,
  >(fn: Fn): Return;

  /**
   * unwrap
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Result).unwrap");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
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
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Result).unwrapOr");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
   *   .unwrapOr("0.00");
   *
   * console.log(`Result: ${fn()}`);
   */
  unwrapOr<U>(value: U): T | U;

  /**
   * unwrapOrElse
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Result).unwrapOrElse");
   *
   * const fn = () => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
   *   .unwrapOrElse((e) => {
   *     console.error(`Error: ${e}`);
   *     return "0.00";
   *   });
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  unwrapOrElse<U>(fn: (error: E) => U): T | U;
  /**
   * toString
   *
   * ### Example
   *
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
}

/** Static */
export interface Static {
  /**
   * return Ok<T>
   *
   * ### Example
   *
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
   * return Err<E>
   *
   * ### Example
   *
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
   * ### Example
   *
   * ```ts
   * console.log("[Example] Result.andThen");
   *
   * const getNumber = (count: number) => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.2 ? Result.ok(n) : Result.err(`${count}: less than 0.2`))
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
   */
  andThen: typeof andThen;
  /**
   * orElse
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] Result.orElse");
   *
   * const getNumber = (count: number) => Result.ok(Math.random())
   *   .andThen((n) => n >= 0.8 ? Result.ok(n) : Result.err(`${count}: less than 0.8`))
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
   */
  orElse: typeof orElse;
}

/** ResultToOption */
export interface ResultToOption<T> {
  /**
   * toOption
   *
   * ### Example
   *
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

/** impl Ok<T> */
class _Ok<T, E> implements Ok<T>, Context<T, E> {
  readonly ok = true;
  constructor(readonly value: T) {
  }

  toString(): string {
    return `Ok(${this.value})`;
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

/** impl Err<E> */
class _Err<T, E> implements Err<E>, Context<T, E> {
  readonly ok = false;
  constructor(readonly error: E) {}

  toString(): string {
    return `Err(${this.error})`;
  }

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

  [Symbol.iterator](): Iterator<T> {
    return Object.assign(this, {
      next(): IteratorResult<T> {
        return { done: true, value: undefined };
      },
    });
  }
}

function toInstance<T, E>(result: Result<T, E>): Instance<T, E> {
  return result.ok ? Result.ok(result.value) : Result.err(result.error);
}

function ok<T, E = Error>(value: T): Ok<T> & Context<T, E> {
  return new _Ok<T, E>(value);
}

function err<T, E>(error: E): Err<E> & Context<T, E> {
  return new _Err<T, E>(error);
}

async function andThen<
  T,
  E,
  Fn extends (() => Result<T, E> | Promise<Result<T, E>>)[],
  Ok extends ({
    [K in keyof Fn]: ReturnType<Fn[K]> extends Promise<Result<infer U, unknown>>
      ? U
      : ReturnType<Fn[K]> extends Result<infer U, unknown> ? U
      : never;
  }),
  Err extends ({
    [K in keyof Fn]: ReturnType<Fn[K]> extends Promise<Result<unknown, infer D>>
      ? D
      : ReturnType<Fn[K]> extends Result<unknown, infer D> ? D
      : never;
  })[number],
  Return extends Result<Ok, Err> = Instance<Ok, Err>,
>(
  ...fn: Fn
): Promise<Return> {
  const oks: T[] = new Array(fn.length);
  for (let i = 0; i < fn.length; i++) {
    const result = await fn[i]();
    if (result.ok) {
      oks[i] = result.value;
    } else {
      return result as unknown as Return;
    }
  }
  return Result.ok(oks) as unknown as Return;
}

async function orElse<
  T,
  E,
  F extends () => Promise<Result<T, E>> | Result<T, E>,
  Fn extends [F, ...F[]],
  Ok extends ({
    [K in keyof Fn]: ReturnType<Fn[K]> extends Promise<Result<infer T, unknown>>
      ? T
      : ReturnType<Fn[K]> extends Result<infer T, unknown> ? T
      : never;
  })[number],
  Err extends ({
    [K in keyof Fn]: ReturnType<Fn[K]> extends Promise<Result<unknown, infer E>>
      ? E
      : ReturnType<Fn[K]> extends Result<unknown, infer E> ? E
      : never;
  })[number],
  Return extends Result<Ok, Err> = Instance<Ok, Err>,
>(...fn: Fn): Promise<Return> {
  let last;
  for (let i = 0; i < fn.length; i++) {
    const result = await fn[i]();
    if (result.ok) {
      return result as unknown as Return;
    }
    last = result;
  }
  return last as unknown as Return;
}

/** type ToInstance */
export type ToInstance = <T, E>(result: Result<T, E>) => Instance<T, E>;

/** impl Result */
export const Result: ToInstance & Static = Object.assign(
  toInstance,
  { ok, err, andThen, orElse },
);
