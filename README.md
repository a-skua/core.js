# core.js

My favorite types.

## Installation

```sh
npx jsr add @askua/core
```

Published to [JSR](https://jsr.io/@askua/core)

## Usage

```ts
import { Result } from "@askua/core";

function toUpperCase(obj: any): Result<string> {
  if (typeof obj === "string") {
    return Result.ok(obj.toUpperCase());
  }

  return Result.err(new Error("is not string"));
}

const result = toUpperCase(1);
if (result.ok) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

## Benchmark

```plain
$ deno bench
    CPU | Apple M2
Runtime | Deno 2.1.9 (aarch64-apple-darwin)

file:///core.js/mode_bench.ts

benchmark    time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------ ----------------------------- --------------------- --------------------------
Result.ok             4.0 ns   252,000,000 (  3.8 ns …   9.3 ns)   3.9 ns   5.3 ns   5.8 ns
Result.err            4.1 ns   245,800,000 (  3.9 ns …   8.9 ns)   4.0 ns   5.3 ns   5.9 ns
```
