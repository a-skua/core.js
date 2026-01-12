/**
 * Option is Object base type, Some<T> and None.
 *
 * ```ts
 * import { assert } from "@std/assert";
 *
 * const a: Option<number> = { some: true, value: 1 };
 * assert(isSome(a));
 *
 * const b: Option<number> = { some: false };
 * assert(isNone(b));
 *
 * const c: Option<number> = some(2);
 * assert(isSome(c));
 *
 * const d: Option<number> = none();
 * assert(isNone(d));
 * ```
 *
 * ## Usage
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const value = Option({ some: true, value: 1 })
 *   .map((n) => n + 1)
 *   .filter((n) => n >= 2)
 *   .unwrap(() => 0);
 * assertEquals(value, 2);
 * ```
 *
 * ## Why Object base?
 *
 * If you use on Server and Browser, using JSON.stringify and JSON.parse.
 * So, Object base is easy to use.
 *
 * ```ts
 * import { assert, assertEquals } from "@std/assert";
 *
 * const json = '{"some":true,"value":1}';
 *
 * const option: Option<number> = JSON.parse(json);
 * assert(option.some);
 *
 * assertEquals(option.value, 1);
 * ```
 *
 * ## Using with method
 *
 * ```ts
 * const option: OptionInstance<number> = some(Math.random());
 *
 * const value = option
 *   .filter((n) => n >= 0.5)
 *   .map((n) => n.toFixed(2))
 *   .unwrap(() => "0.00");
 *
 * console.log(value);
 * ```
 *
 * ## Using Iterable
 *
 * ```ts
 * const getNumber = () => some(Math.random()).filter((n) => n >= 0.5);
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
 * const getNumber = () => Promise.resolve(some(Math.random()));
 *
 * const option = await Option.lazy(getNumber())
 *   .filter((n) => n >= 0.5)
 *   .map((n) => n.toFixed(2))
 *   .eval();
 *
 * console.log(option.unwrap(() => "0.00"));
 * ```
 *
 * @module
 */

import type * as c from "./context.ts";
import type { Err, Ok, Result } from "./result.ts";
import type { OrFunction, OrPromise } from "./types.ts";

/**
 * ```ts
 * const a: Some<number> = { some: true, value: 1 };
 * const b: Some<number> = some(1);
 * ```
 *
 * @typeParam T value type
 */
export interface Some<T> {
  readonly some: true;
  readonly value: T;
}

/**
 * ```ts
 * const a: Some<number> = { some: true, value: 1 };
 * const b: SomeInstance<number> = some(1);
 * ```
 *
 * @typeParam T value type
 */
export type SomeInstance<T> = OptionContext<T> & Some<T>;

/**
 * Infer Some<T> type from Option<T> type
 *
 * ```ts
 * const a: InferSome<Option<number>> = { some: true, value: 1 };
 * const b: Some<number> = a;
 *
 * const c: InferSome<OptionInstance<number>> = some(1);
 * const d: SomeInstance<number> = c;
 * ```
 *
 * @typeParam O Option type
 */
export type InferSome<O extends Option<unknown>> = O extends
  OptionContext<infer T> ? SomeInstance<T>
  : Some<O extends Some<infer T> ? T : never>;

/**
 * ```ts
 * const a: None = { some: false };
 * const b: None = none();
 * ```
 */
export interface None {
  readonly some: false;
}

/**
 * ```ts
 * const a: None = { some: false };
 * const b: NoneInstance = none();
 * ```
 */
export type NoneInstance = OptionContext<never> & None;

/**
 * Infer None type from Option<T> type
 *
 * ```ts
 * const a: InferNone<Option<unknown>> = { some: false };
 * const b: None = a;
 *
 * const c: InferNone<OptionInstance<unknown>> = none();
 * const d: NoneInstance = c;
 * ```
 *
 * @typeParam O Option type
 */
export type InferNone<O extends Option<unknown>> = O extends
  OptionContext<unknown> ? NoneInstance
  : None;

