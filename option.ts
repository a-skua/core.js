import type * as c from "./context.ts";
import type { Instance as ResultInstance } from "./result.ts";
import { Result } from "./result.ts";

/**
 * Some
 *
 * ### Example
 *
 * ```ts
 * import { assertObjectMatch } from "@std/assert";
 *
 * const option = Option.some("is some");
 * assertObjectMatch(option, {
 *   some: true,
 *   value: "is some",
 * });
 * ```
 */
export interface Some<T> {
  /** som: true */
  readonly some: true;
  /** value: T */
  readonly value: T;
}

/**
 * None
 *
 * ### Example
 *
 * ```ts
 * import { assertObjectMatch } from "@std/assert";
 *
 * const option = Option.none();
 * assertObjectMatch(option, {
 *   some: false,
 * });
 * ```
 */
export interface None {
  /** some: alse */
  readonly some: false;
}

/** type Option */
export type Option<T> = Some<T> | None;

/** type Instance */
export type Instance<T> = Option<T> & Context<T>;

/** Context */
export interface Context<T>
  extends
    Iterable<T>,
    OptionToResult<T>,
    c.And<T>,
    c.Or<never>,
    c.Map<T>,
    c.Unwrap<T> {
  /**
   * andThen
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Option).andThen");
   *
   * const fn = () => Option.some(Math.random())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
   *   .andThen((n) => Option.some(n.toFixed(2)));
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  andThen<
    U,
    Fn extends (v: T) => U,
    Some extends (
      ReturnType<Fn> extends Option<infer U> ? U : never
    ),
    Return extends Option<Some> = Instance<Some>,
  >(fn: Fn): Return;

  /**
   * and
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Option).and");
   *
   * const fn = () => Option.some(Math.random())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
   *   .and(Option.some("TOO LARGE"));
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  and<
    U,
    V extends Option<U>,
    Some extends (
      V extends Option<infer U> ? U : never
    ),
    Return extends Option<Some> = Instance<Some>,
  >(option: V): Return;

  /**
   * orElse
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Option).orElse");
   *
   * const fn = () => Option.some(Math.random())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
   *   .andThen((n) => Option.some(n.toFixed(2)))
   *   .orElse(() => Option.some("0.00"));
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  orElse<
    U,
    Fn extends () => U,
    Some extends (
      U extends Option<infer U> ? U : never
    ),
    Return extends Option<Some> = Instance<Some>,
  >(fn: Fn): Return;

  /**
   * or
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Option).or");
   *
   * const fn = () => Option.some(Math.random())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
   *   .andThen((n) => Option.some(n.toFixed(2)))
   *   .or(Option.some("0.00"));
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  or<
    U,
    V extends Option<U>,
    Some extends (
      V extends Option<infer U> ? U : never
    ),
    Return extends Option<Some> = Instance<Some>,
  >(option: V): Return;

  /**
   * map
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Option).map");
   *
   * const fn = () => Option.some(Math.random())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
   *   .map((n) => n.toFixed(2));
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  map<
    U,
    Fn extends (v: T) => U,
    Some extends (
      ReturnType<Fn> extends Option<infer U> ? U : never
    ),
    Return extends Option<Some> = Instance<Some>,
  >(fn: Fn): Return;

  /**
   * unwrap
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Option).unwrap");
   *
   * const fn = () => Option.some(Math.random())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
   *   .andThen((n) => Option.some(n.toFixed(2)))
   *   .or(Option.some("0.00"))
   *   .unwrap();
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  unwrap(): T;

  /**
   * unwrapOr
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Option).unwrapOr");
   *
   * const fn = () => Option.some(Math.random())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
   *   .andThen((n) => Option.some(n.toFixed(2)))
   *   .unwrapOr("0.00");
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  unwrapOr<U>(defaultValue: U): T | U;

  /**
   * unwrapOrElse
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] (Option).unwrapOrElse");
   *
   * const fn = () => Option.some(Math.random())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
   *   .andThen((n) => Option.some(n.toFixed(2)))
   *   .unwrapOrElse(() => "0.00");
   *
   * console.log(`Option: ${fn()}`);
   * ```
   */
  unwrapOrElse<U>(fn: () => U): T | U;

  /**
   * toString
   *
   * ### Example
   *
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const some = Option.some("is some");
   * assertEquals(some.toString(), "Some(is some)");
   *
   * const none = Option.none();
   * assertEquals(none.toString(), "None");
   * ```
   */
  toString(): string;
}

/**
 * type StaticOption
 */
export interface Static {
  /**
   * Create a Some instance.
   *
   * ### Example
   *
   * ```ts
   * import { assertEquals, assertObjectMatch } from "@std/assert";
   *
   * assertObjectMatch(
   *   Option.some("is some"),
   *   { some: true, value: "is some" },
   * );
   *
   * for (const value of Option.some("is some")) {
   *   assertEquals(value, "is some");
   * }
   *
   * const array = Array.from(Option.some("is some"));
   * assertEquals(array, ["is some"]);
   * ```
   */
  some: typeof some;

