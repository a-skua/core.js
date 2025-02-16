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
Option.some(value)                             4.1 ns   245,500,000 (  3.9 ns …   8.9 ns)   4.0 ns   5.0 ns   5.3 ns
Option.none()                                  4.2 ns   236,800,000 (  4.1 ns …   8.3 ns)   4.2 ns   5.0 ns   5.3 ns
for (const v of Option.some(value))          100.2 ns     9,984,000 ( 93.6 ns … 114.8 ns) 102.4 ns 109.8 ns 111.4 ns
for (const _ of Option.none())                88.4 ns    11,310,000 ( 85.3 ns … 104.7 ns)  90.7 ns  99.4 ns 101.8 ns
[...Option.some(value)]                      149.2 ns     6,701,000 (143.9 ns … 162.6 ns) 151.1 ns 161.3 ns 162.5 ns
[...Option.none()]                           118.1 ns     8,470,000 (110.3 ns … 346.2 ns) 119.7 ns 130.1 ns 174.0 ns
Array.from(Option.some(value))               249.9 ns     4,001,000 (235.4 ns … 281.7 ns) 252.9 ns 269.5 ns 271.0 ns
Array.from(Option.none())                    170.4 ns     5,867,000 (161.8 ns … 186.6 ns) 173.0 ns 180.2 ns 185.1 ns
Option({ some: true, value })                  4.4 ns   228,500,000 (  4.2 ns …  15.3 ns)   4.3 ns   5.6 ns   5.8 ns
Option({ some: false })                        4.3 ns   234,300,000 (  4.1 ns …   9.2 ns)   4.3 ns   4.7 ns   5.0 ns
Option.some(value).toResult()                  6.6 ns   151,300,000 (  6.1 ns …  19.1 ns)   6.4 ns  12.0 ns  12.5 ns
Option.none().toResult()                       2.0 µs       494,900 (  2.0 µs …   3.4 µs)   2.0 µs   3.4 µs   3.4 µs
Option.some(value).toResult(error)             6.6 ns   151,600,000 (  6.0 ns …  16.3 ns)   6.4 ns  12.0 ns  12.6 ns
Option.none().toResult(error)                  6.4 ns   157,000,000 (  6.0 ns …  21.2 ns)   6.2 ns  11.9 ns  12.3 ns
Option.some(value).bind(fn)                    4.2 ns   235,900,000 (  4.2 ns …   7.5 ns)   4.2 ns   4.7 ns   5.0 ns
Option.none().bind(fn)                         4.2 ns   238,300,000 (  4.2 ns …   7.5 ns)   4.2 ns   4.8 ns   5.0 ns
Option.some(value).map(fn)                     4.2 ns   239,100,000 (  4.1 ns …  11.6 ns)   4.2 ns   4.9 ns   5.1 ns
Option.none().map(fn)                          4.2 ns   235,900,000 (  4.2 ns …  14.3 ns)   4.2 ns   5.0 ns   5.4 ns
Option.some(value).unwrap()                    4.2 ns   238,000,000 (  4.1 ns …   8.1 ns)   4.2 ns   4.8 ns   5.1 ns
Option.none().unwrapOr(0)                      4.3 ns   232,300,000 (  4.3 ns …   7.7 ns)   4.3 ns   4.7 ns   5.1 ns


file:///core.js/result_bench.ts

benchmark                            time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------------ ----------------------------- --------------------- --------------------------
Result.ok(value)                              4.1 ns   245,400,000 (  4.0 ns …   9.7 ns)   4.1 ns   4.7 ns   4.8 ns
Result.err(error)                             4.2 ns   239,200,000 (  4.1 ns …  11.7 ns)   4.2 ns   5.0 ns   5.4 ns
for (const v of Result.ok(value))            99.0 ns    10,100,000 ( 95.1 ns … 115.6 ns) 101.1 ns 107.5 ns 112.4 ns
for (const e of Result.err(error))           88.2 ns    11,340,000 ( 85.6 ns … 101.7 ns)  89.8 ns  95.2 ns 100.7 ns
[...Result.ok(value)]                       149.6 ns     6,686,000 (145.0 ns … 164.5 ns) 151.6 ns 154.3 ns 155.3 ns
[...Result.err(error)]                      119.7 ns     8,355,000 (114.1 ns … 448.6 ns) 121.0 ns 138.5 ns 146.4 ns
Array.from(Result.ok(value))                242.7 ns     4,121,000 (238.2 ns … 261.0 ns) 244.7 ns 251.2 ns 252.0 ns
Array.from(Result.err(error))               171.8 ns     5,819,000 (166.1 ns … 185.6 ns) 173.8 ns 185.1 ns 185.6 ns
Result({ ok: true, value })                   4.3 ns   234,600,000 (  4.2 ns …  16.2 ns)   4.2 ns   5.1 ns   5.5 ns
Result({ ok: false, error })                  4.5 ns   224,300,000 (  4.4 ns …  24.1 ns)   4.4 ns   5.3 ns   5.7 ns
Result.ok(value).toOption()                   6.6 ns   152,300,000 (  6.1 ns …  22.7 ns)   6.3 ns  11.3 ns  11.9 ns
Result.err(error).toOption()                  6.6 ns   152,400,000 (  6.2 ns …  13.6 ns)   6.3 ns  11.9 ns  12.1 ns
Result.ok(value).bind(fn)                     4.2 ns   239,500,000 (  4.1 ns …   7.9 ns)   4.2 ns   4.8 ns   5.0 ns
Result.err(err).bind(fn)                      4.2 ns   239,000,000 (  4.1 ns …   7.7 ns)   4.2 ns   4.9 ns   5.2 ns
Result.ok(value).map(fn)                      4.2 ns   239,900,000 (  4.1 ns …   8.0 ns)   4.2 ns   4.6 ns   4.9 ns
Result.err(err).map(fn)                       4.1 ns   241,200,000 (  4.1 ns …   8.1 ns)   4.1 ns   4.7 ns   5.0 ns
Result.ok(value).unwrap()                     4.2 ns   236,800,000 (  4.2 ns …   7.5 ns)   4.2 ns   5.0 ns   5.2 ns
Result.err(err).unwrapOr(0)                   4.2 ns   238,100,000 (  4.2 ns …   6.6 ns)   4.2 ns   4.9 ns   5.1 ns
```
