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
export interface Ok<T, _> {
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
export interface Err<_, E> {
  /** ok: false */
  readonly ok: false;
  /** error: E */
  readonly error: E;
}

/** type Result */
export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

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
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Result.ok(n.toFixed(2)));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  andThen<
    Fn extends (v: T) => Result<unknown, unknown>,
    Ok extends ReturnType<Fn> extends Result<infer U, infer _> ? U : never,
    Err extends ReturnType<Fn> extends Result<infer _, infer D> ? E | D : never,
    Return extends Result<Ok, Err> = ReturnType<Fn> extends
      Instance<infer _, infer __> ? Instance<Ok, Err>
      : ReturnType<Fn> extends Result<infer _, infer __> ? Result<Ok, Err>
      : never,
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
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .and(Result.ok("TOO LARGE"));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  and<
    U extends Result<unknown, unknown>,
    Ok extends U extends Result<infer U, infer _> ? U : never,
    Err extends U extends Result<infer _, infer D> ? E | D : never,
    Return extends Result<Ok, Err> = U extends Instance<infer _, infer __>
      ? Instance<Ok, Err>
      : U extends Result<infer _, infer __> ? Result<Ok, Err>
      : never,
  >(result: U): Return;

  /**
   * orElse
   *
   * ### Example
   *
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
    Fn extends (error: E) => Result<unknown, unknown>,
    Ok extends ReturnType<Fn> extends Result<infer U, infer _> ? T | U : never,
    Err extends ReturnType<Fn> extends Result<infer _, infer D> ? E | D : never,
    Return extends Result<Ok, Err> = ReturnType<Fn> extends
      Instance<infer _, infer __> ? Instance<Ok, Err>
      : ReturnType<Fn> extends Result<infer _, infer __> ? Result<Ok, Err>
      : never,
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
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err<number>(new Error("less than 0.5")))
   *   .andThen((n) => Result.ok(n.toFixed(2)))
   *   .or(Result.ok(0));
   *
   * console.log(`Result: ${fn()}`);
   * ```
   */
  or<
    U extends Result<unknown, unknown>,
    Ok extends U extends Result<infer U, unknown> ? T | U : never,
    Err extends U extends Result<unknown, infer D> ? E | D : never,
    Return extends Result<Ok, Err> = U extends Instance<infer _, infer __>
      ? Instance<Ok, Err>
      : U extends Result<infer _, infer __> ? Result<Ok, Err>
      : never,
  >(result: U): Return;

  /**
   * map
   *
   * ### Example
   *
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
    Fn extends (value: T) => unknown,
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
   * ### Example
   *
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

  /**
   * lazy
   */
  lazy(): Lazy<T, E>;
}

/** Lazy */
export interface Lazy<T, E> extends c.And<T>, c.Or<E>, c.Map<T> {
  /**
   * andThen
   *
   * ### Example
   *
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
    Fn extends (
      v: T,
    ) => Promise<Result<unknown, unknown>> | Result<unknown, unknown>,
    Ok extends Awaited<ReturnType<Fn>> extends Result<infer U, infer _> ? U
      : never,
    Err extends Awaited<ReturnType<Fn>> extends Result<infer _, infer D> ? E | D
      : never,
    Return extends Lazy<Ok, Err> = Lazy<Ok, Err>,
  >(fn: Fn): Return;

  /**
   * and
   *
   * ### Example
   *
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
    U extends Promise<Result<unknown, unknown>> | Result<unknown, unknown>,
    Ok extends Awaited<U> extends Result<infer U, infer _> ? U : never,
    Err extends Awaited<U> extends Result<infer _, infer D> ? E | D : never,
    Return extends Lazy<Ok, Err> = Lazy<Ok, Err>,
  >(result: U): Return;

  /**
   * orElse
   *
   * ### Example
   *
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
    Fn extends (
      error: E,
    ) => Promise<Result<unknown, unknown>> | Result<unknown, unknown>,
    Ok extends Awaited<ReturnType<Fn>> extends Result<infer U, infer _> ? T | U
      : never,
    Err extends Awaited<ReturnType<Fn>> extends Result<infer _, infer D> ? E | D
      : never,
    Return extends Lazy<Ok, Err> = Lazy<Ok, Err>,
  >(fn: Fn): Return;

  /**
   * or
   *
   * ### Example
   *
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
    U extends Promise<Result<unknown, unknown>> | Result<unknown, unknown>,
    Ok extends Awaited<U> extends Result<infer U, infer _> ? T | U : never,
    Err extends Awaited<U> extends Result<infer _, infer D> ? E | D : never,
    Return extends Lazy<Ok, Err> = Lazy<Ok, Err>,
  >(result: U): Return;

  /**
   * map
   *
   * ### Example
   *
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
    Fn extends (value: T) => Promise<unknown> | unknown,
    Ok extends Awaited<ReturnType<Fn>> extends infer U ? U : never,
    Err extends E,
    Return extends Lazy<Ok, Err> = Lazy<Ok, Err>,
  >(fn: Fn): Return;

  /**
   * eval
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Lazy).eval");
   *
   * const result: Result<number> = await Result.lazy(Result.ok(1)).eval();
   *
   * console.debug(`Result: ${result}`);
   * ```
   */
  eval<Return extends Result<T, E> = Instance<T, E>>(): Promise<Return>;

