/**
 * My favorite type definitions.
 *
 * @example {@link Option} usage
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
 * @example Using {@link Option} with `JSON`
 * ```ts
 * import { some, type Option } from "@askua/core/option";
 *
 * const json = JSON.stringify(some(1));
 *
 * const option: Option<number> = JSON.parse(json);
 *
 * if (option.some) console.log("Option has value:", option.value);
 * ```
 *
 * @example Using {@link Option} with `JSON`
 * ```ts
 * import { some, Option } from "@askua/core/option";
 *
 * const json = JSON.stringify(some(1));
 *
 * const option: Option<number> = JSON.parse(json);
 *
 * Option(option).tee((value) => console.log("Option has value:", value));
 * ```
 *
 * @example {@link Result} usage
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
 * @example Using {@link Result} with `JSON`
 * ```ts
 * import { ok, type Result } from "@askua/core/result";
 *
 * const json = JSON.stringify(ok(1));
 *
 * const result: Result<number, string> = JSON.parse(json);
 *
 * if (result.ok) console.log("Result has value:", result.value);
 * ```
 *
 * @example Using {@link Result} with `JSON`
 * ```ts
 * import { ok, Result } from "@askua/core/result";
 *
 * const json = JSON.stringify(ok(1));
 *
 * const result: Result<number, string> = JSON.parse(json);
 *
 * Result(result).tee((value) => console.log("Result has value:", value));
 * ```
 *
 * @example {@link Brand} usage
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
