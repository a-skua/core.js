/**
 * Option is Object base type, Some<T> and None.
 *
 * ```ts
 * import type { Some, None, Option } from "@askua/core/option";
 *
 * const some: Some<number> = { some: true, value: 1 };
 * const none: None = { some: false };
 * ```
 * # Usage
 *
 * ```ts
 * import type { Option } from "@askua/core/option";
 *
 * const option = ((): Option<number> => ({ some: true, value: 1 }))();
 * if (option.some) {
 *   console.log(option.value);
 * }
 * ```
 *
 * # Why Object base?
 *
 * If you use on Server and Browser, using JSON.stringify and JSON.parse.
 * So, Object base is easy to use.
 *
 * ```ts
 * import type { Some } from "@askua/core/option";
 *
 * const json: string = `{"some":true,"value":1}`;
 *
 * const option: Option<number> = JSON.parse(json);
 * if (option.some) {
 *   console.log(option.value);
 * }
 * ```
 *
 * # Using with method
 *
 * ```ts
 * import { Option } from "@askua/core/option";
 *
 * const option: Option<string> = Option.some(Math.random())
 *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
 *   .map((n) => n.toFixed(2));
 *
 * if (option.some) {
 *   console.log(option.value);
 * }
 * ```
 *
 * @example
 * ```ts
 * import { Instance as Option } from "@askua/core/option";
 *
 * const n: Option<string> = Option.some(Math.random())
 *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
 *   .map((n) => n.toFixed(2));
 *
 * console.log(n.unwrapOr("None!"));
 * ```
 *
 * @example
 * ```ts
 * import { Option } from "@askua/core/option";
 *
 * const getNumber = () => Option.some(Math.random())
 *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none());
 *
 * const list = [
 *   [...getNumber().map((n) => n.toFixed(2))],
 *   [...getNumber().map((n) => n.toFixed(2))],
 *   [...getNumber().map((n) => n.toFixed(2))],
 * ];
 *
 * console.log(list);
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import { Instance as Result } from "./result.ts";
import type { OrPromise } from "./types.ts";

/**
 * Option element Some
 *
 * @example
 * ```ts
 * import { assertObjectMatch } from "@std/assert";
 *
 * const option = Option.some("is some");
 * assertObjectMatch(option, {
 *   some: true,
 *   value: "is some",
 * });
 * ```
 *
 * @typeParam T - value type
 */
export interface Some<T> {
  readonly some: true;
  readonly value: T;
}

/**
 * Option element None
 *
 * @example
 * ```ts
 * import { assertObjectMatch } from "@std/assert";
 *
 * const option = Option.none();
 * assertObjectMatch(option, {
 *   some: false,
 * });
 * ```
 *
 * @typeParam _ - value type
 */
export interface None {
  readonly some: false;
}

/**
 * Option
 *
 * @example
 * ```ts
 * const some: Option<number> = Option.some(1);
 * const none: Option<number> = Option.none();
 * ```
 *
 * @typeParam T - value type
 */
export type Option<T> = Some<T> | None;

/**
 * impl Option
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const option = Option({ some: true, value: 1 })
 *   .map((n) => n + 1);
 *
 * assertEquals(option, Option.some(2));
 * ```
 */
export const Option: ToInstance & Static = Object.assign(
  toInstance,
  { some, none, andThen, orElse, lazy },
);

/**
 * Option Instance
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const value = Option.none()
 *   .map((n) => n + 1)
 *   .unwrapOr(0);
 *
 * assertEquals(value, 0);
 * ```
 *
 * @typeParam T - value type
 */
export type Instance<T> = Option<T> & Context<T>;

/**
 * impl Instance
 *
 * @example
 * ```ts
 * const some: Option<number> = Instance({ some: true, value: 1 });
 * const none: Option<number> = Instance({ some: false });
 * ```
 */
export const Instance: ToInstance & Static = Option;

/**
 * Option ToInstance
 *
 * @example
 * ```ts
 * const some: Option<number> = Option({ some: true, value: 1 });
 * const none: Option<number> = Option({ some: false });
 * ```
 */
