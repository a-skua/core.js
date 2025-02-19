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
Option.some(value)                             4.1 ns   245,400,000 (  4.0 ns …   8.9 ns)   4.1 ns   4.6 ns   4.8 ns
Option.none()                                  4.2 ns   240,200,000 (  4.1 ns …   6.4 ns)   4.2 ns   4.5 ns   4.9 ns
for (const v of Option.some(value))           99.5 ns    10,050,000 ( 95.4 ns … 107.0 ns) 102.2 ns 104.5 ns 106.5 ns
for (const _ of Option.none())                87.2 ns    11,460,000 ( 84.4 ns … 104.0 ns)  87.9 ns  93.5 ns  99.6 ns
[...Option.some(value)]                      139.2 ns     7,182,000 (135.3 ns … 144.2 ns) 141.2 ns 143.3 ns 143.9 ns
[...Option.none()]                           110.4 ns     9,059,000 (105.5 ns … 117.5 ns) 113.7 ns 116.0 ns 116.3 ns
Array.from(Option.some(value))               240.7 ns     4,155,000 (233.0 ns … 259.1 ns) 242.9 ns 245.2 ns 248.1 ns
Array.from(Option.none())                    164.5 ns     6,079,000 (162.1 ns … 173.0 ns) 167.1 ns 169.2 ns 169.5 ns
Option({ some: true, value })                  4.2 ns   236,200,000 (  4.2 ns …   5.7 ns)   4.2 ns   4.6 ns   4.8 ns
Option({ some: false })                        4.3 ns   235,000,000 (  4.2 ns …   6.4 ns)   4.2 ns   4.6 ns   5.0 ns
Option.some(value).toResult()                  6.6 ns   151,300,000 (  6.3 ns …  14.7 ns)   6.4 ns  11.4 ns  11.6 ns
Option.none().toResult()                       1.9 µs       513,700 (  1.9 µs …   2.0 µs)   2.0 µs   2.0 µs   2.0 µs
Option.some(value).toResult(error)             6.6 ns   152,100,000 (  6.2 ns …  13.1 ns)   6.4 ns  11.2 ns  11.5 ns
Option.none().toResult(error)                  6.3 ns   158,800,000 (  6.0 ns …  14.1 ns)   6.1 ns  11.0 ns  11.2 ns
Option.some(value).andThen(fn)                 4.1 ns   241,500,000 (  4.1 ns …   6.3 ns)   4.1 ns   4.5 ns   4.7 ns
Option.none().andThen(fn)                      4.2 ns   239,800,000 (  4.1 ns …   5.8 ns)   4.2 ns   4.5 ns   4.9 ns
Option.some(value).and(other)                  4.2 ns   238,700,000 (  4.2 ns …   5.7 ns)   4.2 ns   4.5 ns   4.8 ns
Option.none().and(other)                       4.6 ns   219,600,000 (  4.5 ns …   7.3 ns)   4.5 ns   4.9 ns   5.3 ns
Option.some(value).orElse(fn)                  4.1 ns   241,200,000 (  4.1 ns …   8.3 ns)   4.1 ns   4.5 ns   4.9 ns
Option.none().orElse(fn)                       7.6 ns   131,500,000 (  6.9 ns …  15.4 ns)   7.2 ns  12.7 ns  13.0 ns
Option.some(value).or(other)                   4.2 ns   238,500,000 (  4.2 ns …   6.8 ns)   4.2 ns   4.5 ns   4.8 ns
Option.none().or(other)                        4.5 ns   221,000,000 (  4.5 ns …   8.1 ns)   4.5 ns   5.0 ns   5.3 ns
Option.some(value).map(fn)                     4.2 ns   240,800,000 (  4.1 ns …   6.6 ns)   4.1 ns   4.5 ns   4.8 ns
Option.none().map(fn)                          4.3 ns   233,900,000 (  4.2 ns …   9.1 ns)   4.2 ns   5.6 ns   5.6 ns
Option.some(value).unwrap()                    4.1 ns   242,900,000 (  4.1 ns …   5.7 ns)   4.1 ns   4.4 ns   4.6 ns
Option.none().unwrapOr(0)                      4.2 ns   239,300,000 (  4.2 ns …   5.8 ns)   4.2 ns   4.5 ns   4.7 ns
Option.andThen(...sync)                      266.0 ns     3,759,000 (260.3 ns … 325.1 ns) 264.9 ns 323.9 ns 325.1 ns
Option.andThen(...async)                     274.8 ns     3,639,000 (270.0 ns … 329.5 ns) 274.9 ns 317.3 ns 329.5 ns
Option.orElse(...sync)                       261.5 ns     3,824,000 (258.1 ns … 265.8 ns) 262.6 ns 265.7 ns 265.7 ns
Option.orElse(...async)                      265.1 ns     3,772,000 (262.5 ns … 271.0 ns) 265.7 ns 270.2 ns 271.0 ns
Option.andThen(...async[len=1000])            57.4 µs        17,410 ( 54.5 µs … 405.6 µs)  55.4 µs 112.4 µs 116.2 µs
Option.orElse(...async[len=1000])             52.3 µs        19,120 ( 50.3 µs … 141.2 µs)  51.0 µs 121.9 µs 124.6 µs


