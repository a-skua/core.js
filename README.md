# core.js

My favorite types.

## Installation

```sh
npx jsr add @askua/core
```

Published to [JSR](https://jsr.io/@askua/core)

## Usage

```ts
import { Option, Result } from "@askua/core";

function toUpperCase(obj: any): Result<string> {
  if (typeof obj === "string") {
    return Result.ok(obj.toUpperCase());
  }

  return Result.err(new Error("is not string"));
}

function toUpperCaseOption(obj: any): Option<string> {
  if (typeof obj === "string") {
    return Option.some(obj.toUpperCase());
  }

  return Option.none();
}
```

## Benchmark

```plain
$ deno bench
    CPU | Apple M2
Runtime | Deno 2.1.9 (aarch64-apple-darwin)

file:///core.js/option_bench.ts

benchmark                             time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------------- ----------------------------- --------------------- --------------------------
Option.some(value)                             4.1 ns   243,400,000 (  3.9 ns …  10.6 ns)   4.1 ns   5.4 ns   6.3 ns
Option.none()                                  4.2 ns   239,000,000 (  4.0 ns …   9.3 ns)   4.2 ns   4.9 ns   5.5 ns
for (const v of Option.some(value))           99.3 ns    10,070,000 ( 94.6 ns … 107.7 ns) 101.8 ns 105.7 ns 106.1 ns
for (const _ of Option.none())                88.5 ns    11,300,000 ( 85.3 ns … 101.4 ns)  88.7 ns  96.1 ns  98.6 ns
[...Option.some(value)]                      150.1 ns     6,664,000 (143.4 ns … 160.5 ns) 152.7 ns 157.8 ns 158.5 ns
[...Option.none()]                           118.5 ns     8,436,000 (113.7 ns … 137.3 ns) 121.1 ns 131.8 ns 133.3 ns
Array.from(Option.some(value))               246.5 ns     4,057,000 (235.9 ns … 253.9 ns) 249.5 ns 252.7 ns 252.7 ns
Array.from(Option.none())                    170.6 ns     5,861,000 (164.0 ns … 184.1 ns) 173.0 ns 181.5 ns 183.7 ns
Option({ some: true, value })                  3.8 ns   260,800,000 (  3.7 ns …   8.3 ns)   3.8 ns   4.3 ns   4.9 ns
Option({ some: false })                        3.8 ns   265,200,000 (  3.8 ns …   4.7 ns)   3.8 ns   3.8 ns   3.8 ns
Option.some(value).toResult()                  6.8 ns   147,300,000 (  6.3 ns …  13.9 ns)   6.6 ns  12.1 ns  12.3 ns
Option.none().toResult()                       2.0 µs       506,600 (  2.0 µs …   2.0 µs)   2.0 µs   2.0 µs   2.0 µs
Option.some(value).toResult(error)             6.6 ns   151,700,000 (  6.2 ns …  13.3 ns)   6.4 ns  11.6 ns  11.8 ns
Option.none().toResult(error)                  6.5 ns   154,900,000 (  6.0 ns …  13.1 ns)   6.3 ns  11.1 ns  11.2 ns


file:///core.js/result_bench.ts

benchmark                            time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------------ ----------------------------- --------------------- --------------------------
Result.ok(value)                              4.1 ns   243,500,000 (  4.1 ns …   8.9 ns)   4.1 ns   4.7 ns   5.3 ns
Result.err(error)                             4.2 ns   238,000,000 (  4.0 ns …   9.7 ns)   4.2 ns   5.4 ns   5.8 ns
for (const v of Result.ok(value))            98.4 ns    10,160,000 ( 92.7 ns … 109.1 ns) 100.5 ns 105.0 ns 105.4 ns
for (const e of Result.err(error))           88.2 ns    11,330,000 ( 85.2 ns … 102.0 ns)  89.8 ns  97.4 ns  99.0 ns
[...Result.ok(value)]                       148.6 ns     6,731,000 (143.6 ns … 164.6 ns) 150.3 ns 159.5 ns 164.6 ns
[...Result.err(error)]                      117.9 ns     8,482,000 (112.0 ns … 130.0 ns) 120.3 ns 126.7 ns 128.2 ns
Array.from(Result.ok(value))                242.4 ns     4,125,000 (237.5 ns … 251.5 ns) 244.5 ns 250.5 ns 251.3 ns
Array.from(Result.err(error))               169.0 ns     5,919,000 (164.5 ns … 177.7 ns) 172.1 ns 177.3 ns 177.6 ns
Result({ ok: true, value })                   3.8 ns   261,200,000 (  3.8 ns …   8.2 ns)   3.8 ns   4.2 ns   4.7 ns
Result({ ok: false, error })                  3.9 ns   254,300,000 (  3.9 ns …   9.0 ns)   3.9 ns   4.3 ns   4.4 ns
Result.ok(value).toOption()                   6.6 ns   152,300,000 (  6.2 ns …  17.0 ns)   6.3 ns  11.1 ns  11.3 ns
Result.err(error).toOption()                  6.5 ns   153,000,000 (  6.2 ns …  13.3 ns)   6.3 ns  11.3 ns  11.7 ns
```
