import type { None, Some } from "./option.ts";
import type { Context } from "./types.ts";
import type { BindOperator, MapOperator } from "./types.ts";
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
export type Result<T, E = Error> = Context<"Result"> & (Ok<T> | Err<E>);

/** Result Instance */
export interface ResultInstance<T, E = Error>
  extends Iterable<T>, ResultToOption<T>, BindOperator<T>, MapOperator<T> {
  /** Bind Operator */
  bind<U, E = Error, V = Result<U, E> & ResultInstance<U, E>>(
    fn: (v: T) => V,
  ): V;

  /** Map Operator */
  map<U, V = Result<U, E> & ResultInstance<U, E>>(fn: (v: T) => U): V;
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
  ok<T, E = never>(value: T): Context<"Result"> & Ok<T> & ResultInstance<T, E>;
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
  err<T = never, E = Error>(
    error: E,
  ): Context<"Result"> & Err<E> & ResultInstance<T, E>;
}

/** impl Ok<T> */
class _Ok<T, E = never> implements Ok<T>, ResultInstance<T, E> {
  readonly ok = true;
  constructor(readonly value: T) {
  }

  toString(): string {
    return `Ok(${this.value})`;
  }

  /** impl ResultToOption */
  toOption(): Context<"Option"> & Some<T> & OptionInstance<T> {
    return Option.some(this.value);
  }

  /** impl BindOperator */
  bind<U>(fn: (v: T) => U): U {
    return fn(this.value);
  }

  /** impl MapOperator */
  map<U, V>(fn: (v: T) => U): V {
    return Result.ok(fn(this.value)) as V;
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
class _Err<T = never, E = Error> implements Err<E>, ResultInstance<T, E> {
  readonly ok = false;
  constructor(readonly error: E) {
  }

  toString(): string {
    return `Err(${this.error})`;
  }

  /** impl ResultToOption */
  toOption(): Context<"Option"> & None & OptionInstance<never> {
    return Option.none();
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
  & (<T, E>(result: Ok<T> | Err<E>) => Result<T, E> & ResultInstance<T, E>)
  & StaticResult = Object.assign(
    <T, E>(result: Ok<T> | Err<E>): Result<T, E> & ResultInstance<T, E> => {
      return result.ok ? Result.ok(result.value) : Result.err(result.error);
    },
    {
      ok<T, E>(value: T): Context<"Result"> & Ok<T> & ResultInstance<T, E> {
        return new _Ok(value) as
          & Context<"Result">
          & Ok<T>
          & ResultInstance<T, E>;
      },
      err<T, E>(error: E): Context<"Result"> & Err<E> & ResultInstance<T, E> {
        return new _Err(error) as unknown as
          & Context<"Result">
          & Err<E>
          & ResultInstance<T, E>;
      },
    },
  );