file:///core.js/result_bench.ts

benchmark                            time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------------ ----------------------------- --------------------- --------------------------
Result.ok(value)                              4.1 ns   244,300,000 (  4.1 ns …   9.3 ns)   4.1 ns   4.6 ns   4.8 ns
Result.err(error)                             4.1 ns   243,500,000 (  4.1 ns …   6.7 ns)   4.1 ns   4.4 ns   4.7 ns
for (const v of Result.ok(value))           100.0 ns    10,000,000 ( 96.0 ns … 109.8 ns) 102.8 ns 106.8 ns 107.1 ns
for (const e of Result.err(error))           87.8 ns    11,380,000 ( 85.5 ns … 101.3 ns)  88.3 ns  96.3 ns  98.4 ns
[...Result.ok(value)]                       139.4 ns     7,176,000 (135.4 ns … 146.2 ns) 141.3 ns 144.1 ns 145.0 ns
[...Result.err(error)]                      110.5 ns     9,050,000 (106.9 ns … 123.6 ns) 113.4 ns 118.0 ns 119.0 ns
Array.from(Result.ok(value))                240.0 ns     4,167,000 (236.0 ns … 247.6 ns) 242.4 ns 246.5 ns 246.7 ns
Array.from(Result.err(error))               165.0 ns     6,059,000 (161.8 ns … 171.1 ns) 167.6 ns 170.4 ns 170.8 ns
Result({ ok: true, value })                   4.2 ns   236,000,000 (  4.2 ns …   7.6 ns)   4.2 ns   4.6 ns   5.0 ns
Result({ ok: false, error })                  4.4 ns   225,100,000 (  4.4 ns …   6.2 ns)   4.4 ns   4.8 ns   5.2 ns
Result.ok(value).toOption()                   6.5 ns   153,100,000 (  6.2 ns …  14.8 ns)   6.3 ns  11.1 ns  11.4 ns
Result.err(error).toOption()                  6.6 ns   151,800,000 (  6.2 ns …  16.4 ns)   6.3 ns  12.2 ns  12.4 ns
Result.ok(value).andThen(fn)                  4.2 ns   238,300,000 (  4.2 ns …   5.9 ns)   4.2 ns   4.5 ns   4.8 ns
Result.err(err).andThen(fn)                   4.2 ns   240,200,000 (  4.1 ns …   7.8 ns)   4.2 ns   4.5 ns   4.7 ns
Result.ok(value).and(other)                   4.1 ns   242,400,000 (  4.1 ns …   6.1 ns)   4.1 ns   4.5 ns   4.7 ns
Result.err(err).and(other)                    4.5 ns   221,700,000 (  4.5 ns …   7.2 ns)   4.5 ns   4.8 ns   5.0 ns
Result.ok(value).orElse(fn)                   4.1 ns   241,800,000 (  4.1 ns …   6.6 ns)   4.1 ns   4.5 ns   4.7 ns
Result.err(err).orElse(fn)                    7.6 ns   131,000,000 (  6.9 ns …  13.9 ns)   7.2 ns  12.2 ns  12.5 ns
Result.ok(value).or(other)                    4.2 ns   240,700,000 (  4.1 ns …   7.0 ns)   4.1 ns   4.5 ns   4.8 ns
Result.err(err).or(other)                     4.5 ns   220,900,000 (  4.5 ns …   6.6 ns)   4.5 ns   4.9 ns   5.1 ns
Result.ok(value).map(fn)                      4.2 ns   238,600,000 (  4.2 ns …   6.5 ns)   4.2 ns   4.5 ns   4.9 ns
Result.err(err).map(fn)                       4.1 ns   241,000,000 (  4.1 ns …   6.0 ns)   4.1 ns   4.5 ns   4.7 ns
Result.ok(value).unwrap()                     4.2 ns   240,000,000 (  4.1 ns …   6.8 ns)   4.2 ns   4.7 ns   4.9 ns
Result.err(err).unwrapOr(0)                   4.2 ns   240,900,000 (  4.1 ns …   7.4 ns)   4.1 ns   4.5 ns   4.9 ns
Result.andThen(...sync)                     259.3 ns     3,857,000 (253.5 ns … 323.3 ns) 258.5 ns 306.6 ns 316.3 ns
Result.andThen(...async)                    263.0 ns     3,802,000 (259.2 ns … 310.4 ns) 263.3 ns 280.4 ns 308.3 ns
Result.orElse(...sync)                      150.1 ns     6,661,000 (147.8 ns … 155.2 ns) 152.0 ns 154.3 ns 154.9 ns
Result.orElse(...async)                     150.5 ns     6,646,000 (146.2 ns … 157.5 ns) 152.3 ns 154.2 ns 154.8 ns
Result.andThen(...async[len=1000])           56.8 µs        17,620 ( 53.8 µs … 394.3 µs)  54.8 µs 112.0 µs 115.1 µs
Result.orElse(...async[len=1000])            52.8 µs        18,940 ( 50.8 µs … 132.6 µs)  51.6 µs 117.8 µs 120.8 µs
```
