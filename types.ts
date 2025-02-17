import type { Brand } from "./brand.ts";

/** Context */
export type Context<T extends string> = Brand<T | typeof context, object>;
const context: unique symbol = Symbol("Context");

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
 *   .andThen<number>((n) => n > 0.5 ? Option.some(n) : Option.none())
 *   .andThen<string>((n) => Option.some(n.toFixed(2)));
 * console.log(`${option}`);
 *
 * const result: Result<string, string> = Result.ok(Math.random())
 *   .andThen<number, string>((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
 *   .andThen<string, string>((n) => Result.ok(n.toFixed(2)));
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
   * andThen
   *
   * ## Example
   *
   * ```ts
   * import { Option } from "./option.ts";
   *
   * const option = Option.some(Math.random())
   *   .andThen((n) => n > 0.5 ? Option.some(n) : Option.none())
   *   .and<string>(Option.some("TOO LARGE"));
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
 *   .andThen<number>((n) => n >= 0.5 ? Option.some(n) : Option.none())
 *   .orElse<string>(() => Option.some("TOO SMALL"));
 * console.log(`${option}`);
 * ```
 */
export interface OrOperator<T, U = unknown> {
  /**
   * Or Operator
   *
   * ### Example
   *
   * ```ts
   * import { Result } from "./result.ts";
   *
   * const result: Result<number | string, string> = Result.ok(Math.random())
   *   .andThen<number, string>((n) => n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
   *   .orElse<string>((e) => Result.ok(e));
   * console.log(`${result}`);
   * ```
   */
  orElse(fn: () => U): T | U;

  /**
   * Or Operator
   *
   * ### Example
   *
   * ```ts
   * import { Option } from "./option.ts";
   *
   * const option: Option<number | string> = Option.some(Math.random())
   *   .andThen<number>((n) => n >= 0.5 ? Option.some(n) : Option.none())
   *   .or<string>(Option.some("TOO SMALL"));
   * console.log(`${option}`);
   * ```
   */
  or(value: U): T | U;
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
 *   .andThen<number>((n) => n > 0.5 ? Option.some(n) : Option.none())
 *   .map<string>((n) => n.toFixed(2));
 * console.log(`${option}`);
 *
 * const result: Result<string, string> = Result.ok(Math.random())
 *   .andThen<number, string>((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
 *   .map<string>((n) => n.toFixed(2));
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
 *   .andThen<number>((n) => n > 0.5 ? Option.some(n) : Option.none())
 *   .unwrapOr(0);
 * console.log(option);
 *
 * const result: number = Result.ok(Math.random())
 *   .andThen<number, string>((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
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
  unwrap(): T;

  /**
   * Unwrap the value or return the default value
   */
  unwrapOr(defaultValue: T): T;
}
