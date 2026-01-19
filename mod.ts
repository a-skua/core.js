/**
 * My favorite type definitions.
 *
 * @example type {@link Option}
 * ```ts
 * import { some, none } from "@askua/core/option";
 *
 * const n = (count = 1): string => some(Math.random())
 *   .filter((n) => n >= 0.5)
 *   .map((n) => n.toFixed(2))
 *   .tee((n) => console.log(`Generated number: ${n} (on attempt #${count})`))
 *   .unwrap(() => n(count + 1));
 *
 * console.log(n());
 * ```
 *
 * @example type {@link Result}
 * ```ts
 * import { ok, err } from "@askua/core/result";
 *
 * const n = (count = 1): string => ok(Math.random())
 *   .filter((n) => n >= 0.5, (n) => `Generated number ${n} is less than 0.5 (on attempt #${count})`)
 *   .map((n) => n.toFixed(2))
 *   .tee((n) => console.log(`Generated number: ${n} (on attempt #${count})`))
 *   .unwrap((e) => {
 *     console.error(e);
 *     return n(count + 1);
 *   });
 *
 * console.log(n());
 * ```
 *
 * @example type {@link Brand}
 * ```ts
 * import { Brand } from "@askua/core/brand";
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
