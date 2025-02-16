import type { Brand } from "./brand.ts";

/** Context */
export type Context<T extends string> = Brand<T | typeof context, object>;
const context: unique symbol = Symbol("Context");

/**
 * Bind Operator
 *
 * ### Example
 *
 * ```ts
 * import { Option } from "./option.ts";
 * import { Result } from "./result.ts";
 *
 * const option: Option<string> = Option.some(Math.random())
 *   .bind<number>((n) => n > 0.5 ? Option.some(n) : Option.none())
 *   .bind<string>((n) => Option.some(n.toFixed(2)));
 * console.log(`${option}`);
 *
 * const result = Result.ok(Math.random())
 *   .bind<number, string>((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
 *   .bind<string>((n) => Result.ok(n.toFixed(2)));
 * console.log(`${result}`);
 * ```
 */
export interface BindOperator<T> {
  bind<U, V extends BindOperator<U>>(fn: (v: T) => V): V;
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
 *   .bind<number>((n) => n > 0.5 ? Option.some(n) : Option.none())
 *   .map<string>((n) => n.toFixed(2));
 * console.log(`${option}`);
 *
 * const result = Result.ok(Math.random())
 *   .bind<number, string>((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
 *   .map<string>((n) => n.toFixed(2));
 * console.log(`${result}`);
 * ```
 */
export interface MapOperator<T> {
  map<U, V extends MapOperator<U>>(fn: (v: T) => U): V;
}
