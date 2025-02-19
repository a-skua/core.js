/**
 * And Operator
 *
 * ### Example
 *
 * ```ts
 * import { Option } from "./option.ts";
 * import { Result } from "./result.ts";
 *
 * const option: Option<string> = Option.some(Math.random())
 *   .andThen((n) => n > 0.5 ? Option.some(n) : Option.none())
 *   .andThen((n) => Option.some(n.toFixed(2)));
 * console.log(`${option}`);
 *
 * const result: Result<string, string> = Result.ok(Math.random())
 *   .andThen((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
 *   .andThen((n) => Result.ok(n.toFixed(2)));
 * console.log(`${result}`);
 * ```
 */
export interface AndOperator<T, U = unknown> {
  /**
   * andThen
   *
   * ## Example
   *
   * ```ts
   * import { Option } from "./option.ts";
   *
   * const option = Option.some(Math.random())
   *   .andThen((n) => n > 0.5 ? Option.some(n) : Option.none());
   * console.log(`${option}`);
   * ```
   */
  andThen(fn: (v: T) => U): U;

  /**
   * and
   *
   * ## Example
   *
   * ```ts
   * import { Option } from "./option.ts";
   *
   * const option = Option.some(Math.random())
   *   .andThen((n) => n > 0.5 ? Option.some(n) : Option.none())
   *   .and(Option.some("TOO LARGE"));
   * console.log(`${option}`);
   * ```
   */
  and(value: U): U;
}

/**
 * Or Operator
 *
 * ### Example
 *
 * ```ts
 * import { Option } from "./option.ts";
 *
 * const option: Option<number | string> = Option.some(Math.random())
 *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
 *   .orElse(() => Option.some("TOO SMALL"));
 * console.log(`${option}`);
 * ```
 */
export interface OrOperator<T, U = unknown, V = unknown> {
  /**
   * orElse
   *
   * ### Example
   *
   * ```ts
   * import { Result } from "./result.ts";
   *
   * const result: Result<number | string, string> = Result.ok(Math.random())
   *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
   *   .orElse((e) => Result.ok(e));
   * console.log(`${result}`);
   * ```
   */
  orElse(fn: (v: T) => U): V;

  /**
   * or
   *
   * ### Example
   *
   * ```ts
   * import { Option } from "./option.ts";
   *
   * const option: Option<number | string> = Option.some(Math.random())
   *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
   *   .or(Option.some("TOO SMALL"));
   * console.log(`${option}`);
   * ```
   */
  or(v: U): V;
}

/**
 * Map Operator
 *
 * ### Example
 *
 * ```ts
 * import { Option } from "./option.ts";
 * import { Result } from "./result.ts";
 *
 * const option: Option<string> = Option.some(Math.random())
 *   .andThen((n) => n > 0.5 ? Option.some(n) : Option.none())
 *   .map((n) => n.toFixed(2));
 * console.log(`${option}`);
 *
 * const result: Result<string, string> = Result.ok(Math.random())
 *   .andThen((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
 *   .map((n) => n.toFixed(2));
 * console.log(`${result}`);
 * ```
 */
export interface MapOperator<T, U = unknown, V = unknown> {
  map(fn: (value: T) => U): V;
}

/**
 * Unwrap Operator
 *
 * ### Example
 *
 * ```ts
 * import { Option } from "./option.ts";
 * import { Result } from "./result.ts";
 *
 * const option: number = Option.some(Math.random())
 *   .andThen((n) => n > 0.5 ? Option.some(n) : Option.none())
 *   .unwrapOr(0);
 * console.log(option);
 *
 * const result: number = Result.ok<number, string>(Math.random())
 *   .andThen((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
 *   .unwrapOr(0);
 * console.log(result);
 * ```
 */
export interface UnwrapOperator<T> {
  /**
   * Unwrap the value
   *
   * @throws {Error} if the value is not present
   */
  unwrap<U = T>(): T | U;

  /**
   * Unwrap the value or return the default value
   */
  unwrapOr<U = T>(defaultValue: U): T | U;

  /**
   * Unwrap the value or return the default value
   */
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
  >(fn: Fn): Return;
}
