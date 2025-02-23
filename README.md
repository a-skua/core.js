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

const getNumber = () =>
  Option.some(Math.random())
    .map((n) => Math.floor(n * 100))
    .andThen((n) => n >= 50 ? Option.some(n) : Option.none<number>());

const option = await Option
  .lazy(Option.andThen(
    getNumber,
    getNumber,
    getNumber,
  ))
  .or(Option.some([0, 0, 0] as const))
  .map(([a, b, c]) => [a.toFixed(2), b.toFixed(2), c.toFixed(2)] as const)
  .map((n) => n.join(", "))
  .eval();

console.log(option.unwrap()); // 0.00, 0.00, 0.00

const result = await Result
  .lazy(Result.orElse(
    () => getNumber().toResult(),
    () => getNumber().toResult(),
    () => getNumber().toResult(),
  ))
  .orElse((err) => {
    console.error(`${err}`); // Error: None
    return Result.ok<number>(0);
  })
  .map((n) => n.toFixed(2))
  .eval();

console.log(result.unwrap()); // 0.00
```

## Benchmark

```plain
    CPU | Apple M2
Runtime | Deno 2.1.9 (aarch64-apple-darwin)

file:///core.js/option_bench.ts

benchmark                             time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------------- ----------------------------- --------------------- --------------------------
Option.some(value)                             4.1 ns   246,400,000 (  3.9 ns …   9.3 ns)   4.0 ns   4.6 ns   4.8 ns
Option.none()                                  4.1 ns   241,400,000 (  4.0 ns …   6.9 ns)   4.1 ns   4.5 ns   4.7 ns
for (const v of Option.some(value))           99.5 ns    10,050,000 ( 92.8 ns … 108.5 ns) 102.5 ns 105.9 ns 106.8 ns
for (const _ of Option.none())                87.7 ns    11,410,000 ( 84.5 ns …  97.7 ns)  88.5 ns  94.4 ns  95.6 ns
[...Option.some(value)]                      140.1 ns     7,137,000 (135.7 ns … 146.2 ns) 142.0 ns 144.6 ns 145.7 ns
[...Option.none()]                           111.1 ns     8,997,000 (107.2 ns … 122.7 ns) 113.7 ns 121.8 ns 122.2 ns
Array.from(Option.some(value))               243.9 ns     4,100,000 (236.7 ns … 258.8 ns) 246.1 ns 256.3 ns 256.6 ns
Array.from(Option.none())                    166.7 ns     6,000,000 (160.5 ns … 181.0 ns) 169.5 ns 174.9 ns 178.9 ns
Option({ some: true, value })                  4.2 ns   235,900,000 (  4.1 ns …   9.1 ns)   4.2 ns   5.2 ns   5.5 ns
Option({ some: false })                        4.3 ns   231,400,000 (  4.3 ns …   6.8 ns)   4.3 ns   5.0 ns   5.3 ns
Option.some(value).toResult()                  6.6 ns   150,700,000 (  6.2 ns …  14.2 ns)   6.5 ns  11.2 ns  11.4 ns
Option.none().toResult()                       2.0 µs       511,800 (  1.9 µs …   2.0 µs)   2.0 µs   2.0 µs   2.0 µs
Option.some(value).toResult(error)             6.7 ns   150,100,000 (  6.2 ns …  15.0 ns)   6.5 ns  11.6 ns  12.0 ns
Option.none().toResult(error)                  6.4 ns   156,800,000 (  5.9 ns …  16.3 ns)   6.2 ns  12.0 ns  12.4 ns
Option.some(value).andThen(fn)                 4.2 ns   240,500,000 (  4.1 ns …   8.4 ns)   4.1 ns   5.0 ns   5.3 ns
Option.none().andThen(fn)                      4.3 ns   234,500,000 (  4.0 ns …  92.5 ns)   4.2 ns   5.6 ns   6.4 ns
Option.some(value).and(other)                  4.1 ns   241,000,000 (  4.0 ns …   9.7 ns)   4.1 ns   4.8 ns   5.0 ns
Option.none().and(other)                       4.5 ns   220,900,000 (  4.3 ns …  15.3 ns)   4.5 ns   5.5 ns   6.0 ns
Option.some(value).orElse(fn)                  4.3 ns   235,200,000 (  4.1 ns …  13.4 ns)   4.2 ns   5.2 ns   5.6 ns
Option.none().orElse(fn)                       7.5 ns   132,900,000 (  6.6 ns …  26.0 ns)   7.1 ns  12.7 ns  13.2 ns
Option.some(value).or(other)                   4.2 ns   236,900,000 (  4.0 ns … 103.3 ns)   4.1 ns   5.4 ns   5.8 ns
Option.none().or(other)                        4.5 ns   220,000,000 (  4.4 ns …   7.6 ns)   4.5 ns   5.5 ns   5.7 ns
Option.some(value).map(fn)                     4.1 ns   241,200,000 (  4.1 ns …   7.9 ns)   4.1 ns   4.7 ns   4.9 ns
Option.none().map(fn)                          4.2 ns   240,800,000 (  4.1 ns …   7.2 ns)   4.1 ns   4.8 ns   5.2 ns
Option.some(value).unwrap()                    4.2 ns   240,600,000 (  4.1 ns …   7.3 ns)   4.1 ns   4.5 ns   4.9 ns
Option.none().unwrapOr(0)                      4.2 ns   237,500,000 (  4.2 ns …   6.5 ns)   4.2 ns   4.5 ns   4.7 ns
Option.andThen(...sync)                      266.6 ns     3,752,000 (260.7 ns … 326.2 ns) 265.4 ns 321.1 ns 326.2 ns
Option.andThen(...async)                     273.2 ns     3,661,000 (268.9 ns … 316.8 ns) 273.2 ns 314.4 ns 316.8 ns
Option.orElse(...sync)                       267.7 ns     3,736,000 (263.8 ns … 272.0 ns) 268.9 ns 271.8 ns 272.0 ns
Option.orElse(...async)                      266.6 ns     3,751,000 (263.1 ns … 271.8 ns) 267.4 ns 271.7 ns 271.8 ns
Option.andThen(...async[len=1000])            57.3 µs        17,450 ( 54.2 µs … 447.9 µs)  55.2 µs 113.0 µs 115.3 µs
Option.orElse(...async[len=1000])             51.8 µs        19,310 ( 49.8 µs … 189.5 µs)  50.6 µs 117.1 µs 121.8 µs
Result.lazy().eval()                         316.7 ns     3,157,000 (310.3 ns … 344.1 ns) 317.6 ns 341.2 ns 344.1 ns


