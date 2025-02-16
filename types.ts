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
 *   .map((n) => n > 0.5 ? Option.some(n) : Option.none())
 *   .map((n) => Option.some(n.toFixed(2)));
 * console.log(`${option}`);
 *
 * const result = Result.ok(Math.random())
 *   .map((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
 *   .map((n) => Result.ok(n.toFixed(2)));
 * console.log(`${result}`);
 * ```
 */
export interface MapOperator<T, U> {
  map<V, W extends U & MapOperator<V, U> = U & MapOperator<V, U>>(
    fn: (v: T) => W,
  ): W;
}
