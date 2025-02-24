/**
 * @example
 * ```ts
 * import { Option } from "@askua/core";
 *
 * const n = Option.some(Math.random())
 *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
 *   .or(Option.some(0))
 *   .map((n) => (n * 100).toFixed(2))
 *   .unwrap();
 *
 * console.log(n);
 * ```
 *
 * @module
 */

export { Result } from "./result.ts";
export { Option } from "./option.ts";
export { Brand } from "./brand.ts";