  /**
   * Create a None instance.
   *
   * ### Example
   *
   * ```ts
   * import { assert, assertEquals, assertObjectMatch } from "@std/assert";
   *
   * assertObjectMatch(
   *   Option.none(),
   *   { some: false },
   * );
   *
   * for (const _ of Option.none()) {
   *   assert(false);
   * }
   *
   * const array = Array.from(Option.none());
   * assertEquals(array, []);
   */
  none: typeof none;

  /**
   * andThen
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] Option.andThen");
   *
   * const getNumber = () => Option.some(Math.random())
   *   .andThen((n) => n >= 0.2 ? Option.some(n) : Option.none())
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
   */
  andThen: typeof andThen;

  /**
   * orElse
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] Option.orElse");
   *
   * const getNumber = () => Option.some(Math.random())
   *   .andThen((n) => n >= 0.8 ? Option.some(n) : Option.none())
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
   */
  orElse: typeof orElse;
}

/** OptionToResult */
export interface OptionToResult<T> {
  /** toResult
   *
   * ### Example
   *
   * ```ts
   * import { assertEquals } from "@std/assert";
   * import { Result } from "@askua/core/result";
   *
   * const ok = Option.some("is some").toResult();
   * assertEquals(ok, Result.ok("is some"));
   *
   * const err = Option.none().toResult<Error>();
   * assertEquals(err, Result.err(new Error("None")));
   *
   * const customErr = Option.none().toResult<string>("is none");
   * assertEquals(customErr, Result.err("is none"));
   * ```
   */
  toResult<E = never, R extends Result<T, E> = ResultInstance<T, E>>(
    error?: E,
  ): R;
}

/** impl Some */
class _Some<T> implements Some<T>, Context<T> {
  readonly some = true;
  constructor(readonly value: T) {}

  toString(): string {
    return `Some(${this.value})`;
  }

  toResult<R>(): R {
    return Result.ok(this.value) as unknown as R;
  }

  andThen<U, V>(fn: (v: T) => U): V {
    return fn(this.value) as unknown as V;
  }

  and<U, V>(option: U): V {
    return option as unknown as V;
  }

  orElse<U>(): U {
    return this as unknown as U;
  }

  or<U>(): U {
    return this as unknown as U;
  }

  map<U, V>(fn: (v: T) => U): V {
    return Option.some(fn(this.value)) as V;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(): T {
    return this.value;
  }

  unwrapOrElse<U>(): U {
    return this.value as unknown as U;
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

/** impl None */
class _None<T> implements None, Context<T> {
  readonly some = false;
  constructor() {}

  toString(): string {
    return "None";
  }

  toResult<E, R>(error: E = new Error("None") as E): R {
    return Result.err(error) as unknown as R;
  }

  andThen<U>(): U {
    return this as unknown as U;
  }

  and<U>(): U {
    return this as unknown as U;
  }

  orElse<U, V>(fn: () => U): V {
    return fn() as unknown as V;
  }

  or<U, V>(option: U): V {
    return option as unknown as V;
  }

  map<U>(): U {
    return this as unknown as U;
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

  /** impl Iterable */
  [Symbol.iterator](): Iterator<T> {
    return Object.assign(this, {
      next(): IteratorResult<T> {
        return { done: true, value: undefined };
      },
    });
  }
}

function toInstance<T>(option: Option<T>): Instance<T> {
  return option.some ? Option.some(option.value) : Option.none();
}

function some<T>(value: T): Some<T> & Context<T> {
  return new _Some(value);
}

function none<T = never>(): None & Context<T> {
  return new _None<T>();
}

async function andThen<
  T,
  Fn extends (() => Option<T> | Promise<Option<T>>)[],
  Some extends ({
    [K in keyof Fn]: ReturnType<Fn[K]> extends Promise<Option<infer T>> ? T
      : ReturnType<Fn[K]> extends Option<infer T> ? T
      : never;
  }),
  Return extends Option<Some> = Instance<Some>,
>(...fn: Fn): Promise<Return> {
  const somes: T[] = new Array(fn.length);
  for (let i = 0; i < fn.length; i++) {
    const option = await fn[i]();
    if (option.some) {
      somes[i] = option.value;
    } else {
      return option as Return;
    }
  }

  return Option.some(somes) as unknown as Return;
}

async function orElse<
  T,
  F extends () => Option<T> | Promise<Option<T>>,
  Fn extends [F, ...F[]],
  Some extends ({
    [K in keyof Fn]: ReturnType<Fn[K]> extends Promise<Option<infer T>> ? T
      : ReturnType<Fn[K]> extends Option<infer T> ? T
      : never;
  })[number],
  Return extends Option<Some> = Instance<Some>,
>(...fn: Fn): Promise<Return> {
  let last;
  for (let i = 0; i < fn.length; i++) {
    const option = await fn[i]();
    if (option.some) {
      return option as unknown as Return;
    }
    last = option;
  }
  return last as unknown as Return;
}

/** type ToInstance */
export type ToInstance = <T>(option: Option<T>) => Instance<T>;

/** impl StaticOption */
export const Option: ToInstance & Static = Object.assign(
  toInstance,
  { some, none, andThen, orElse },
);
