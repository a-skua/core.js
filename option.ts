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
export interface None<_> {
  /** some: alse */
  readonly some: false;
}

/** type Option */
export type Option<T> = Some<T> | None<T>;

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
    Fn extends (value: T) => Option<unknown>,
    Some extends ReturnType<Fn> extends Option<infer Some> ? Some : never,
    Return extends Option<Some> = ReturnType<Fn> extends Instance<infer _>
      ? Instance<Some>
      : Option<Some>,
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
    U extends Option<unknown>,
    Some extends U extends Option<infer Some> ? Some : never,
    Return extends Option<Some> = U extends Instance<infer _> ? Instance<Some>
      : Option<Some>,
  >(option: U): Return;

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
    Fn extends () => Option<unknown>,
    Some extends ReturnType<Fn> extends Option<infer Some> ? Some : never,
    Return extends Option<Some> = ReturnType<Fn> extends Instance<infer _>
      ? Instance<Some>
      : Option<Some>,
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
    U extends Option<unknown>,
    Some extends U extends Option<infer Some> ? Some : never,
    Return extends Option<Some> = U extends Instance<infer _> ? Instance<Some>
      : Option<Some>,
  >(option: U): Return;

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
    Fn extends (value: T) => unknown,
    Some extends ReturnType<Fn>,
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
   * lazy
   *
   * ### Example
   *
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const option = await Option.some(1).lazy().and(Option.some(2)).eval();
   * assertEquals(option, Option.some(2));
   * ```
   */
  lazy<Eval extends Option<T> = Instance<T>>(): Lazy<T, Eval>;

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

/** Lazy */
export interface Lazy<T, Eval extends Option<unknown>>
  extends c.And<T>, c.Or<never>, c.Map<T> {
  /**
   * andThen
   *
   * ### Example
   *
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
    Fn extends (value: T) => Promise<Option<unknown>> | Option<unknown>,
    Some extends Awaited<ReturnType<Fn>> extends Option<infer Some> ? Some
      : never,
    Z extends Option<Some> = Awaited<ReturnType<Fn>> extends Instance<infer _>
      ? Eval extends Instance<infer _> ? Instance<Some> : Option<Some>
      : Option<Some>,
    Return extends Lazy<Some, Z> = Lazy<Some, Z>,
  >(fn: Fn): Return;

  /**
   * and
   *
   * ### Example
   *
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
    U extends Promise<Option<unknown>> | Option<unknown>,
    Some extends Awaited<U> extends Option<infer Some> ? Some : never,
    Z extends Option<Some> = Awaited<U> extends Instance<infer _>
      ? Eval extends Instance<infer _> ? Instance<Some> : Option<Some>
      : Option<Some>,
    Return extends Lazy<Some, Z> = Lazy<Some, Z>,
  >(option: U): Return;

  /**
   * orElse
   *
   * ### Example
   *
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
    Fn extends () => Promise<Option<unknown>> | Option<unknown>,
    Some extends Awaited<ReturnType<Fn>> extends Option<infer Some> ? Some
      : never,
    Z extends Option<Some> = Awaited<ReturnType<Fn>> extends Instance<infer _>
      ? Eval extends Instance<infer _> ? Instance<Some> : Option<Some>
      : Option<Some>,
    Return extends Lazy<Some, Z> = Lazy<Some, Z>,
  >(fn: Fn): Return;

  /**
   * or
   *
   * ### Example
   *
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
    U extends Promise<Option<unknown>> | Option<unknown>,
    Some extends Awaited<U> extends Option<infer Some> ? Some : never,
    Z extends Option<Some> = Awaited<U> extends Instance<infer _>
      ? Eval extends Instance<infer _> ? Instance<Some> : Option<Some>
      : Option<Some>,
    Return extends Lazy<Some, Z> = Lazy<Some, Z>,
  >(option: U): Return;

  /**
   * map
   *
   * ### Example
   *
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
    Fn extends (v: T) => Promise<unknown> | unknown,
    Some extends Awaited<ReturnType<Fn>>,
    Z extends Option<Some> = Eval extends Instance<infer _> ? Instance<Some>
      : Option<Some>,
    Return extends Lazy<Some, Z> = Lazy<Some, Z>,
  >(fn: Fn): Return;

  /**
   * eval
   *
   * ### Example
   *
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
   * ### Example
   *
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

  /**
   * lazy
   *
   * ### Example
   *
   * ```ts
   * console.log("[Example] Option.lazy");
   *
   * const option = await Option.lazy(Option.some(1))
   *   .and(Option.some(2))
   *   .eval();
   *
   * console.log(`Option: ${option}`);
   * ```
   */
  lazy: typeof lazy;
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
  toResult<E = Error, R extends Result<T, E> = ResultInstance<T, E>>(
    error?: E,
  ): R;
}

/** impl Some */
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

/** impl None<T> */
class _None<T> implements None<T>, Context<T> {
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

type Op<T, U> =
  | { andThen: (value: T) => Promise<Option<U>> }
  | { and: Promise<Option<U>> }
  | { orElse: () => Promise<Option<U>> }
  | { or: Promise<Option<U>> }
  | { map: (value: T) => Promise<U> };

/** impl Lazy<T, Eval> */
class _Lazy<T, Eval extends Option<unknown>> implements Lazy<T, Eval> {
  readonly op: Op<unknown, unknown>[] = [];

  constructor(private readonly first: Promise<Eval> | Eval) {}

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
    let option: Option<unknown> = await this.first;
    for (let i = 0; i < this.op.length; i++) {
      const op = this.op[i];
      if ("andThen" in op && option.some) {
        option = await op.andThen(option.value);
      } else if ("and" in op && option.some) {
        option = await op.and;
      } else if ("orElse" in op && !option.some) {
        option = await op.orElse();
      } else if ("or" in op && !option.some) {
        option = await op.or;
      } else if ("map" in op && option.some) {
        option = Option.some(await op.map(option.value));
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

function toInstance<T>(option: Option<T>): Instance<T> {
  return option.some ? Option.some(option.value) : Option.none();
}

function some<T>(value: T): Some<T> & Context<T> {
  return new _Some(value);
}

function none<T = never>(): None<T> & Context<T> {
  return new _None<T>();
}

async function andThen<
  Fn extends (() => Option<unknown> | Promise<Option<unknown>>)[],
  Some extends ({
    [K in keyof Fn]: Awaited<ReturnType<Fn[K]>> extends Option<infer Some>
      ? Some
      : never;
  }),
  Return extends Option<Some> = Awaited<ReturnType<Fn[number]>> extends
    Instance<infer _> ? Instance<Some>
    : Option<Some>,
>(...fn: Fn): Promise<Return> {
  const somes: unknown[] = new Array(fn.length);
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
  F extends () => Option<unknown> | Promise<Option<unknown>>,
  Fn extends [F, ...F[]],
  Some extends ({
    [K in keyof Fn]: Awaited<ReturnType<Fn[K]>> extends Option<infer Some>
      ? Some
      : never;
  })[number],
  Return extends Option<Some> = Awaited<ReturnType<Fn[number]>> extends
    Instance<infer _> ? Instance<Some>
    : Option<Some>,
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

function lazy<
  O extends Promise<Option<unknown>> | Option<unknown>,
  Eval extends Option<unknown> = Awaited<O> extends Instance<infer Some>
    ? Instance<Some>
    : Awaited<O> extends Option<infer Some> ? Option<Some>
    : never,
  Some = Awaited<O> extends Option<infer Some> ? Some : never,
>(option: O): Lazy<Some, Eval> {
  return new _Lazy(option as unknown as Eval);
}

/** type ToInstance */
export type ToInstance = <T>(option: Option<T>) => Instance<T>;

/** impl StaticOption */
export const Option: ToInstance & Static = Object.assign(
  toInstance,
  { some, none, andThen, orElse, lazy },
);
