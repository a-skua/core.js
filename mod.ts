/**
 * My favorite type definitions.
 *
 * ## type Option
 *
 * ```ts
 * import { some, none } from "@askua/core";
 *
 * const n = some(Math.random())
 *   .andThen((n) => n >= 0.5 ? some(n) : none())
 *   .map((n) => n.toFixed(2))
 *
 * console.log(n.unwrapOr("n is less than 0.5"));
 * ```
 *
 * ## type Result
 *
 * ```ts
 * import { ok, err } from "@askua/core";
 *
 * const n = ok(Math.random())
 *   .andThen((n) => n >= 0.5 ? ok(n) : err(new Error("n is less than 0.5")))
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

export { err, ok, Result } from "./result.ts";
export { none, Option, some } from "./option.ts";
export { Brand } from "./brand.ts";
