import type { Err, Ok } from "./result.ts";
import type {
  AndOperator,
  MapOperator,
  OrOperator,
  UnwrapOperator,
} from "./types.ts";
import type { Context } from "./types.ts";
import type { ResultInstance } from "./result.ts";
import { Result } from "./result.ts";

/**
 * type Some
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const option = Option.some("is some");
 * assertEquals([...option], ["is some"]);
 * ```
 */
export interface Some<T> {
  /** true */
  readonly some: true;
  /** value */
  readonly value: T;
}

/**
 * type None
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const option = Option.none();
 * assertEquals([...option], []);
 * ```
 */
export interface None {
  /** false */
  readonly some: false;
}

/**
 * type Option
 *
 * ### Example
 *
 * ```ts
 * import { assert, assertEquals, assertObjectMatch } from "@std/assert";
 *
 * assertObjectMatch(
 *   Option.some("is some"),
 *   { some: true, value: "is some" },
 * );
 *
 * assertObjectMatch(
 *   Option.none(),
 *   { some: false },
 * );
 *
 * for (const value of Option.some("is some")) {
 *   assertEquals(value, "is some");
 * }
 *
 * for (const _ of Option.none()) {
 *   assert(false);
 * }
 *
 * const array = Array.from(Option.some("is some"));
 * assertEquals(array, ["is some"]);
 * ```
 */
export type Option<T> = Context<"Option"> & (Some<T> | None);

/** Option Instance */
export interface OptionInstance<T>
  extends
    Iterable<T>,
    OptionToResult<T>,
    MapOperator<T>,
    AndOperator<T>,
    OrOperator<T>,
    UnwrapOperator<T> {
  /** And Operator */
  andThen<U = T, V extends Option<U> = Option<U> & OptionInstance<U>>(
    fn: (v: T) => V,
  ): V;

  /** And Operator */
  asyncAndThen<U = T, V extends Option<U> = Option<U> & OptionInstance<U>>(
    fn: (v: T) => Promise<V>,
  ): Promise<V>;

  /** And Operator */
  and<U = T, V extends Option<U> = Option<U> & OptionInstance<U>>(option: V): V;

  /** Or Operator */
  orElse<
    U = T,
    V extends Option<U> = Option<U> & OptionInstance<U>,
    W extends Option<T> | Option<U> =
      | (Option<T> & OptionInstance<T>)
      | (Option<U> & OptionInstance<U>),
  >(
    fn: () => V,
  ): W;

  /** Or Operator */
  asyncOrElse<
    U = T,
    V extends Option<U> = Option<U> & OptionInstance<U>,
    W extends Option<T> | Option<U> =
      | (Option<T> & OptionInstance<T>)
      | (Option<U> & OptionInstance<U>),
  >(
    fn: () => Promise<V>,
  ): Promise<W>;

  /** Or Operator */
  or<
    U = T,
    V extends Option<U> = Option<U> & OptionInstance<U>,
    W extends Option<T> | Option<U> =
      | (Option<T> & OptionInstance<T>)
      | (Option<U> & OptionInstance<U>),
  >(option: V): W;

  /** Map Operator */
  map<U = T, V extends Option<U> = Option<U> & OptionInstance<U>>(
    fn: (v: T) => U,
  ): V;
}
/**
 * Option to Result
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
 * const err = Option.none().toResult();
 * assertEquals(err, Result.err(new Error("None")));
 *
 * const customErr = Option.none().toResult("is none");
 * assertEquals(customErr, Result.err("is none"));
 * ```
 */
export interface OptionToResult<T> {
  /** to Result */
  toResult<E = Error>(error?: E): Result<T, E> & ResultInstance<T, E>;
}

/**
 * type StaticOption
 */
export interface StaticOption {
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
  some<T>(
    value: T,
  ):
    & Context<"Option">
    & Some<T>
    & OptionInstance<T>;
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
  none<T = never>():
    & Context<"Option">
    & None
    & OptionInstance<T>;
}

/** impl Some */
class _Some<T> implements Some<T>, OptionInstance<T> {
  readonly some = true;
  constructor(readonly value: T) {
  }

  toString(): string {
    return `Some(${this.value})`;
  }

  /** impl OptionToResult */
  toResult(): Context<"Result"> & Ok<T> & ResultInstance<T, never> {
    return Result.ok(this.value);
  }

  /** impl AndOperator */
  andThen<U>(fn: (v: T) => U): U {
    return fn(this.value);
  }

  /** impl AndOperator */
  asyncAndThen<U>(fn: (v: T) => Promise<U>): Promise<U> {
    return fn(this.value);
  }

  /** impl AndOperator */
  and<U>(option: U): U {
    return option;
  }

  /** impl OrOperator */
  orElse<U>(): U {
    return this as unknown as U;
  }

  /** impl OrOperator */
  asyncOrElse<U>(): Promise<U> {
    return Promise.resolve(this as unknown as U);
  }

  /** impl OrOperator */
  or<U>(): U {
    return this as unknown as U;
  }

  /** impl MapOperator */
  map<U, V>(fn: (v: T) => U): V {
    return Option.some(fn(this.value)) as V;
  }

  /** impl UnwrapOperator */
  unwrap(): T {
    return this.value;
  }

  /** impl UnwrapOperator */
  unwrapOr(): T {
    return this.value;
  }

  /** impl Iterable */
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
class _None<T> implements None, OptionInstance<T> {
  readonly some = false;
  constructor() {
  }

  toString(): string {
    return "None";
  }

  /** impl OptionToResult */
  toResult<E = Error>(
    err: E = new Error("None") as E,
  ): Context<"Result"> & Err<E> & ResultInstance<T, E> {
    return Result.err(err);
  }

  /** impl AndOperator */
  andThen<U>(): U {
    return this as unknown as U;
  }

  /** impl AndOperator */
  asyncAndThen<U>(): Promise<U> {
    return Promise.resolve(this as unknown as U);
  }

  /** impl AndOperator */
  and<U>(): U {
    return this as unknown as U;
  }

  /** impl OrOperator */
  orElse<U, V>(fn: () => U): V {
    return fn() as unknown as V;
  }

  /** impl OrOperator */
  asyncOrElse<U, V>(fn: () => Promise<U>): Promise<V> {
    return fn() as unknown as Promise<V>;
  }

  /** impl OrOperator */
  or<U, V>(option: U): V {
    return option as unknown as V;
  }

  /** impl MapOperator */
  map<U>(): U {
    return this as unknown as U;
  }

  /** impl UnwrapOperator */
  unwrap(): T {
    throw new Error("None");
  }

  /** impl UnwrapOperator */
  unwrapOr(value: T): T {
    return value;
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

/** impl StaticOption */
export const Option:
  & (<T>(option: Some<T> | None) => Option<T> & OptionInstance<T>)
  & StaticOption = Object.assign(
    <T>(option: Some<T> | None): Option<T> & OptionInstance<T> => {
      return option.some ? Option.some(option.value) : Option.none();
    },
    {
      some<T>(
        value: T,
      ):
        & Context<"Option">
        & Some<T>
        & OptionInstance<T> {
        return new _Some(value) as Context<"Option"> & _Some<T>;
      },
      none<T>():
        & Context<"Option">
        & None
        & OptionInstance<T> {
        return new _None() as Context<"Option"> & _None<T>;
      },
    },
  );