file:///core.js/result_bench.ts

benchmark                            time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------------ ----------------------------- --------------------- --------------------------
Result.ok(value)                              4.1 ns   242,700,000 (  4.1 ns …   9.3 ns)   4.1 ns   4.6 ns   4.8 ns
Result.err(error)                             4.1 ns   245,700,000 (  3.9 ns …   7.5 ns)   4.1 ns   4.5 ns   4.8 ns
for (const v of Result.ok(value))           101.0 ns     9,898,000 ( 95.3 ns … 109.2 ns) 103.7 ns 107.8 ns 108.0 ns
for (const e of Result.err(error))           88.9 ns    11,250,000 ( 85.1 ns … 100.3 ns)  89.7 ns  97.3 ns  98.7 ns
[...Result.ok(value)]                       140.3 ns     7,129,000 (135.1 ns … 147.3 ns) 142.7 ns 146.0 ns 147.0 ns
[...Result.err(error)]                      110.7 ns     9,036,000 (107.3 ns … 117.3 ns) 113.1 ns 116.4 ns 116.7 ns
Array.from(Result.ok(value))                242.8 ns     4,119,000 (237.3 ns … 252.3 ns) 245.0 ns 249.3 ns 249.3 ns
Array.from(Result.err(error))               165.0 ns     6,062,000 (161.0 ns … 173.7 ns) 167.2 ns 170.5 ns 170.8 ns
Result({ ok: true, value })                   4.3 ns   234,800,000 (  4.2 ns …   6.5 ns)   4.2 ns   4.6 ns   4.8 ns
Result({ ok: false, error })                  4.4 ns   225,400,000 (  4.4 ns …   8.2 ns)   4.4 ns   4.8 ns   5.0 ns
Result.ok(value).toOption()                   6.6 ns   151,800,000 (  6.2 ns …  14.9 ns)   6.4 ns  11.3 ns  11.5 ns
Result.err(error).toOption()                  6.6 ns   151,400,000 (  6.2 ns …  15.0 ns)   6.4 ns  11.4 ns  11.9 ns
Result.ok(value).andThen(fn)                  4.2 ns   239,700,000 (  4.1 ns …   7.9 ns)   4.2 ns   4.5 ns   4.9 ns
Result.err(err).andThen(fn)                   4.2 ns   239,800,000 (  4.1 ns …   7.7 ns)   4.2 ns   4.5 ns   4.8 ns
Result.ok(value).and(other)                   4.2 ns   240,000,000 (  4.1 ns …   6.3 ns)   4.2 ns   4.5 ns   4.7 ns
Result.err(err).and(other)                    4.5 ns   220,400,000 (  4.5 ns …   7.7 ns)   4.5 ns   4.9 ns   5.2 ns
Result.ok(value).orElse(fn)                   4.2 ns   239,500,000 (  4.2 ns …   6.3 ns)   4.2 ns   4.5 ns   4.9 ns
Result.err(err).orElse(fn)                    7.7 ns   130,000,000 (  6.9 ns …  14.7 ns)   7.3 ns  12.3 ns  12.7 ns
Result.ok(value).or(other)                    4.2 ns   239,500,000 (  4.1 ns …   7.1 ns)   4.2 ns   4.5 ns   4.7 ns
Result.err(err).or(other)                     4.5 ns   221,400,000 (  4.5 ns …   9.5 ns)   4.5 ns   4.8 ns   5.2 ns
Result.ok(value).map(fn)                      4.2 ns   239,500,000 (  4.1 ns …   7.1 ns)   4.2 ns   4.7 ns   5.0 ns
Result.err(err).map(fn)                       4.2 ns   240,200,000 (  4.1 ns …   7.3 ns)   4.1 ns   5.0 ns   5.3 ns
Result.ok(value).unwrap()                     4.2 ns   240,900,000 (  4.1 ns …   7.9 ns)   4.1 ns   5.0 ns   5.3 ns
Result.err(err).unwrapOr(0)                   4.2 ns   239,800,000 (  4.1 ns …   7.2 ns)   4.1 ns   5.1 ns   5.4 ns
Result.andThen(...sync)                     261.1 ns     3,830,000 (252.0 ns … 317.7 ns) 261.5 ns 307.5 ns 316.9 ns
Result.andThen(...async)                    267.5 ns     3,738,000 (257.5 ns … 318.2 ns) 270.2 ns 310.2 ns 318.2 ns
Result.orElse(...sync)                      150.3 ns     6,652,000 (146.2 ns … 168.9 ns) 152.0 ns 159.5 ns 160.3 ns
Result.orElse(...async)                     155.9 ns     6,414,000 (149.4 ns … 178.5 ns) 158.1 ns 162.6 ns 165.8 ns
Result.andThen(...async[len=1000])           58.4 µs        17,110 ( 55.0 µs … 394.0 µs)  56.2 µs 113.8 µs 116.0 µs
Result.orElse(...async[len=1000])            53.2 µs        18,810 ( 50.8 µs … 227.3 µs)  51.6 µs 123.9 µs 127.8 µs
Result.lazy().eval()                        322.1 ns     3,104,000 (316.3 ns … 348.0 ns) 323.7 ns 345.9 ns 348.0 ns
```
