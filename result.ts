import type { None, OptionToResult, Some } from "./option.ts";
import { Option } from "./option.ts";
/**
 * type Ok
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const result = Result.ok("is ok");
 * assertEquals([...result], ["is ok"]);
 * ```
 */
export interface Ok<T> {
  /** true */
  readonly ok: true;
  /** value */
  readonly value: T;
}

/** impl Ok<T> */
class ok<T> implements Ok<T>, Iterable<T>, ResultToOption<T> {
  readonly ok = true;
  constructor(readonly value: T) {}

  toOption(): Some<T> & Iterable<T> & OptionToResult<T> {
    return Option.some(this.value);
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

/**
 * type Err
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const result = Result.err("is error");
 * assertEquals([...result], []);
 * ```
 */
export interface Err<E> {
  /** false */
  readonly ok: false;
  /** error */
  readonly error: E;
}

/** impl Err<E> */
class err<E> implements Err<E>, Iterable<never>, ResultToOption<never> {
  readonly ok = false;
  constructor(readonly error: E) {}

  toOption(): None & Iterable<never> & OptionToResult<never> {
    return Option.none();
  }

  toString(): string {
    return `Err(${this.error})`;
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
 * Result to Option
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
export interface ResultToOption<T> {
  /** to Option */
  toOption(): Option<T> & Iterable<T> & OptionToResult<T>;
}

/**
 * static Result object.
 *
 * ### Example
 *
 * ```ts
 * function toUpperCase(obj: any): Result<string> {
 *   if (typeof obj === "string") {
 *     return Result.ok(obj.toUpperCase());
 *   }
 *
 *   return Result.err(new Error("is not string"));
 * }
 * ```
 */
export interface StaticResult {
  /**
   * return Ok<T>
   *
   * ### Example
   *
   * ```ts
   * import { assertEquals, assertObjectMatch } from "@std/assert";
   *
   * assertObjectMatch(
   *   Result.ok("is ok"),
   *   { ok: true, value: "is ok" },
   * );
   *
   * for (const value of Result.ok("is ok")) {
   *   assertEquals(value, "is ok");
   * }
   *
   * const array = Array.from(Result.ok("is ok"));
   * assertEquals(array, ["is ok"]);
   * ```
   */
  ok<T>(value: T): Ok<T> & Iterable<T> & ResultToOption<T>;
  /**
   * return Err<E>
   *
   * ### Example
   *
   * ```ts
   * import { assert, assertEquals, assertObjectMatch } from "@std/assert";
   *
   * assertObjectMatch(
   *   Result.err("is error"),
   *   { ok: false, error: "is error" },
   * );
   *
   * for (const _ of Result.err("is error")) {
   *   assert(false);
   * }
   *
   * const array = Array.from(Result.err("is error"));
   * assertEquals(array, []);
   * ```
   */
  err<E>(error: E): Err<E> & Iterable<never> & ResultToOption<never>;
}

/**
 * type Result
 *
 * ### Example
 *
 * ```ts
 * function toUpperCase(obj: any): Result<string> {
 *   if (typeof obj === "string") {
 *     return Result.ok(obj.toUpperCase());
 *   }
 *
 *   return Result.err(new Error("is not string"));
 * }
 *
 * const result = toUpperCase(1);
 * if (result.ok) {
 *   console.log(result.value);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;
/** impl StaticResult */
export const Result:
  & (<T, E>(
    result: Result<T, E>,
  ) => Result<T, E> & Iterable<T> & ResultToOption<T>)
  & StaticResult = Object.assign(
    <T, E>(
      result: Result<T, E>,
    ): Result<T, E> & Iterable<T> & ResultToOption<T> => {
      return result.ok ? new ok(result.value) : new err(result.error);
    },
    {
      ok<T>(value: T): Ok<T> & Iterable<T> & ResultToOption<T> {
        return new ok(value);
      },
      err<E>(error: E): Err<E> & Iterable<never> & ResultToOption<never> {
        return new err(error);
      },
    },
  );
