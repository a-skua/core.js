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
 *   .bind((n) => n > 0.5 ? Option.some(n) : Option.none())
 *   .bind((n) => Option.some(n.toFixed(2)));
 * console.log(`${option}`);
 *
 * const result = Result.ok(Math.random())
 *   .bind((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
 *   .bind((n) => Result.ok(n.toFixed(2)));
 * console.log(`${result}`);
 * ```
 */
export interface BindOperator<T, U> {
  bind<V, W extends U & BindOperator<V, U> = U & BindOperator<V, U>>(
    fn: (v: T) => W,
  ): W;
}