/**
 * Option is Object base type, Some<T> and None.
 *
 * ```ts
 * const a: Option<number> = { some: true, value: 1 };
 * const b: Option<number> = { some: false };
 * ```
 *
 * @typeParam T value type
 */
export type Option<T> = Some<T> | None;

/**
 * Infer Option<T> type from Option<U> type
 *
 * ```ts
 * const a: InferOption<Option<string>, number> = { some: true, value: 1 };
 * const b: Option<number> = a;
 *
 * const c: InferOption<OptionInstance<string>, number> = some(1);
 * const d: OptionInstance<number> = c;
 * ```
 *
 * @typeParam O Option type
 * @typeParam T value type
 */
export type InferOption<O extends Option<unknown>, T> = O extends
  OptionInstance<unknown> ? OptionInstance<T> : Option<T>;

/**
 * WIP
 *
 * ```ts
 * JSON.stringify(some(1)); // '{"value":1,"some":true}'
 * JSON.stringify(none());  // '{"some":false}'
 * JSON.stringify([1]);     // '[1]'
 * JSON.stringify(0);       // '0'
 * ```
 *
 * @typeParam T value type
 */
export type SerializedOption<T> = [T] | 0;

/**
 * Option is Object base type, Some<T> and None.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const a = Option({ some: true, value: 1 });
 * assertEquals(a, some(1));
 *
 * const b = Option({ some: false });
 * assertEquals(b, none());
 * ```
 */
export const Option: OptionToInstance & OptionStatic = Object.assign(
  toInstance,
  {
    some,
    none,
    and,
    or,
    lazy,
    fromResult,
    fromNullable,
  } as never,
);

/**
 * Option Instance
 *
 * @typeParam T value type
 */
export type OptionInstance<T> = Option<T> & OptionContext<T>;

/**
 * Option to OptionInstance
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const a: OptionInstance<number> = Option({ some: true, value: 1 });
 * assertEquals(a, some(1));
 *
 * const b: OptionInstance<number> = Option({ some: false });
 * assertEquals(b, none());
 * ```
 *
 * @typeParam T value type
 */
export type OptionToInstance = {
  <T>(option: Some<T>): SomeInstance<T>;
  <T>(option: None): NoneInstance;
  <T>(option: Option<T>): OptionInstance<T>;
};

type NextT<O extends Option<unknown>, T> = O extends Some<infer T2> ? T | T2
  : (O extends None ? T
    : (O extends Option<infer T2> ? T | T2
      : unknown));

type AndT<O extends Option<unknown>> = NextT<O, never>;

type OrT<O extends Option<unknown>, T> = NextT<O, T>;

/**
 * Option Context Methods
 *
 * @typeParam T value type
 */
