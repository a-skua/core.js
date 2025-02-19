import type {
  AndOperator,
  MapOperator,
  OrOperator,
  UnwrapOperator,
} from "./types.ts";
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
export type OptionInstance<T> = Option<T> & Context<T>;

/** Option Context */
export interface Context<T>
  extends
    Iterable<T>,
    OptionToResult<T>,
    MapOperator<T>,
    AndOperator<T>,
    OrOperator<never>,
    UnwrapOperator<T> {
  /** And Operator */
  andThen<
    U,
    Fn extends (v: T) => U,
    Some extends (
      ReturnType<Fn> extends Option<infer U> ? U : never
    ),
    Return extends Option<Some> = OptionInstance<Some>,
  >(fn: Fn): Return;

  /** And Operator */
  and<
    U,
    V extends Option<U>,
    Some extends (
      V extends Option<infer U> ? U : never
    ),
    Return extends Option<Some> = OptionInstance<Some>,
  >(option: V): Return;

  /** Or Operator */
  orElse<
    U,
    Fn extends () => U,
    Some extends (
      U extends Option<infer U> ? U : never
    ),
    Return extends Option<Some> = OptionInstance<Some>,
  >(fn: Fn): Return;

  /** Or Operator */
  or<
    U,
    V extends Option<U>,
    Some extends (
      V extends Option<infer U> ? U : never
    ),
    Return extends Option<Some> = OptionInstance<Some>,
  >(option: V): Return;

  /** Map Operator */
  map<
    U,
    Fn extends (v: T) => U,
    Some extends (
      ReturnType<Fn> extends Option<infer U> ? U : never
    ),
    Return extends Option<Some> = OptionInstance<Some>,
  >(fn: Fn): Return;
}

/**
 * type StaticOption
 */
export interface StaticContext {
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
  some<T>(value: T): Some<T> & Context<T>;

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
  none<T = never>(): None & Context<T>;

  /** andThen */
  andThen<
    T,
    Fn extends (() => Option<T> | Promise<Option<T>>)[],
    Some extends ({
      [K in keyof Fn]: ReturnType<Fn[K]> extends Promise<Option<infer T>> ? T
        : ReturnType<Fn[K]> extends Option<infer T> ? T
        : never;
    }),
    Return extends Option<Some> = OptionInstance<Some>,
  >(...fn: Fn): Promise<Return>;

  /** orElse */
  orElse<
    T,
    F extends () => Option<T> | Promise<Option<T>>,
    Fn extends [F, ...F[]],
    Some extends ({
      [K in keyof Fn]: ReturnType<Fn[K]> extends Promise<Option<infer T>> ? T
        : ReturnType<Fn[K]> extends Option<infer T> ? T
        : never;
    })[number],
    Return extends Option<Some> = OptionInstance<Some>,
  >(...fn: Fn): Promise<Return>;
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
 * const err = Option.none().toResult<Error>();
 * assertEquals(err, Result.err(new Error("None")));
 *
 * const customErr = Option.none().toResult<string>("is none");
 * assertEquals(customErr, Result.err("is none"));
 * ```
 */
export interface OptionToResult<T> {
  /** to Result */
  toResult<E = never, R extends Result<T, E> = ResultInstance<T, E>>(
    error?: E,
  ): R;
}

/** impl Some */
class _Some<T> implements Some<T>, Context<T> {
  readonly some = true;
  constructor(readonly value: T) {}

  toString(): string {
    return `Some(${this.value})`;
  }

  /** impl OptionToResult */
  toResult<R>(): R {
    return Result.ok(this.value) as unknown as R;
  }

  /** impl AndOperator */
  andThen<U, V>(fn: (v: T) => U): V {
    return fn(this.value) as unknown as V;
  }

  /** impl AndOperator */
  and<U, V>(option: U): V {
    return option as unknown as V;
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

/** impl None */
class _None<T> implements None, Context<T> {
  readonly some = false;
  constructor() {}

  toString(): string {
    return "None";
  }

  /** impl OptionToResult */
  toResult<E, R>(error: E = new Error("None") as E): R {
    return Result.err(error) as unknown as R;
  }

  /** impl AndOperator */
  andThen<U>(): U {
    return this as unknown as U;
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
  unwrapOr<U>(value: U): U {
    return value;
  }

  /** impl UnwrapOperator */
  unwrapOrElse<
    U,
    Fn extends () => U | Promise<U>,
    Return extends
      | T
      | (
        ReturnType<Fn> extends Promise<infer U> ? U
          : ReturnType<Fn> extends infer U ? U
          : never
      ),
  >(fn: () => ReturnType<Fn>): Return {
    return fn() as unknown as Return;
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

/** Option to OptionInstance */
export type ToInstance = <T>(option: Option<T>) => OptionInstance<T>;

/** impl StaticOption */
export const Option: ToInstance & StaticContext = Object.assign(
  <T>(option: Option<T>): OptionInstance<T> => {
    return option.some ? Option.some(option.value) : Option.none();
  },
  {
    some<T>(value: T): Some<T> & Context<T> {
      return new _Some(value);
    },
    none<T>(): None & Context<T> {
      return new _None<T>();
    },
    andThen: async <
      T,
      Fn extends (() => Option<T> | Promise<Option<T>>)[],
      Some extends ({
        [K in keyof Fn]: ReturnType<Fn[K]> extends Promise<Option<infer T>> ? T
          : ReturnType<Fn[K]> extends Option<infer T> ? T
          : never;
      }),
      Return extends Option<Some> = OptionInstance<Some>,
    >(...fn: Fn): Promise<Return> => {
      const somes: T[] = new Array(fn.length);
      for (let i = 0; i < fn.length; i++) {
        const option = await fn[i]();
        if (option.some) {
          somes[i] = option.value;
        } else {
          return option as Return;
        }
      }

      return Option.some(somes) as unknown as Return;
    },
    orElse: async <
      T,
      F extends () => Option<T> | Promise<Option<T>>,
      Fn extends [F, ...F[]],
      Some extends ({
        [K in keyof Fn]: ReturnType<Fn[K]> extends Promise<Option<infer T>> ? T
          : ReturnType<Fn[K]> extends Option<infer T> ? T
          : never;
      })[number],
      Return extends Option<Some> = OptionInstance<Some>,
    >(...fn: Fn): Promise<Return> => {
      let last;
      for (let i = 0; i < fn.length; i++) {
        const option = await fn[i]();
        if (option.some) {
          return option as unknown as Return;
        }
        last = option;
      }
      return last as unknown as Return;
    },
  },
);
