/**
 * @example
 * ```sh
 * deno run example/option.ts 2>/dev/null
 * ```
 */

import { some } from "@askua/core/option";

const one = (count = 1): 1 =>
  some(Math.random())
    .map((n) => Math.floor(n * 10))
    .tee((n) => console.warn(`Generated number #${count}:`, n))
    .filter((n): n is 1 => n === 1)
    .unwrap(() => one(count + 1));

console.log("get one:", one());
