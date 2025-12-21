# core.js

My favorite types.

![CI](https://github.com/a-skua/core.js/workflows/Publish/badge.svg)

## Installation

```sh
npx jsr add @askua/core
```

Published to [JSR](https://jsr.io/@askua/core)

## Usage

```ts
import { Brand, Option, Result } from "@askua/core";

const PassedNumber = Brand<number, "Passed">;

const getNumber = () =>
  Option.some(Math.random())
    .map((n) => n * 100)
    .filter((n) => n >= 50)
    .map((n) => PassedNumber(n));

const option = await Option
  .lazy(Option.and(
    getNumber,
    getNumber,
    getNumber,
  ))
  .map((n) => n.reduce((acc, n) => acc + n, 0))
  .or(() => Option.some(0))
  .map((n) => n.toFixed(2))
  .map((sum) => ({ sum }))
  .eval();

console.log(option.unwrap()); // { sum: "0.00" }

const result = await Result
  .lazy(Result.or(
    () => Result.fromOption(getNumber()),
    () => Result.fromOption(getNumber()),
    () => Result.fromOption(getNumber()),
  ))
  .or((err) => {
    console.error(`${err}`); // Error: None
    return Result.ok(PassedNumber(0));
  })
  .map((n) => n.toFixed(2))
  .eval();

console.log(result.unwrap()); // 0.00
```

## Benchmark

```plain
    CPU | Apple M2
Runtime | Deno 2.5.4 (aarch64-apple-darwin)

file:///core.js/bench/option_bench.ts

| benchmark                                 | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| ----------------------------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |
| Option({ some: true, value })             |          4.2 ns |   238,800,000 | (  4.2 ns …   8.6 ns) |   4.2 ns |   4.7 ns |   5.1 ns |
| Option({ some: false })                   |          4.1 ns |   245,700,000 | (  3.9 ns …   6.9 ns) |   4.1 ns |   4.6 ns |   4.8 ns |
| some(1)                                   |          3.9 ns |   254,700,000 | (  3.9 ns …   6.4 ns) |   3.9 ns |   4.4 ns |   4.6 ns |
| none()                                    |          4.0 ns |   252,800,000 | (  3.9 ns …   8.9 ns) |   3.9 ns |   4.5 ns |   4.8 ns |
| Option.fromNullable(null)                 |          4.5 ns |   220,000,000 | (  4.5 ns …   7.4 ns) |   4.5 ns |   5.0 ns |   5.3 ns |
| Option.fromNullable(undefined)            |          4.5 ns |   220,400,000 | (  4.5 ns …   6.8 ns) |   4.5 ns |   5.0 ns |   5.3 ns |
| Option.fromNullable(1)                    |          4.6 ns |   218,400,000 | (  4.5 ns …   6.8 ns) |   4.6 ns |   5.1 ns |   5.4 ns |
| some(1).and((n) => some(n + 1))           |          4.0 ns |   248,500,000 | (  3.9 ns …   6.5 ns) |   4.0 ns |   4.6 ns |   4.8 ns |
| none().and((n) => some(n + 1))            |          4.0 ns |   252,100,000 | (  3.9 ns …   7.0 ns) |   4.0 ns |   4.5 ns |   4.7 ns |
| some(1).or(() => some(0))                 |          4.0 ns |   250,100,000 | (  3.9 ns …  23.5 ns) |   4.0 ns |   4.9 ns |   5.1 ns |
| none().or(() => some(0))                  |          7.1 ns |   140,200,000 | (  6.5 ns …  12.1 ns) |   6.9 ns |   9.7 ns |   9.9 ns |
| some(1).map((n) => n + 1)                 |          4.0 ns |   249,200,000 | (  3.9 ns …   9.4 ns) |   4.0 ns |   4.8 ns |   5.1 ns |
| none().map((n) => n + 1)                  |          4.0 ns |   250,400,000 | (  3.9 ns …   6.3 ns) |   4.0 ns |   4.6 ns |   4.8 ns |
| some(1).filter((n) => n > 0)              |          4.0 ns |   251,600,000 | (  3.9 ns …  12.2 ns) |   4.0 ns |   4.6 ns |   4.8 ns |
| some(0).filter((n) => n > 0)              |          5.7 ns |   175,200,000 | (  5.4 ns …  11.1 ns) |   5.5 ns |   7.8 ns |   8.0 ns |
| none().filter((n) => n > 0)               |          4.0 ns |   251,400,000 | (  3.9 ns …   6.8 ns) |   4.0 ns |   4.4 ns |   4.7 ns |
| some(1).unwrap()                          |          4.0 ns |   250,800,000 | (  4.0 ns …   7.6 ns) |   4.0 ns |   4.4 ns |   4.6 ns |
| some(1).unwrap(() => 0)                   |          4.0 ns |   247,800,000 | (  3.9 ns …   6.9 ns) |   4.0 ns |   4.5 ns |   4.8 ns |
| none().unwrap(() => 0)                    |          4.0 ns |   251,800,000 | (  3.9 ns …   6.1 ns) |   4.0 ns |   4.3 ns |   4.5 ns |
| [...some(1)]                              |        141.7 ns |     7,059,000 | (140.4 ns … 148.0 ns) | 141.9 ns | 146.1 ns | 147.1 ns |
| [...none()]                               |        112.0 ns |     8,929,000 | (109.9 ns … 116.0 ns) | 113.0 ns | 114.7 ns | 115.6 ns |
| some(1).lazy().map((n) => n + 1).eval()   |        127.8 ns |     7,827,000 | (123.3 ns … 180.8 ns) | 126.2 ns | 171.6 ns | 178.1 ns |
| none().lazy().map((n) => n + 1).eval()    |        125.7 ns |     7,956,000 | (122.6 ns … 172.6 ns) | 125.2 ns | 140.1 ns | 157.4 ns |
| Option.and(...)                           |        246.5 ns |     4,057,000 | (244.3 ns … 251.3 ns) | 247.2 ns | 249.5 ns | 249.7 ns |
| Option.or(...)                            |        232.9 ns |     4,293,000 | (230.8 ns … 241.9 ns) | 233.3 ns | 238.6 ns | 238.7 ns |
| Option.lazy()...eval()                    |        477.9 ns |     2,093,000 | (474.2 ns … 580.2 ns) | 477.7 ns | 483.9 ns | 580.2 ns |
| for (const v of Some(1))                  |         99.0 ns |    10,100,000 | ( 96.2 ns … 104.7 ns) |  99.0 ns | 102.9 ns | 104.5 ns |
| for (const _ of None)                     |         88.2 ns |    11,330,000 | ( 86.8 ns …  92.2 ns) |  89.4 ns |  90.6 ns |  91.0 ns |
| Array.from(Some(1))                       |        183.6 ns |     5,447,000 | (177.4 ns … 229.2 ns) | 184.5 ns | 211.0 ns | 214.1 ns |
| Array.from(None)                          |        190.3 ns |     5,255,000 | (187.9 ns … 199.1 ns) | 191.0 ns | 195.8 ns | 196.6 ns |
| Option.and(...[len=1000])                 |         26.8 µs |        37,280 | ( 26.3 µs …  42.1 µs) |  26.8 µs |  30.1 µs |  31.5 µs |
| Option.or(...[len=1000])                  |         26.8 µs |        37,360 | ( 24.2 µs … 116.4 µs) |  25.8 µs |  83.8 µs |  90.2 µs |


file:///core.js/bench/result_bench.ts

| benchmark                                     | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| --------------------------------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |
| Result({ ok: true, value })                   |          4.1 ns |   241,200,000 | (  4.1 ns …   8.7 ns) |   4.1 ns |   4.7 ns |   5.0 ns |
| Result({ ok: false, error })                  |          4.2 ns |   237,800,000 | (  4.2 ns …   6.9 ns) |   4.2 ns |   4.7 ns |   5.0 ns |
| ok(1)                                         |          3.9 ns |   257,300,000 | (  3.9 ns …   6.9 ns) |   3.9 ns |   4.3 ns |   4.6 ns |
| err(0)                                        |          4.0 ns |   251,000,000 | (  3.9 ns …   9.3 ns) |   4.0 ns |   4.5 ns |   5.0 ns |
| Result.try(fn: () => number)                  |          4.8 ns |   206,900,000 | (  4.7 ns …  21.8 ns) |   4.8 ns |   6.1 ns |   6.9 ns |
| Result.try(fn: () => Promise<number>)         |        151.3 ns |     6,611,000 | (146.6 ns … 206.4 ns) | 150.4 ns | 202.3 ns | 202.8 ns |
| Result.try(fn: () => throw number)            |          2.0 µs |       504,000 | (  2.0 µs …   2.0 µs) |   2.0 µs |   2.0 µs |   2.0 µs |
| Result.try(fn: () => Promise<throw number>)   |        401.1 ns |     2,493,000 | (394.5 ns … 481.0 ns) | 406.4 ns | 450.5 ns | 481.0 ns |
| ok(1).and((n) => ok(n + 1))                   |          4.1 ns |   244,200,000 | (  4.0 ns …  33.6 ns) |   4.0 ns |   5.7 ns |   9.3 ns |
| err(0).and((n) => ok(n + 1))                  |          4.0 ns |   247,300,000 | (  4.0 ns …  17.0 ns) |   4.0 ns |   4.9 ns |   5.2 ns |
| ok(1).or(() => ok(0))                         |          4.0 ns |   247,300,000 | (  4.0 ns …   7.6 ns) |   4.0 ns |   4.4 ns |   4.6 ns |
| err(0).or(() => ok(0))                        |          7.3 ns |   136,900,000 | (  6.6 ns …  14.6 ns) |   7.4 ns |   9.8 ns |  10.1 ns |
| ok(1).map((n) => n + 1)                       |          4.1 ns |   246,000,000 | (  4.0 ns …  13.8 ns) |   4.0 ns |   4.9 ns |   5.3 ns |
| err(0).map((n) => n + 1)                      |          4.0 ns |   247,600,000 | (  4.0 ns …  12.3 ns) |   4.0 ns |   4.6 ns |   4.9 ns |
| ok(1).filter((n) => n > 0)                    |          4.0 ns |   247,000,000 | (  4.0 ns …   7.8 ns) |   4.0 ns |   4.5 ns |   4.8 ns |
| ok(0).filter((n) => n > 0)                    |          3.6 µs |       278,100 | (  3.4 µs …   3.6 µs) |   3.6 µs |   3.6 µs |   3.6 µs |
| ok(0).filter((n) => n > 0, () => 0)           |         10.1 ns |    99,330,000 | (  9.4 ns …  13.8 ns) |  10.1 ns |  12.8 ns |  12.9 ns |
| err(0).filter((n) => n + 0)                   |          4.0 ns |   250,200,000 | (  4.0 ns …   7.7 ns) |   4.0 ns |   4.5 ns |   4.7 ns |
| ok(1).unwrap()                                |          4.0 ns |   248,900,000 | (  4.0 ns …   7.4 ns) |   4.0 ns |   4.3 ns |   4.5 ns |
| ok(1).unwrap(() => 0)                         |          4.0 ns |   250,200,000 | (  4.0 ns …   5.7 ns) |   4.0 ns |   4.3 ns |   4.5 ns |
| err(1).unwrap(() => 0)                        |          4.1 ns |   246,600,000 | (  4.0 ns …   6.3 ns) |   4.0 ns |   4.4 ns |   4.6 ns |
| [...ok(1)]                                    |        141.8 ns |     7,051,000 | (140.5 ns … 147.8 ns) | 142.2 ns | 145.2 ns | 146.1 ns |
| Result.and(...)                               |        244.4 ns |     4,091,000 | (242.0 ns … 248.7 ns) | 245.1 ns | 247.7 ns | 247.7 ns |
| Result.or(...)                                |        234.0 ns |     4,274,000 | (232.0 ns … 237.0 ns) | 234.7 ns | 236.1 ns | 236.3 ns |
| Result.fromOption(Some(0))                    |          5.1 ns |   197,500,000 | (  5.0 ns …   9.9 ns) |   5.0 ns |   5.4 ns |   5.6 ns |
| Result.fromOption(Some(0), () => string)      |          5.3 ns |   189,800,000 | (  5.2 ns …  11.2 ns) |   5.3 ns |   5.6 ns |   5.8 ns |
| Result.fromOption(None)                       |          3.0 µs |       331,000 | (  3.0 µs …   3.1 µs) |   3.0 µs |   3.1 µs |   3.1 µs |
| Result.fromOption(None, () => string)         |          6.5 ns |   154,900,000 | (  6.1 ns …  58.5 ns) |   6.2 ns |   8.9 ns |   9.5 ns |
| Result.lazy()...eval()                        |        314.4 ns |     3,181,000 | (307.8 ns … 399.7 ns) | 315.3 ns | 389.5 ns | 399.7 ns |
| for (const v of Ok(1))                        |         99.4 ns |    10,060,000 | ( 97.0 ns … 103.5 ns) | 100.6 ns | 102.8 ns | 102.9 ns |
| Array.from(Ok(1))                             |        183.3 ns |     5,456,000 | (177.9 ns … 314.0 ns) | 185.0 ns | 202.9 ns | 206.8 ns |
| Result.and(...[len=1000])                     |         27.2 µs |        36,780 | ( 26.4 µs …  52.5 µs) |  27.2 µs |  32.4 µs |  36.5 µs |
| Result.or(...[len=1000])                      |         26.3 µs |        38,000 | ( 25.0 µs … 106.8 µs) |  25.7 µs |  42.2 µs |  90.8 µs |
```
