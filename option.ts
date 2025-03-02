/**
 * Option
 *
 * @example
 * ```ts
 * import { Instance as Option } from "@askua/core/option";
 *
 * const n: Option<number> = Option.some(Math.random())
 *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
 *
 * console.log(n.map((n) => n.toFixed(2)).unwrapOr("0.00"));
 * ```
 *
 * @example
 * ```ts
 * import { type Some, type None, Instance as Option } from "@askua/core/option";
 *
 * function some<T>(value: T): Some<T> {
 *   return Option.some(value);
 * }
 *
 * function none(): None {
 *   return Option.none();
 * }
 *
 * console.log(some(1));
 * console.log(none());
 * ```
 *
 * @example
 * ```ts
 * import { Option } from "@askua/core/option";
 *
 * const getNumber = (): Option<number> => ({ some: true, value: 1 });
 *
 * const option = getNumber();
 * if (option.some) {
 *   console.log(`some = ${option.value}`);
 * } else {
 *   console.error("none");
 * }
 * ```
 *
 * @example
 * ```ts
 * import { Option } from "@askua/core/option";
 *
 * const some = Option({ some: true, value: 1 }).map((n) => n + 1);
 * console.log(some.unwrap());
 *
 * const none = Option<number>({ some: false }).map((n) => n + 1);
 * console.log(none.unwrapOr(0));
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import type { Instance as ResultInstance } from "./result.ts";
import { Result } from "./result.ts";

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
export type ToInstance = <
  T extends O extends Some<infer T> ? T
    : (O extends None ? never
      : (O extends Option<T> ? T : never)),
  O extends Option<unknown> = Option<T>,
>(option: O) => Instance<T>;

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
  andThen<
    O extends Option<T2>,
    Fn extends (value: T) => O = (value: T) => O,
    T2 = ReturnType<Fn> extends infer O ? (O extends Some<infer T2> ? T2
        : (O extends None ? never
          : (O extends Option<infer T2> ? T2
            : never)))
      : never,
  >(
    fn: Fn,
  ): ReturnType<Fn> extends Instance<infer _> ? Instance<T2> : Option<T2>;

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
  and<
    O extends Option<T2>,
    T2 = O extends Some<infer T2> ? T2
      : (O extends None ? never
        : (O extends Option<infer T2> ? T2
          : never)),
  >(option: O): O extends Instance<infer _> ? Instance<T2> : Option<T2>;

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
  orElse<
    O extends Option<T2>,
    Fn extends () => O = () => O,
    T2 = ReturnType<Fn> extends infer O ? (O extends Some<infer T2> ? T | T2
        : (O extends None ? T
          : (O extends Option<infer T2> ? T | T2
            : never)))
      : never,
  >(
    fn: Fn,
  ): ReturnType<Fn> extends Instance<infer _> ? Instance<T2> : Option<T2>;

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
  or<
    O extends Option<T2>,
    T2 = O extends Some<infer T2> ? T | T2
      : (O extends None ? T
        : (O extends Option<infer T2> ? T | T2
          : never)),
  >(option: O): O extends Instance<infer _> ? Instance<T2> : Option<T2>;

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

/**
 * Option Lazy eval
 *
 * @typeParam T - value type
 * @typeParam Eval - eval Option
 */
export interface Lazy<T, Eval extends Option<unknown>>
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
    PO extends Promise<O> | O = Promise<O> | O,
    Fn extends (value: T) => PO = (value: T) => PO,
    T2 = Fn extends (() => infer O) | ((value: T) => infer O)
      ? (Awaited<O> extends infer O ? (O extends Some<infer T2> ? T2
          : (O extends None ? never
            : (O extends Option<infer T2> ? T2
              : never)))
        : never)
      : never,
    Z extends Option<T2> = Fn extends (() => infer O) | ((value: T) => infer O)
      ? (Awaited<O> extends Instance<infer _>
        ? (Eval extends Instance<infer _> ? Instance<T2> : Option<T2>)
        : Option<T2>)
      : never,
  >(fn: Fn): Lazy<T2, Z>;

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
    PO extends Promise<O> | O = Promise<O> | O,
    T2 = Awaited<PO> extends infer O ? (O extends Some<infer T2> ? T2
        : (O extends None ? never
          : (O extends Option<infer T2> ? T2
            : never)))
      : never,
    Z extends Option<T2> = Awaited<PO> extends Instance<infer _>
      ? (Eval extends Instance<infer _> ? Instance<T2> : Option<T2>)
      : Option<T2>,
  >(option: PO): Lazy<T2, Z>;

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
    PO extends Promise<O> | O = Promise<O> | O,
    Fn extends () => PO = () => PO,
    T2 = Fn extends () => infer O
      ? (Awaited<O> extends infer O ? (O extends Some<infer T2> ? T | T2
          : (O extends None ? T
            : (O extends Option<infer T2> ? T | T2
              : never)))
        : never)
      : never,
    Z extends Option<T2> = Fn extends () => infer O
      ? (Awaited<O> extends Instance<infer _>
        ? (Eval extends Instance<infer _> ? Instance<T2> : Option<T2>)
        : Option<T2>)
      : never,
  >(fn: Fn): Lazy<T2, Z>;

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
    PO extends Promise<O> | O = Promise<O> | O,
    T2 = Awaited<PO> extends infer O ? (O extends Some<infer T2> ? T | T2
        : (O extends None ? T
          : (O extends Option<infer T2> ? T | T2
            : never)))
      : never,
    Z extends Option<T2> = Awaited<PO> extends Instance<infer _>
      ? (Eval extends Instance<infer _> ? Instance<T2> : Option<T2>)
      : Option<T2>,
  >(option: PO): Lazy<T2, Z>;

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
    Fn extends (value: T) => Promise<T2> | T2,
    T2 = Fn extends (() => infer O) | ((value: T) => infer O) ? Awaited<O>
      : never,
    Z extends Option<T2> = Eval extends Instance<infer _> ? Instance<T2>
      : Option<T2>,
  >(fn: Fn): Lazy<T2, Z>;

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
  toResult<E = Error>(
    error?: E,
  ): ResultInstance<T, E>;
}

