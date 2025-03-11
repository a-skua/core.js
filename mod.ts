/**
 * My favorite type definitions.
 *
 * ## type Option
 *
 * ```ts
 * import { Option } from "@askua/core";
 *
 * const n = Option.some(Math.random())
 *   .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
 *   .map((n) => n.toFixed(2))
 *
 * console.log(n.unwrapOr("n is less than 0.5"));
 * ```
 *
 * ## type Result
 *
 * ```ts
 * import { Result } from "@askua/core";
 *
 * const n = Result.ok(Math.random())
 *   .andThen((n) => n >= 0.5 ? Result.ok(n) : Result.err(new Error("n is less than 0.5")))
 *   .map((n) => n.toFixed(2));
 *
 * console.log(n.unwrapOrElse((e) => e.message));
 * ```
 *
 * ## type Brand
 *
 * ```ts
 * import { Brand } from "@askua/core";
 *
 * type Email = Brand<string, "Email">;
 * const Email = Brand<string, "Email">;
 *
 * const myEmail: Email = Email("branded.type@example.com");
 * ```
 *
 * @module
 */

export { Result } from "./result.ts";
export { Option } from "./option.ts";
export { Brand } from "./brand.ts";
