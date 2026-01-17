/**
 * @example
 * ```sh
 * deno run example/with_json.ts 2>/dev/null
 * ```
 */
import { err, ok, Result } from "@askua/core/result";

/**
 * e.g. floorDecimal(3.14159) -> 3.14
 */
function floorDecimal(value: number, base = 0.01): number {
  const power = 1 / base;
  return Math.floor(value * power) / power;
}

/**
 * e.g. tryGetNumbers() -> '{"ok":[0.67,0.89,0.45]}'
 */
function tryGetNumbers(): string {
  return JSON.stringify(
    Result.and(
      ok(Math.random()).filter((n) => n > 0.5).map(floorDecimal),
      ok(Math.random()).filter((n) => n > 0.5).map(floorDecimal),
      ok(Math.random()).filter((n) => n > 0.5).map(floorDecimal),
    ).or((n) => err(`Number ${n.toFixed(4)} is not greater than 0.5`)),
  );
}

function getNumbers(): [number, number, number] {
  const received = tryGetNumbers();
  console.warn("Received string:", received);

  const parsed: Result<[number, number, number], string> = JSON.parse(received);
  console.warn("Parsed JSON:", parsed);

  const result = Result(parsed);
  console.debug(`Result: ${result}`);

  return result.unwrap(() => getNumbers());
}

if (import.meta.main) {
  console.log(`Final number:`, getNumbers());
}
