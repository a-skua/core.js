import type { None, Some } from "./option.ts";
import type { MapOperator } from "./types.ts";
import type { OptionInstance } from "./option.ts";
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

/** Result Instance */
export type ResultInstance<T> =
  & Iterable<T>
  & ResultToOption<T>
  & MapOperator<T, Result<unknown, unknown>>;

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
  toOption(): Option<T> & OptionInstance<T>;
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
  ok<T>(value: T): Ok<T> & ResultInstance<T>;
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
  err<T = never, E = Error>(error: E): Err<E> & ResultInstance<T>;
}

/** impl Ok<T> */
class _Ok<T> implements Ok<T>, ResultInstance<T> {
  readonly ok = true;
  constructor(readonly value: T) {}

  toString(): string {
    return `Ok(${this.value})`;
  }

  /** impl ResultToOption */
  toOption(): Some<T> & OptionInstance<T> {
    return Option.some(this.value);
  }

  /** impl MapOperator */
  map<U, E, V extends Result<U, E>>(fn: (v: T) => V): V {
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

/** impl Err<E> */
class _Err<E> implements Err<E>, ResultInstance<never> {
  readonly ok = false;
  constructor(readonly error: E) {}

  toString(): string {
    return `Err(${this.error})`;
  }

  /** impl ResultToOption */
  toOption(): None & OptionInstance<never> {
    return Option.none();
  }

  /** impl MapOperator */
  map<U, E, V extends Result<U, E>>(): V {
    return this as unknown as V;
  }

  /** impl Iterable */
  [Symbol.iterator](): Iterator<never> {
    return Object.assign(this, {
      next(): IteratorResult<never> {
        return { done: true, value: undefined };
      },
    });
  }
}

/** impl StaticResult */
export const Result:
  & (<T, E>(result: Result<T, E>) => Result<T, E> & ResultInstance<T>)
  & StaticResult = Object.assign(
    <T, E>(result: Result<T, E>): Result<T, E> & ResultInstance<T> => {
      return result.ok ? Result.ok(result.value) : Result.err(result.error);
    },
    {
      ok<T>(value: T): Ok<T> & ResultInstance<T> {
        return new _Ok(value);
      },
      err<E>(error: E): Err<E> & ResultInstance<never> {
        return new _Err(error);
      },
    },
  );
