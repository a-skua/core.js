/**
 * My favorite type definitions.
 *
 * ## type Option
 *
 * ```ts
 * import { some, none } from "@askua/core";
 *
 * const n = some(Math.random())
 *   .filter((n) => n >= 0.5)
 *   .map((n) => n.toFixed(2))
 *
 * console.log(n.unwrap(() => "n is less than 0.5"));
 * ```
 *
 * ## type Result
 *
 * ```ts
 * import { ok, err } from "@askua/core";
 *
 * const n = ok(Math.random())
 *   .filter((n) => n >= 0.5, (n) => new Error(`n ${n.toFixed(2)} is less than 0.5`))
 *   .map((n) => n.toFixed(2));
 *
 * console.log(n.unwrap((e) => e.message));
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

export * from "./result.ts";
export * from "./option.ts";
export * from "./brand.ts";
export * from "./types.ts";