export type ToInstance = {
  <T>(option: Some<T>): Some<T> & Context<T>;
  <T>(option: None): None & Context<T>;
  <T>(option: Option<T>): Instance<T>;
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
export interface Context<T>
  extends
    Iterable<T>,
    ToResult<T>,
    c.And<T>,
    c.Or<never>,
    c.Map<T>,
    c.Unwrap<T> {
  /**
   * andThen
   *
   * @example
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
  andThen<O extends Option<T2>, T2 = AndT<O>>(
    fn: (value: T) => O,
  ): O extends Instance<infer _> ? Instance<T2> : Option<T2>;

  /**
   * and
   *
   * @example
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
  and<O extends Option<T2>, T2 = AndT<O>>(
    option: O,
  ): O extends Instance<infer _> ? Instance<T2> : Option<T2>;

  /**
   * orElse
   *
   * @example
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
  orElse<O extends Option<T2>, T2 = OrT<O, T>>(
    fn: () => O,
  ): O extends Instance<infer _> ? Instance<T2> : Option<T2>;

  /**
   * or
   *
   * @example
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
  or<O extends Option<T2>, T2 = OrT<O, T>>(
    option: O,
  ): O extends Instance<infer _> ? Instance<T2> : Option<T2>;

  /**
   * map
   *
   * @example
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
  map<T2>(fn: (value: T) => T2): Instance<T2>;

  /**
   * unwrap
   *
   * @example
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
   * @example
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
  unwrapOr<T2>(value: T2): T | T2;

  /**
   * unwrapOrElse
   *
   * @example
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
  unwrapOrElse<T2>(fn: () => T2): T | T2;

  /**
   * lazy
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const option = await Option.some(1)
   *   .lazy()
   *   .and(Option.some(2))
   *   .eval();
   * assertEquals(option, Option.some(2));
   * ```
   */
  lazy(): Lazy<T, Instance<T>>;

  /**
   * toString
   *
   * @example
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

type LazyEval<T, O extends Option<T>, Eval extends Option<unknown>> = O extends
  Instance<unknown> ? (Eval extends Instance<unknown> ? Instance<T> : Option<T>)
  : O;

/**
 * Option Lazy eval
 *
 * @typeParam T - value type
 * @typeParam Eval - eval Option
 */
export interface Lazy<T, Eval extends Option<T>>
  extends c.And<T>, c.Or<never>, c.Map<T> {
  /**
   * andThen
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).andThen");
   *
   * const getNumber = () => Promise.resolve(Option.some(Math.random()));
   *
   * const fn = () => Option.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none<number>())
   *   .andThen((n) => Promise.resolve(Option.some(n.toFixed(2))))
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
   * and
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).and");
   *
   * const getNumber = () => Promise.resolve(Option.some(Math.random()));
   *
   * const fn = () => Option.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none<number>())
   *   .and(Promise.resolve(Option.some("TOO LARGE")))
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
   * orElse
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).orElse");
   *
   * const getNumber = () => Promise.resolve(Option.some(Math.random()));
   *
   * const fn = () => Option.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none<number>())
   *   .andThen((n) => Promise.resolve(Option.some(n.toFixed(2))))
   *   .orElse(() => Promise.resolve(Option.some("0.50")))
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
   * or
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).or");
   *
   * const getNumber = () => Promise.resolve(Option.some(Math.random()));
   *
   * const fn = () => Option.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none<number>())
   *   .andThen((n) => Promise.resolve(Option.some(n.toFixed(2))))
   *   .or(Promise.resolve(Option.some("0.50")))
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
   * map
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).map");
   *
   * const getNumber = () => Promise.resolve(Option.some(Math.random()));
   *
   * const fn = () => Option.lazy(getNumber())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none<number>())
   *   .map((n) => Promise.resolve(n.toFixed(2)))
   *   .eval();
   *
   * console.log(`Option: ${await fn()}`);
   * ```
   */
  map<
    T2,
    Z extends Option<T2> = LazyEval<T2, Instance<T2>, Eval>,
  >(fn: (value: T) => OrPromise<T2>): Lazy<T2, Z>;

  /**
   * eval
   *
   * @example
   * ```ts
   * console.log("[Example] (Lazy).eval");
   *
   * const option = await Option.some(1).lazy().eval();
   *
   * console.log(`Option: ${option}`);
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
   *   Option.some(1).lazy().toString(),
   *   "Lazy<Some(1)>",
   * );
   *
   * assertEquals(
   *   Option.none<number>().lazy().map((n) => n * 100).or(Option.some(0)).toString(),
   *   "Lazy<None.map((n)=>n * 100).or(Some(0))>",
   * );
   * ```
   */
  toString(): string;
}

/**
 * Static Option
 */
export interface Static {
  /**
   * Create a Option instance.
   *
   * @example
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
   * Create a Option instance.
   *
   * @example
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
   * @example
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
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const option = await Option.andThen(
   *   Option.some(1),
   *   () => Option.some(2),
   *   Promise.resolve(Option.some(3)),
   *   () => Promise.resolve(Option.some(4)),
   * ).then((o) => o.unwrap().join(", "));
   *
   * assertEquals(option, "1, 2, 3, 4");
   * ```
   */
  andThen: typeof andThen;

  /**
   * orElse
   *
   * @example
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
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const option = await Option.orElse(
   *   Option.none<number>(),
   *   Promise.resolve(Option.none<number>()),
   *   () => Option.none<number>(),
   *   () => Promise.resolve(Option.some(4)),
   * ).then((o) => o.unwrap().toFixed(2));
   *
   * assertEquals(option, "4.00");
   * ```
   */
  orElse: typeof orElse;

  /**
   * lazy
   *
   * @example
   * ```ts
   * console.log("[Example] Option.lazy");
   *
   * const option = await Option.lazy(Option.some(1))
   *   .and(Option.some(2))
   *   .eval();
   *
   * console.log(`Option: ${option}`);
   * ```
   *
   * @example
   * ```ts
   * console.log("[Example] Option.lazy");
   *
   * const option = await Option.lazy(() => Option.some(1))
   *   .and(Option.some(2))
   *   .map((n) => n.toFixed(2))
   *   .eval();
   *
   * console.log(`Option: ${option}`);
   * ```
   */
  lazy: typeof lazy;
}

/**
 * Option ToResult
 */
export interface ToResult<T> {
  /**
   * toResult
   *
   * @example
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
  toResult<E = Error>(error?: E): Result<T, E>;
}

/**
 * impl Some<T>
 */
class _Some<T> implements Some<T>, Context<T> {
  readonly some = true;
  constructor(readonly value: T) {}

  toResult<R>(): R {
    return Result.ok(this.value) as R;
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
    return Option.some(fn(this.value)) as V;
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
class _None<T> implements None, Context<T> {
  readonly some = false;
  constructor() {}

  toResult<E, R>(error: E = new Error("None") as E): R {
    return Result.err(error) as R;
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
        option = Option.some(p instanceof Promise ? await p : p);
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
 * impl ToInstance
 */
function toInstance<T>(option: Some<T>): Some<T> & Context<T>;
function toInstance<T>(option: None): None & Context<T>;
function toInstance<T>(option: Option<T>): Instance<T>;
function toInstance<T>(option: Option<T>): Instance<T> {
  return (option.some ? Option.some(option.value) : Option.none());
}

/**
 * impl Static.some
 */
function some<T>(value: T): Some<T> & Context<T> {
  return new _Some(value);
}

/**
 * impl Static.none
 */
function none<T = never>(): None & Context<T> {
  return new _None<T>();
}

/**
 * impl Static.andThen
 */
async function andThen<
  O extends Fn[number] extends (() => infer O) | infer O
    ? (Awaited<O> extends Instance<infer _> ? Instance<T>
      : (Awaited<O> extends Option<infer _> ? Option<T> : unknown))
    : never,
  Fn extends {
    [K in keyof T]:
      | OrPromise<Option<T[K]>>
      | (() => OrPromise<Option<T[K]>>);
  }[number][] = O extends Instance<infer T extends unknown[]> ? {
      [K in keyof T]:
        | OrPromise<Instance<T[K]>>
        | (() => OrPromise<Instance<T[K]>>);
    }
    : (O extends Option<infer T extends unknown[]> ? {
        [K in keyof T]:
          | OrPromise<Option<T[K]>>
          | (() => OrPromise<Option<T[K]>>);
      }
      : never),
  T extends unknown[] = {
    [K in keyof Fn]: Fn[K] extends infer O | (() => infer O)
      ? (O extends Option<unknown> ? AndT<O> : never)
      : never;
  },
>(...fn: Fn): Promise<O> {
  const somes: T[number][] = new Array(fn.length);
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: OrPromise<Option<T[number]>> = typeof f === "function" ? f() : f;
    const option = p instanceof Promise ? await p : p;
    if (option.some) {
      somes[i] = option.value;
    } else {
      return option as O;
    }
  }

  return Option.some(somes) as O;
}

/**
 * impl Static.orElse
 */
async function orElse<
  O extends Fn[number] extends (() => infer O) | infer O
    ? (Awaited<O> extends Instance<infer _> ? Instance<T>
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

/**
 * impl Static.lazy
 */
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
