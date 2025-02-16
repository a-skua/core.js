import type { Err, Ok } from "./result.ts";
import type { MapOperator } from "./types.ts";
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
export type Option<T> = Some<T> | None;

/** Option Instance */
export type OptionInstance<T> =
  & Iterable<T>
  & OptionToResult<T>
  & MapOperator<T, Option<unknown>>;

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
  toResult<E = Error>(error?: E): Result<T, E> & ResultInstance<T>;
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
    & None
    & OptionInstance<T>;
}

/** impl Some */
class _Some<T> implements Some<T>, OptionInstance<T> {
  readonly some = true;
  constructor(readonly value: T) {}

  toString(): string {
    return `Some(${this.value})`;
  }

  /** impl OptionToResult */
  toResult(): Ok<T> & ResultInstance<T> {
    return Result.ok(this.value);
  }

  /** impl MapOperator */
  map<U, V extends Option<U>>(fn: (v: T) => V): V {
    return fn(this.value);
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

  toString(): string {
    return "None";
  }

  /** impl OptionToResult */
  toResult<E = Error>(
    err: E = new Error("None") as E,
  ): Err<E> & ResultInstance<T> {
    return Result.err(err);
  }

  /** impl MapOperator */
  map<U, V extends Option<U>>(): V {
    return this as unknown as V;
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
  & (<T>(option: Option<T>) => Option<T> & OptionInstance<T>)
  & StaticOption = Object.assign(
    <T>(option: Option<T>): Option<T> & OptionInstance<T> => {
      return option.some ? Option.some(option.value) : Option.none();
    },
    {
      some<T>(
        value: T,
      ):
        & Some<T>
        & OptionInstance<T> {
        return new _Some(value);
      },
      none<T = never>():
        & None
        & OptionInstance<T> {
        return new _None();
      },
    },
  );