export interface OptionContext<T>
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
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1).and((n) => some(n + 1));
   * assertEquals(a, some(2));
   *
   * const n: OptionInstance<number> = none();
   * const b = n.and((n) => some(n + 1));
   * assertEquals(b, none());
   * ```
   *
   * @typeParam O Option type returned from andThen function
   * @typeParam T2 value type of returned Option
   */
  and<O extends Option<T2>, T2 = AndT<O>>(
    andThen: (value: T) => O,
  ): InferOption<O, T2>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1).or(() => some(2));
   * assertEquals(a, some(1));
   *
   * const n: OptionInstance<number> = none();
   * const b = n.or(() => some(2));
   * assertEquals(b, some(2));
   * ```
   *
   * @typeParam O Option type returned from orElse function
   * @typeParam T2 value type of returned Option
   */
  or<O extends Option<T2>, T2 = OrT<O, T>>(
    orElse: () => O,
  ): InferOption<O, T2>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1).map((n) => n + 1);
   * assertEquals(a, some(2));
   *
   * const n: OptionInstance<number> = none();
   * const b = n.map((n) => n + 1);
   * assertEquals(b, none());
   * ```
   *
   * @typeParam T2 mapped value type
   */
  map<T2>(fn: (value: T) => T2): OptionInstance<T2>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1).filter((n) => n > 0);
   * assertEquals(a, some(1));
   *
   * const b = some(0).filter((n) => n > 0);
   * assertEquals(b, none());
   *
   * const n: OptionInstance<number> = none();
   * const c = n.filter((n) => n > 0);
   * assertEquals(c, none());
   * ```
   *
   * @typeParam IsSome boolean result of filter function
   */
  filter<IsSome extends boolean>(fn: (value: T) => IsSome): OptionInstance<T>;

  /**
   * ```ts
   * import { assertEquals, assertThrows } from "@std/assert";
   *
   * const a = some(1);
   * assertEquals(a.unwrap(), 1);
   *
   * const b = none();
   * assertEquals(b.unwrap(() => 0), 0);
   *
   * const c = none();
   * assertThrows(() => c.unwrap());
   * ```
   *
   * @typeParam U value type of orElse function
   */
  unwrap<U>(orElse: () => U): T | U;
  unwrap(): T;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await some(1)
   *   .lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(a, some(2));
   *
   * const b = await some(Promise.resolve(1))
   *   .lazy()
   *   .map((n) => n + 1)
   *   .eval();
   * assertEquals(b, some(2));
   * ```
   */
  lazy(): T extends Promise<infer U> ? OptionLazyContext<OptionInstance<U>, U>
    : OptionLazyContext<OptionInstance<T>, T>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1);
   * assertEquals(a.toString(), "Some(1)");
   *
   * const b = none();
   * assertEquals(b.toString(), "None");
   * ```
   */
  toString(): string;
}

type InferOptionLazy<Eval extends Option<unknown>, T> = OptionLazyContext<
  InferOption<Eval, T>,
  T
>;

/**
 * Lazy Operation
 *
 * @typeParam Eval evaluated Option type
 * @typeParam T value type
 */
export interface OptionLazyContext<
  Eval extends Option<T>,
  T = NextT<Eval, never>,
> extends c.LazyContext<T>, c.And<T>, c.Or<T>, c.Map<T>, c.Filter<T> {
  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await some(1).lazy()
   *   .and((n) => Promise.resolve(some(n + 1)))
   *   .eval();
   * assertEquals(a, some(2));
   *
   * const n: OptionInstance<number> = none();
   * const b = await n.lazy()
   *   .and((n) => Promise.resolve(some(n + 1)))
   *   .eval();
   * assertEquals(b, none());
   * ```
   *
   * @typeParam O Option type returned from andThen function
   * @typeParam T2 value type of returned Option
   */
  and<
    O extends Option<T2>,
    T2 = AndT<O>,
  >(andThen: (value: T) => OrPromise<O>): InferOptionLazy<O, T2>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await some(1).lazy()
   *   .or(() => Promise.resolve(some(2)))
   *   .eval();
   * assertEquals(a, some(1));
   *
   * const n: OptionInstance<number> = none();
   * const b = await n.lazy()
   *   .or(() => Promise.resolve(some(2)))
   *   .eval();
   * assertEquals(b, some(2));
   * ```
   *
   * @typeParam O Option type returned from orElse function
   * @typeParam T2 value type of returned Option
   */
  or<
    O extends Option<T2>,
    T2 = OrT<O, T>,
  >(orElse: () => OrPromise<O>): InferOptionLazy<O, T2>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await some(1).lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(a, some(2));
   *
   * const n: OptionInstance<number> = none();
   * const b = await n.lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(b, none());
   * ```
   *
   * @typeParam T2 mapped value type
   */
  map<
    T2,
  >(fn: (value: T) => OrPromise<T2>): InferOptionLazy<Eval, T2>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await some(1).lazy()
   *   .filter((n) => Promise.resolve(n > 0))
   *   .eval();
   * assertEquals(a, some(1));
   *
   * const b = await some(0).lazy()
   *   .filter((n) => Promise.resolve(n > 0))
   *   .eval();
   * assertEquals(b, none());
   *
   * const n: OptionInstance<number> = none();
   * const c = await n.lazy()
   *   .filter((n) => Promise.resolve(n > 0))
   *   .eval();
   * assertEquals(c, none());
   * ```
   *
   * @typeParam IsSome boolean result of filter function
   */
  filter<IsSome extends boolean>(
    fn: (value: T) => OrPromise<IsSome>,
  ): InferOptionLazy<Eval, T>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const option = await some(1).lazy()
   *   .map((n) => Promise.resolve(n + 1))
   *   .eval();
   * assertEquals(option, some(2));
   * ```
   */
  eval(): Promise<Eval>;

  /**
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = some(1).lazy();
   * assertEquals(
   *   a.toString(),
   *   "Lazy<Some(1)>",
   * );
   *
   * const n: OptionInstance<number> = none();
   * const b = n.lazy().map((n) => n * 100).or(() => some(0));
   * assertEquals(
   *   b.toString(),
   *   "Lazy<None.map((n)=>n * 100).or(()=>some(0))>",
   * );
   * ```
   */
  toString(): string;
}