  /**
   * toString
   *
   * ### Example
   *
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(
   *   Result.lazy(Result.ok(1)).toString(),
   *   "Lazy<Ok(1)>",
   * );
   *
   * assertEquals(
   *   Result.lazy(Result.ok(1)).map((n) => n * 100).or(Result.ok(0)).toString(),
   *   "Lazy<Ok(1).map((n)=>n * 100).or(Ok(0))>",
   * );
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
   */
  orElse: typeof orElse;

  /**
   * lazy
   */
  lazy: typeof lazy;
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

  lazy(): Lazy<T, E> {
    return new _Lazy<T, E>(this);
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

/** impl Err<E> */
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

  lazy(): Lazy<T, E> {
    return new _Lazy<T, E>(this);
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

/** impl Lazy<T, E> */
class _Lazy<T, E> implements Lazy<T, E> {
  readonly op: Op<unknown, unknown, unknown, unknown>[] = [];

  constructor(readonly first: Promise<Result<T, E>> | Result<T, E>) {
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

  async eval<U>(): Promise<U> {
    let result: Result<unknown, unknown> = await this.first;
    for (const op of this.op) {
      if ("andThen" in op && result.ok) {
        result = await op.andThen(result.value);
      } else if ("and" in op && result.ok) {
        result = await op.and;
      } else if ("orElse" in op && !result.ok) {
        result = await op.orElse(result.error);
      } else if ("or" in op && !result.ok) {
        result = await op.or;
      } else if ("map" in op && result.ok) {
        result = Result.ok(await op.map(result.value));
      }
    }
    return result as U;
  }

  toString(): string {
    if (this.op.length === 0) return `Lazy<${this.first}>`;

    const op = this.op.map((op) =>
      Object.entries(op).map(([fn, arg]) => `${fn}(${arg})`)
    ).flat().join(".");

    return `Lazy<${this.first}.${op}>`;
  }
}

function toInstance<T, E>(result: Result<T, E>): Instance<T, E> {
  return result.ok ? Result.ok(result.value) : Result.err(result.error);
}

function ok<T, E = Error>(value: T): Instance<T, E> {
  return new _Ok<T, E>(value);
}

function err<T, E = Error>(error: E): Instance<T, E> {
  return new _Err<T, E>(error);
}

async function andThen<
  Fn extends (() =>
    | Result<unknown, unknown>
    | Promise<Result<unknown, unknown>>)[],
  Ok extends ({
    [K in keyof Fn]: Awaited<ReturnType<Fn[K]>> extends Result<infer U, infer _>
      ? U
      : never;
  }),
  Err extends ({
    [K in keyof Fn]: Awaited<ReturnType<Fn[K]>> extends Result<infer _, infer D>
      ? D
      : never;
  })[number],
  Return extends Result<Ok, Err> = Awaited<ReturnType<Fn[number]>> extends
    Instance<infer _, infer __> ? Instance<Ok, Err>
    : Awaited<ReturnType<Fn[number]>> extends Result<infer _, infer __>
      ? Result<Ok, Err>
    : never,
>(
  ...fn: Fn
): Promise<Return> {
  const oks: unknown[] = new Array(fn.length);
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
  F extends () => Promise<Result<unknown, unknown>> | Result<unknown, unknown>,
  Fn extends [F, ...F[]],
  Ok extends ({
    [K in keyof Fn]: Awaited<ReturnType<Fn[K]>> extends Result<infer T, infer _>
      ? T
      : never;
  })[number],
  Err extends ({
    [K in keyof Fn]: Awaited<ReturnType<Fn[K]>> extends Result<infer _, infer E>
      ? E
      : never;
  })[number],
  Return extends Result<Ok, Err> = Awaited<ReturnType<Fn[number]>> extends
    Instance<infer _, infer __> ? Instance<Ok, Err>
    : Awaited<ReturnType<Fn[number]>> extends Result<infer _, infer __>
      ? Result<Ok, Err>
    : never,
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

function lazy<T, E = Error>(
  result: Promise<Result<T, E>> | Result<T, E>,
): Lazy<T, E> {
  return new _Lazy<T, E>(result);
}

/** type ToInstance */
export type ToInstance = <T, E>(result: Result<T, E>) => Instance<T, E>;

/** impl Result */
export const Result: ToInstance & Static = Object.assign(
  toInstance,
  { ok, err, andThen, orElse, lazy },
);
