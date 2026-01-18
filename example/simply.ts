/**
 * @example
 * ```sh
 * deno run example/simply.ts
 * ```
 */
import { err, ok, type Result } from "@askua/core/result";

// e.g. '{"some":true,"value":0.67}'
const n = JSON.stringify(
  ok(Math.random())
    .filter((n) => n > 0.5)
    .or((n) => err(`Number ${n.toFixed(4)} is not greater than 0.5`)),
);

const parsed: Result<number, string> = JSON.parse(n);

if (parsed.ok) {
  console.log("Parsed number:", parsed.value);
} else {
  console.log("Error parsing number:", parsed.error);
}