/**
 * Static Methods
 */
export type OptionStatic = {
  /**
   * @example `Option.some`
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(Option.some(1), some(1));
   * ```
   */
  some: typeof some;

  /**
   * @example `Option.none`
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * assertEquals(Option.none(), none());
   * ```
   */
  none: typeof none;

  /**
   * @example `Option.and`
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await Option.and(
   *   some(1),
   *   () => some(2),
   *   Promise.resolve(some(3)),
   *   () => Promise.resolve(some(4)),
   * );
   * assertEquals(a, some([1, 2, 3, 4]));
   *
   * const b = await Option.and(
   *   some(1),
   *   () => some(2),
   *   Promise.resolve(some(3)),
   *   () => Promise.resolve(none()),
   * );
   * assertEquals(b, none());
   * ```
   */
  and: typeof and;

  /**
   * @example `Option.or`
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = await Option.or(
   *   some(1),
   *   () => some(2),
   *   Promise.resolve(some(3)),
   *   () => Promise.resolve(some(4)),
   * );
   * assertEquals(a, some(1));
   *
   * const b = await Option.or(
   *   none(),
   *   () => none(),
   *   Promise.resolve(none()),
   *   () => Promise.resolve(some(4)),
   * );
   * assertEquals(b, some(4));
   * ```
   */
  or: typeof or;

  /**
   * @example `Option.lazy`
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const option = await Option.lazy(Promise.resolve(some(1)))
   *   .map((n) => Promise.resolve(n + 1))
   *   .map((n) => n * 2)
   *   .eval();
   * assertEquals(option, some(4));
   * ```
   */
  lazy: typeof lazy;

  /**
   * @example `Option.fromResult`
   * ```ts
   * import { assertEquals, assertThrows } from "@std/assert";
   * import { ok, err } from "@askua/core/result";
   *
   * const a = Option.fromResult(ok(1));
   * assertEquals(a, some(1));
   *
   * const b = Option.fromResult(err(new Error("Error")), (e) => {
   *   assertEquals(e, new Error("Error"));
   *   return none();
   * });
   * assertEquals(b, none());
   *
   * const c = () => Option.fromResult(err(new Error("Error")));
   * assertThrows(c);
   * ```
   *
   * @throws {Error} when result is Err and no orElse function provided
   */
  fromResult<T>(result: Ok<T>): SomeInstance<T>;
  fromResult<O extends Option<T>, T, E>(result: Err<E>, orElse: (e: E) => O): O;
  fromResult<E>(result: Err<E>): void;
  fromResult<O extends Option<T>, T, E>(
    result: Result<T, E>,
    orElse: (e: E) => O,
  ): O;
  fromResult<T, E>(result: Result<T, E>): OptionInstance<T>;

  /**
   * @example `Option.fromNullable`
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const a = Option.fromNullable(1);
   * assertEquals(a, some(1));
   *
   * const b = Option.fromNullable(null);
   * assertEquals(b, none());
   *
   * const c = Option.fromNullable(undefined);
   * assertEquals(c, none());
   * ```
   */
  fromNullable<T>(value: NonNullable<T>): SomeInstance<T>;
  fromNullable<T>(value: null | undefined): NoneInstance;
  fromNullable<T>(value: T | null | undefined): OptionInstance<T>;
};

