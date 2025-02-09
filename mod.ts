/** type Ok */
export interface Ok<T> {
  ok: true;
  value: T;
}

/** impl Ok<T> */
class ok<T> implements Ok<T> {
  readonly ok = true;
  constructor(readonly value: T) {}

  toString(): string {
    return `Ok(${this.value})`;
  }
}

/** type Err */
export interface Err<E> {
  ok: false;
  error: E;
}

class err<E> implements Err<E> {
  readonly ok = false;
  constructor(readonly error: E) {}

  toString(): string {
    return `Err(${this.error})`;
  }
}

/**
 * static Result object.
 *
 * ### Example
 *
 * ``ts
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
   * import { assertObjectMatch } from "@std/assert";
   *
   * assertObjectMatch(
   *   Result.ok("is ok"),
   *   { ok: true, value: "is ok" },
   * );
   * ```
   */
  ok<T>(value: T): Ok<T>;
  /**
   * return Err<E>
   *
   * ### Example
   *
   * ```ts
   * import { assertObjectMatch } from "@std/assert";
   *
   * assertObjectMatch(
   *   Result.err("is error"),
   *   { ok: false, error: "is error" },
   * );
   * ```
   */
  err<E>(error: E): Err<E>;
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
  ok<T>(value: T): Ok<T> {
    return new ok(value);
  },
  err<E>(error: E): Err<E> {
    return new err(error);
  },
};
