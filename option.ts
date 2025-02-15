import type { Err, Ok, ResultToOption } from "./result.ts";
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

/** implementation of Some */
class _Some<T> implements Some<T>, Iterable<T>, OptionToResult<T> {
  readonly some = true;
  constructor(readonly value: T) {}

  toString(): string {
    return `Some(${this.value})`;
  }

  toResult(): Ok<T> & Iterable<T> & ResultToOption<T> {
    return Result.ok(this.value);
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

/** implementation of None */
class _None implements None, Iterable<never>, OptionToResult<never> {
  readonly some = false;

  toString(): string {
    return "None";
  }

  toResult<E = Error>(
    err: E = new Error("None") as E,
  ): Err<E> & Iterable<never> & ResultToOption<never> {
    return Result.err(err);
  }

  [Symbol.iterator](): Iterator<never> {
    return Object.assign(this, {
      next(): IteratorResult<never> {
        return { done: true, value: undefined };
      },
    });
  }
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
  toResult<E = Error>(
    error?: E,
  ): Result<T, E> & Iterable<T> & ResultToOption<T>;
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
  some<T>(value: T): Some<T> & Iterable<T> & OptionToResult<T>;
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
  none():
    & None
    & Iterable<never>
    & OptionToResult<never>
    & OptionToResult<never>;
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
/** implementation of StaticOption */
export const Option:
  & (<T>(option: Option<T>) => Option<T> & Iterable<T> & OptionToResult<T>)
  & StaticOption = Object.assign(
    <T>(option: Option<T>): Option<T> & Iterable<T> & OptionToResult<T> => {
      return option.some ? new _Some(option.value) : new _None();
    },
    {
      some<T>(value: T): Some<T> & Iterable<T> & OptionToResult<T> {
        return new _Some(value);
      },
      none(): None & Iterable<never> & OptionToResult<never> {
        return new _None();
      },
    },
  );