/**
 * impl Some<T>
 */
class _Some<T> implements SomeInstance<T> {
  readonly some = true;
  constructor(readonly value: T) {}

  and<U>(andThen: (value: T) => U) {
    return andThen(this.value) as never;
  }

  or() {
    return this as never;
  }

  map<U, V>(fn: (v: T) => U): V {
    return some(fn(this.value)) as V;
  }

  filter(fn: (v: T) => boolean) {
    if (fn(this.value)) return this as never;
    return none();
  }

  unwrap(): T {
    return this.value;
  }

  lazy() {
    return new _Lazy(this) as never;
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
class _None<T = never> implements None, OptionContext<T> {
  readonly some = false;
  constructor() {}

  and() {
    return this as never;
  }

  or<U>(orElse: () => U) {
    return orElse() as never;
  }

  map<U>(): U {
    return this as never;
  }

  filter() {
    return this as never;
  }

  unwrap<U>(orElse?: () => U) {
    if (orElse) return orElse() as never;
    throw new Error("None");
  }

  lazy() {
    return new _Lazy(this) as never;
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
  | { and: (value: T) => OrPromise<Option<U>> }
  | { or: () => OrPromise<Option<U>> }
  | { map: (value: T) => OrPromise<U> }
  | { filter: (value: T) => OrPromise<boolean> };

/**
 * impl Lazy<T, Eval>
 */
class _Lazy<T, Eval extends Option<T>> implements OptionLazyContext<Eval, T> {
  readonly op: Op<T, never>[] = [];

  constructor(
    private readonly first: (() => Promise<Eval> | Eval) | Promise<Eval> | Eval,
  ) {}

  and<U, Op>(and: Op): U {
    this.op.push({ and } as typeof this.op[number]);
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

  filter<U, Op>(filter: Op): U {
    this.op.push({ filter } as typeof this.op[number]);
    return this as never;
  }

  async eval(): Promise<Eval> {
    const p = typeof this.first === "function" ? this.first() : this.first;
    let option: Option<T> = p instanceof Promise ? await p : p;
    if (option.some && option.value instanceof Promise) {
      option = some(await option.value);
    }

    for (let i = 0; i < this.op.length; i++) {
      const op = this.op[i];

      if ("and" in op && option.some) {
        const p = op.and(option.value);
        option = p instanceof Promise ? await p : p;
        continue;
      }

      if ("or" in op && !option.some) {
        const p = op.or();
        option = p instanceof Promise ? await p : p;
        continue;
      }

      if ("map" in op && option.some) {
        const p = op.map(option.value);
        option = some(p instanceof Promise ? await p : p);
        continue;
      }

      if ("filter" in op && option.some) {
        const p = op.filter(option.value);
        const result = p instanceof Promise ? await p : p;
        if (!result) option = none();
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
 * impl OptionToInstance
 */
function toInstance<T>(option: Some<T>): SomeInstance<T>;
function toInstance<T>(option: None): NoneInstance;
function toInstance<T>(option: Option<T>): OptionInstance<T>;
function toInstance<T>(option: Option<T>): OptionInstance<T> {
  return (option.some ? some(option.value) : none());
}

/**
 * some is create Some
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { OptionInstance } from "@askua/core/option";
 * import { some } from "@askua/core/option";
 *
 * const a: OptionInstance<number> = some(1);
 * assertEquals(a.map((n) => n + 1), some(2));
 * ```
 *
 * @typeParam T value type
 */
export function some<T>(value: T): SomeInstance<T> {
  return new _Some(value);
}

/**
 * isSome is check Some
 *
 * ```ts
 * import { assert } from "@std/assert";
 * import { some, isSome } from "@askua/core/option";
 *
 * const option = some(1);
 * assert(isSome(option));
 * ```
 *
 * @typeParam T value type
 */
export function isSome<T>(
  option: Option<T>,
): option is InferSome<typeof option>;
/**
 * @typeParam T value type
 */
export function isSome<T>(
  option: OptionInstance<T>,
): option is InferSome<typeof option>;
export function isSome<T>({ some }: Option<T>) {
  return some;
}

/**
 * none is create None
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import type { OptionInstance } from "@askua/core/option";
 * import { none } from "@askua/core/option";
 *
 * const a: OptionInstance<number> = none();
 * assertEquals(a.map((n) => n + 1), none());
 * ```
 */
export function none(): InferNone<OptionInstance<never>> {
  return new _None();
}

/**
 * isNone is check None
 *
 * ```ts
 * import { assert } from "@std/assert";
 * import { none, isNone } from "@askua/core/option";
 *
 * const option = none();
 * assert(isNone(option));
 * ```
 *
 * @typeParam T value type
 */
export function isNone<T>(
  option: Option<T>,
): option is InferNone<typeof option>;

/**
 * @typeParam T value type
 */
export function isNone<T>(
  option: OptionInstance<T>,
): option is InferNone<typeof option>;
export function isNone<T>({ some }: Option<T>) {
  return !some;
}

async function and<
  O extends Fn[number] extends (() => infer O) | infer O
    ? (Awaited<O> extends OptionInstance<infer _> ? OptionInstance<T>
      : (Awaited<O> extends Option<infer _> ? Option<T> : unknown))
    : never,
  Fn extends {
    [K in keyof T]: OrFunction<OrPromise<Option<T[K]>>>;
  }[number][] = O extends OptionInstance<infer T extends unknown[]> ? {
      [K in keyof T]: OrFunction<OrPromise<OptionInstance<T[K]>>>;
    }
    : (O extends Option<infer T extends unknown[]> ? {
        [K in keyof T]: OrFunction<OrPromise<Option<T[K]>>>;
      }
      : never),
  T extends unknown[] = {
    [K in keyof Fn]: Fn[K] extends OrFunction<OrPromise<infer O>>
      ? (O extends Option<unknown> ? AndT<O> : never)
      : never;
  },
>(...fn: Fn): Promise<O> {
  const values: T[number][] = new Array(fn.length);
  for (let i = 0; i < fn.length; i++) {
    const f = fn[i];
    const p: OrPromise<Option<T[number]>> = typeof f === "function" ? f() : f;
    const option = p instanceof Promise ? await p : p;
    if (option.some) {
      values[i] = option.value;
    } else {
      return option as O;
    }
  }

  return some(values) as O;
}

async function or<
  O extends Fn[number] extends (() => infer O) | infer O
    ? (Awaited<O> extends OptionInstance<infer _> ? OptionInstance<T>
      : (Awaited<O> extends Option<infer _> ? Option<T> : never))
    : never,
  F extends OrFunction<OrPromise<Option<T>>> = OrFunction<OrPromise<O>>,
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

function lazy<
  Fn extends OrFunction<OrPromise<Eval>>,
  Eval extends Option<T> = Fn extends OrFunction<OrPromise<infer O>> ? O
    : never,
  T = NextT<Eval, never>,
>(option: Fn): OptionLazyContext<Eval, T> {
  return new _Lazy(option);
}

function fromResult<T, E>(
  result: Result<T, E>,
  orElse?: (e: E) => OptionInstance<T>,
): OptionInstance<T> {
  if (result.ok) return some(result.value);
  if (orElse) return orElse(result.error);
  throw new Error(
    "Option.fromResult: no value and no orElse function provided",
    {
      cause: result.error,
    },
  );
}

function fromNullable<T>(value: T | null | undefined): OptionInstance<T> {
  if (value === null || value === undefined) return none();
  return some(value);
}
