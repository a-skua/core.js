import type {
  AndOperator,
  MapOperator,
  OrOperator,
  UnwrapOperator,
} from "./types.ts";
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

/** Instance */
export type ResultInstance<T, E = Error> = Result<T, E> & Context<T, E>;

/** Context */
export interface Context<T, E>
  extends
    Iterable<T>,
    ResultToOption<T>,
    AndOperator<T>,
    OrOperator<E>,
    MapOperator<T>,
    UnwrapOperator<T> {
  /** And Operator */
  andThen<
    U,
    D,
    Fn extends (v: T) => Result<U, D>,
    Ok extends (
      ReturnType<Fn> extends Result<infer U, unknown> ? U : never
    ),
    Err extends (
      ReturnType<Fn> extends Result<unknown, infer D> ? E | D : E
    ),
    Return extends Result<Ok, Err> = ResultInstance<Ok, Err>,
  >(fn: Fn): Return;

  /** And Operator */
  and<
    U,
    D,
    V extends Result<U, D>,
    Ok extends (
      V extends Result<infer U, unknown> ? U : never
    ),
    Err extends (
      V extends Result<unknown, infer D> ? E | D : E
    ),
    Return extends Result<Ok, Err> = ResultInstance<Ok, Err>,
  >(
    result: V,
  ): Return;

  /** Or Operator */
  orElse<
    U,
    D,
    Fn extends (error: E) => Result<U, D>,
    Ok extends (
      ReturnType<Fn> extends Result<infer U, unknown> ? T | U : T
    ),
    Err extends (
      ReturnType<Fn> extends Result<unknown, infer D> ? E | D : E
    ),
    Return extends Result<Ok, Err> = ResultInstance<Ok, Err>,
  >(fn: Fn): Return;

  /** Or Operator */
  or<
    U,
    D,
    V extends Result<U, D>,
    Ok extends (
      V extends Result<infer U, unknown> ? T | U : T
    ),
    Err extends (
      V extends Result<unknown, infer D> ? E | D : E
    ),
    Return extends Result<Ok, Err> = ResultInstance<Ok, Err>,
  >(result: V): Return;

  /** Map Operator */
  map<
    U,
    Fn extends (value: T) => U,
    Ok extends ReturnType<Fn>,
    Err extends E,
    Return extends Result<Ok, Err> = ResultInstance<Ok, Err>,
  >(fn: Fn): Return;
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
export interface StaticContext {
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
  ok<T, E = Error>(value: T): Ok<T> & Context<T, E>;

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
  err<T, E>(error: E): Err<E> & Context<T, E>;

  /** andThen */
  andThen<
    T,
    E,
    Fn extends (() => Result<T, E> | Promise<Result<T, E>>)[],
    Ok extends ({
      [K in keyof Fn]: ReturnType<Fn[K]> extends
        Promise<Result<infer T, unknown>> ? T
        : ReturnType<Fn[K]> extends Result<infer T, unknown> ? T
        : never;
    }),
    Err extends ({
      [K in keyof Fn]: ReturnType<Fn[K]> extends
        Promise<Result<unknown, infer E>> ? E
        : ReturnType<Fn[K]> extends Result<unknown, infer E> ? E
        : never;
    })[number],
    Return extends Result<Ok, Err> = ResultInstance<Ok, Err>,
  >(...fn: Fn): Promise<Return>;

  /** orElse */
  orElse<
    T,
    E,
    F extends () => Promise<Result<T, E>> | Result<T, E>,
    Fn extends [F, ...F[]],
    Ok extends ({
      [K in keyof Fn]: ReturnType<Fn[K]> extends
        Promise<Result<infer T, unknown>> ? T
        : ReturnType<Fn[K]> extends Result<infer T, unknown> ? T
        : never;
    })[number],
    Err extends ({
      [K in keyof Fn]: ReturnType<Fn[K]> extends
        Promise<Result<unknown, infer E>> ? E
        : ReturnType<Fn[K]> extends Result<unknown, infer E> ? E
        : never;
    })[number],
    Return extends Result<Ok, Err> = ResultInstance<Ok, Err>,
  >(...fn: Fn): Promise<Return>;
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
  toOption<O extends Option<T> = OptionInstance<T>>(): O;
}

/** impl Ok<T> */
class _Ok<T, E> implements Ok<T>, Context<T, E> {
  readonly ok = true;
  constructor(readonly value: T) {
  }

  toString(): string {
    return `Ok(${this.value})`;
  }

  /** impl ResultToOption */
  toOption<O extends Option<T> = OptionInstance<T>>(): O {
    return Option.some(this.value) as unknown as O;
  }

  /** impl AndOperator */
  andThen<U, V>(fn: (v: T) => U): V {
    return fn(this.value) as unknown as V;
  }

  /** impl AndOperator */
  and<U, V>(result: U): V {
    return result as unknown as V;
  }

  /** impl OrOperator */
  orElse<U>(): U {
    return this as unknown as U;
  }

  /** impl OrOperator */
  or<U>(): U {
    return this as unknown as U;
  }

  /** impl MapOperator */
  map<U, V>(fn: (v: T) => U): V {
    return Result.ok(fn(this.value)) as V;
  }

  /** impl UnwrapOperator */
  unwrap(): T {
    return this.value;
  }

  /** impl UnwrapOperator */
  unwrapOr(): T {
    return this.value;
  }

  /** impl UnwrapOperator */
  unwrapOrElse<U>(): U {
    return this.value as unknown as U;
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
class _Err<T, E> implements Err<E>, Context<T, E> {
  readonly ok = false;
  constructor(readonly error: E) {
  }

  toString(): string {
    return `Err(${this.error})`;
  }

  /** impl ResultToOption */
  toOption<O extends Option<T> = OptionInstance<T>>(): O {
    return Option.none() as unknown as O;
  }

  /** impl AndOperator */
  andThen<U>(): U {
    return this as unknown as U;
  }

  /** impl AndOperator */
  and<U>(): U {
    return this as unknown as U;
  }

  /** impl MapOperator */
  map<U>(): U {
    return this as unknown as U;
  }

  /** impl OrOperator */
  orElse<U, V>(fn: (error: E) => U): V {
    return fn(this.error) as unknown as V;
  }

  /** impl OrOperator */
  or<U, V>(result: U): V {
    return result as unknown as V;
  }

  /** impl UnwrapOperator */
  unwrap<U>(): U {
    throw this.error;
  }

  /** impl UnwrapOperator */
  unwrapOr<U, Return extends T | U>(value: U): Return {
    return value as unknown as Return;
  }

  /** impl UnwrapOperator */
  unwrapOrElse<
    U,
    Fn extends () => U | Promise<U>,
    Return extends (
      ReturnType<Fn> extends Promise<infer U> ? U
        : ReturnType<Fn> extends infer U ? U
        : never
    ),
  >(fn: (error: E) => ReturnType<Fn>): Return {
    return fn(this.error) as unknown as Return;
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

/** Result to ResultInstance */
export type ToInstance = <T, E>(result: Result<T, E>) => ResultInstance<T, E>;

/** impl StaticResult */
export const Result: ToInstance & StaticContext = Object.assign(
  <T, E>(result: Result<T, E>): ResultInstance<T, E> => {
    return result.ok ? Result.ok(result.value) : Result.err(result.error);
  },
  {
    ok<T, E>(value: T): Ok<T> & Context<T, E> {
      return new _Ok<T, E>(value);
    },
    err<T, E>(error: E): Err<E> & Context<T, E> {
      return new _Err<T, E>(error);
    },
    andThen: async <
      T,
      E,
      Fn extends (() => Result<T, E> | Promise<Result<T, E>>)[],
      Ok extends ({
        [K in keyof Fn]: ReturnType<Fn[K]> extends
          Promise<Result<infer U, unknown>> ? U
          : ReturnType<Fn[K]> extends Result<infer U, unknown> ? U
          : never;
      }),
      Err extends ({
        [K in keyof Fn]: ReturnType<Fn[K]> extends
          Promise<Result<unknown, infer D>> ? D
          : ReturnType<Fn[K]> extends Result<unknown, infer D> ? D
          : never;
      })[number],
      Return extends Result<Ok, Err> = ResultInstance<Ok, Err>,
    >(
      ...fn: Fn
    ): Promise<Return> => {
      const oks: T[] = new Array(fn.length);
      for (let i = 0; i < fn.length; i++) {
        const result = await fn[i]();
        if (result.ok) {
          oks[i] = result.value;
        } else {
          return result as unknown as Return;
        }
      }
      return Result.ok(oks) as unknown as Return;
    },

    orElse: async <
      T,
      E,
      F extends () => Promise<Result<T, E>> | Result<T, E>,
      Fn extends [F, ...F[]],
      Ok extends ({
        [K in keyof Fn]: ReturnType<Fn[K]> extends
          Promise<Result<infer T, unknown>> ? T
          : ReturnType<Fn[K]> extends Result<infer T, unknown> ? T
          : never;
      })[number],
      Err extends ({
        [K in keyof Fn]: ReturnType<Fn[K]> extends
          Promise<Result<unknown, infer E>> ? E
          : ReturnType<Fn[K]> extends Result<unknown, infer E> ? E
          : never;
      })[number],
      Return extends Result<Ok, Err> = ResultInstance<Ok, Err>,
    >(...fn: Fn): Promise<Return> => {
      let last;
      for (let i = 0; i < fn.length; i++) {
        const result = await fn[i]();
        if (result.ok) {
          return result as unknown as Return;
        }
        last = result;
      }
      return last as unknown as Return;
    },
  },
);
