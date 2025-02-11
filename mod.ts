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
class ok<T> implements Ok<T>, Iterable<T> {
  readonly ok = true;
  constructor(readonly value: T) {}

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
class err<E> implements Err<E>, Iterable<never> {
  readonly ok = false;
  constructor(readonly error: E) {}

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
  ok<T>(value: T): Ok<T> & Iterable<T>;
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
  err<E>(error: E): Err<E> & Iterable<never>;
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
export const Result: StaticResult = {
  ok<T>(value: T): Ok<T> & Iterable<T> {
    return new ok(value);
  },
  err<E>(error: E): Err<E> & Iterable<never> {
    return new err(error);
  },
};
