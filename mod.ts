/**
 * My favorite type definitions.
 *
 * @example type {@link Option}
 * ```ts
 * import { some, Option } from "@askua/core/option";
 *
 * const json = JSON.stringify(some(1).map((n) => n + 1));
 *
 * const option: Option<number> = JSON.parse(json);
 *
 * if (option.some) console.log("Option has value:", option.value);
 *
 * // with Instance methods
 * Option(option).tee((value) => console.log("Option has value:", value));
 * ```
 *
 * @example type {@link Result}
 * ```ts
 * import { ok, Result } from "@askua/core/result";
 *
 * const json = JSON.stringify(ok(1).map((n) => n + 1));
 *
 * const result: Result<number, string> = JSON.parse(json);
 *
 * if (result.ok) console.log("Result has value:", result.value);
 *
 * // with Instance methods
 * Result(result).tee((value) => console.log("Result has value:", value));
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