/**
 * impl Some<T>
 */
class _Some<T> implements Some<T>, Context<T> {
  readonly some = true;
  constructor(readonly value: T) {}

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

  lazy<Z extends Option<T>>(): Lazy<T, Z> {
    return new _Lazy(this as unknown as Z);
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

  lazy<Z extends Option<T>>(): Lazy<T, Z> {
    return new _Lazy(this as unknown as Z);
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
class _Lazy<T, Eval extends Option<unknown>> implements Lazy<T, Eval> {
  readonly op: Op<unknown, unknown>[] = [];

  constructor(
    private readonly first: (() => Promise<Eval> | Eval) | Promise<Eval> | Eval,
  ) {}

  andThen<U, Op>(andThen: Op): U {
    this.op.push({ andThen } as typeof this.op[number]);
    return this as unknown as U;
  }

  and<U, Op>(and: Op): U {
    this.op.push({ and } as typeof this.op[number]);
    return this as unknown as U;
  }

  orElse<U, Op>(orElse: Op): U {
    this.op.push({ orElse } as typeof this.op[number]);
    return this as unknown as U;
  }

  or<U, Op>(or: Op): U {
    this.op.push({ or } as typeof this.op[number]);
    return this as unknown as U;
  }

  map<U, Op>(map: Op): U {
    this.op.push({ map } as typeof this.op[number]);
    return this as unknown as U;
  }

  async eval(): Promise<Eval> {
    const p = typeof this.first === "function" ? this.first() : this.first;
    let option: Option<unknown> = p instanceof Promise ? await p : p;
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
 * impl ToInstance<<T>
 */
function toInstance<O extends Option<unknown>, T>(option: O): Instance<T> {
  return (option.some ? Option.some(option.value) : Option.none()) as Instance<
    T
  >;
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
  Return extends Fn[number] extends (() => infer O) | infer O
    ? (Awaited<O> extends Instance<infer _> ? Instance<T>
      : (Awaited<O> extends Option<infer _> ? Option<T> : never))
    : never,
  O extends Option<T[number]> = Option<unknown>,
  PO extends Promise<O> | O = Promise<O> | O,
  F extends (() => PO) | PO = (() => PO) | PO,
  Fn extends F[] = F[],
  T extends unknown[] = ({
    [K in keyof Fn]: Fn[K] extends (() => infer O) | infer O
      ? (Awaited<O> extends Some<infer T> ? T
        : (Awaited<O> extends None ? never
          : (Awaited<O> extends Option<infer T> ? T
            : never)))
      : never;
  }),
>(...fn: Fn): Promise<Return> {
  const somes: unknown[] = new Array(fn.length);
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: Promise<Option<unknown>> | Option<unknown> =
      typeof f === "function" ? f() : f;
    const option = p instanceof Promise ? await p : p;
    if (option.some) {
      somes[i] = option.value;
    } else {
      return option as Return;
    }
  }

  return Option.some(somes) as unknown as Return;
}

/**
 * impl Static.orElse
 */
async function orElse<
  Return extends Fn[number] extends (() => infer O) | infer O
    ? (Awaited<O> extends Instance<infer _> ? Instance<T>
      : (Awaited<O> extends Option<infer _> ? Option<T> : never))
    : never,
  O extends Option<T> = Return,
  PO extends Promise<O> | O = Promise<O> | O,
  F extends (() => PO) | PO = (() => PO) | PO,
  Fn extends [F, ...F[]] = [F, ...F[]],
  T = ({
    [K in keyof Fn]: Fn[K] extends (() => infer O) | infer O
      ? (Awaited<O> extends Some<infer T> ? T
        : (Awaited<O> extends None ? never
          : (Awaited<O> extends Option<infer T> ? T
            : never)))
      : never;
  })[number],
>(...fn: Fn): Promise<Return> {
  let last;
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: Promise<Option<unknown>> | Option<unknown> =
      typeof f === "function" ? f() : f;
    const option = p instanceof Promise ? await p : p;
    if (option.some) {
      return option as Return;
    }
    last = option;
  }
  return last as Return;
}

/**
 * impl Static.lazy
 */
function lazy<
  O extends Option<T>,
  PO extends Promise<O> | O = Promise<O> | O,
  Fn extends (() => PO) | PO = (() => PO) | PO,
  T = Fn extends (() => infer O) | infer O
    ? (Awaited<O> extends Some<infer T> ? T
      : (Awaited<O> extends None ? never
        : (Awaited<O> extends Option<infer T> ? T
          : never)))
    : never,
  Eval extends Option<T> = Fn extends (() => infer O) | infer O
    ? (Awaited<O> extends Instance<infer T> ? Instance<T>
      : Option<T>)
    : never,
>(option: Fn): Lazy<T, Eval> {
  return new _Lazy(option as unknown as Eval);
}
