import type { Err, Ok } from "./result.ts";
import type { BindOperator, MapOperator } from "./types.ts";
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
  extends Iterable<T>, OptionToResult<T>, MapOperator<T>, BindOperator<T> {
  /** Map Operator */
  map<U, V = Option<U> & OptionInstance<U>>(fn: (v: T) => U): V;

  /** Bind Operator */
  bind<U, V = Option<U> & OptionInstance<U>>(fn: (v: T) => V): V;
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

  /** impl BindOperator */
  bind<U>(fn: (v: T) => U): U {
    return fn(this.value);
  }

  /** impl MapOperator */
  map<U, V>(fn: (v: T) => U): V {
    return Option.some(fn(this.value)) as V;
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
class _None<T = never> implements None, OptionInstance<T> {
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

  /** impl BindOperator */
  bind<U>(): U {
    return this as unknown as U;
  }

  /** impl MapOperator */
  map<U>(): U {
    return this as unknown as U;
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
        return new _Some(value) as
          & Context<"Option">
          & Some<T>
          & OptionInstance<T>;
      },
      none<T = never>():
        & Context<"Option">
        & None
        & OptionInstance<T> {
        return new _None() as Context<"Option"> & None & OptionInstance<T>;
      },
    },
  );
