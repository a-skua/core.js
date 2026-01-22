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
import { Option, some } from "@askua/core/option";

const n: Option<number> = { some: true, value: 1 };

const a = Option(n);
const b = a.map((n) => n + 1);
const c = b.filter((n) => n > 2);
const d = c.or(() => some(3));

console.log([...a, ...b, ...c, ...d]); // [1, 2, 3]
```

## Benchmark

```plain
    CPU | Apple M2
Runtime | Deno 2.6.1 (aarch64-apple-darwin)

file:///core.js/bench/option_bench.ts

| benchmark                                 | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| ----------------------------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |
| Option({ some: true, value })             |          4.1 ns |   243,600,000 | (  4.0 ns …   8.7 ns) |   4.1 ns |   4.7 ns |   5.0 ns |
| Option({ some: false })                   |          4.1 ns |   242,200,000 | (  4.1 ns …   6.8 ns) |   4.1 ns |   4.7 ns |   5.0 ns |
| some(1)                                   |          3.9 ns |   257,100,000 | (  3.9 ns …   5.9 ns) |   3.9 ns |   4.4 ns |   4.8 ns |
| none()                                    |          4.0 ns |   251,000,000 | (  3.9 ns …   8.4 ns) |   4.0 ns |   4.5 ns |   4.9 ns |
| Option.fromNullable(null)                 |          4.6 ns |   217,400,000 | (  4.5 ns …   8.6 ns) |   4.6 ns |   5.2 ns |   5.5 ns |
| Option.fromNullable(undefined)            |          4.6 ns |   219,300,000 | (  4.5 ns …   7.9 ns) |   4.5 ns |   5.1 ns |   5.5 ns |
| Option.fromNullable(1)                    |          4.5 ns |   220,300,000 | (  4.5 ns …   6.7 ns) |   4.5 ns |   5.1 ns |   5.4 ns |
| some(1).and((n) => some(n + 1))           |          3.9 ns |   255,600,000 | (  3.9 ns …   6.1 ns) |   3.9 ns |   4.3 ns |   4.6 ns |
| none().and((n) => some(n + 1))            |          3.9 ns |   254,000,000 | (  3.9 ns …   5.5 ns) |   3.9 ns |   4.5 ns |   4.7 ns |
| some(1).or(() => some(0))                 |          3.9 ns |   255,400,000 | (  3.8 ns …   5.9 ns) |   3.9 ns |   4.4 ns |   4.6 ns |
| none().or(() => some(0))                  |          7.0 ns |   142,200,000 | (  6.4 ns …  10.8 ns) |   6.8 ns |   9.3 ns |   9.7 ns |
| some(1).map((n) => n + 1)                 |          3.9 ns |   254,700,000 | (  3.9 ns …   7.8 ns) |   3.9 ns |   4.5 ns |   4.8 ns |
| none().map((n) => n + 1)                  |          4.0 ns |   249,100,000 | (  4.0 ns …   6.0 ns) |   4.0 ns |   4.5 ns |   4.8 ns |
| some(1).filter((n) => n > 0)              |          3.9 ns |   254,300,000 | (  3.9 ns …   5.9 ns) |   3.9 ns |   4.5 ns |   4.7 ns |
| some(0).filter((n) => n > 0)              |          5.7 ns |   176,300,000 | (  5.4 ns …   9.2 ns) |   5.5 ns |   7.7 ns |   7.8 ns |
| none().filter((n) => n > 0)               |          3.9 ns |   254,400,000 | (  3.9 ns …   6.0 ns) |   3.9 ns |   4.4 ns |   4.7 ns |
| some(1).unwrap()                          |          3.9 ns |   256,000,000 | (  3.9 ns …   6.9 ns) |   3.9 ns |   4.1 ns |   4.2 ns |
| some(1).unwrap(() => 0)                   |          3.9 ns |   253,600,000 | (  3.9 ns …   7.6 ns) |   3.9 ns |   4.5 ns |   4.7 ns |
| none().unwrap(() => 0)                    |          3.9 ns |   254,600,000 | (  3.9 ns …   5.9 ns) |   3.9 ns |   4.3 ns |   4.6 ns |
| [...some(1)]                              |        141.4 ns |     7,071,000 | (140.2 ns … 144.9 ns) | 141.7 ns | 144.5 ns | 144.6 ns |
| [...none()]                               |        113.7 ns |     8,795,000 | (111.8 ns … 118.6 ns) | 114.7 ns | 116.3 ns | 117.4 ns |
| some(1).lazy().map((n) => n + 1).eval()   |        128.6 ns |     7,777,000 | (124.2 ns … 187.2 ns) | 126.9 ns | 174.7 ns | 177.0 ns |
| none().lazy().map((n) => n + 1).eval()    |        125.3 ns |     7,981,000 | (121.7 ns … 177.9 ns) | 124.8 ns | 139.6 ns | 155.0 ns |
| await Option.and(...)                     |        247.2 ns |     4,045,000 | (244.8 ns … 250.7 ns) | 248.0 ns | 250.5 ns | 250.6 ns |
| Option.and(...)                           |         45.4 ns |    22,020,000 | ( 44.7 ns …  49.7 ns) |  45.4 ns |  47.9 ns |  48.2 ns |
| await Option.and(...[len=1000])           |         38.8 µs |        25,800 | ( 38.0 µs …  78.7 µs) |  38.6 µs |  49.1 µs |  54.8 µs |
| Option.and(...[len=1000])                 |          9.2 µs |       109,100 | (  8.5 µs …  95.9 µs) |   9.0 µs |  10.6 µs |  13.4 µs |
| await Option.or(...)                      |        272.7 ns |     3,666,000 | (268.0 ns … 291.2 ns) | 275.7 ns | 290.9 ns | 291.2 ns |
| Option.or(...)                            |         45.1 ns |    22,160,000 | ( 43.5 ns …  50.7 ns) |  47.0 ns |  48.5 ns |  48.8 ns |
| await Option.or(...[len=1000])            |        103.4 µs |         9,674 | ( 92.1 µs … 300.2 µs) |  97.0 µs | 187.1 µs | 200.8 µs |
| Option.or(...[len=1000])                  |          8.6 µs |       116,400 | (  8.2 µs … 103.7 µs) |   8.7 µs |   9.4 µs |   9.6 µs |
| Option.lazy()...eval()                    |        468.5 ns |     2,135,000 | (460.6 ns … 565.5 ns) | 475.3 ns | 490.0 ns | 565.5 ns |
| for (const v of Some(1))                  |        101.0 ns |     9,901,000 | ( 98.7 ns … 109.6 ns) | 100.9 ns | 108.2 ns | 108.8 ns |
| for (const _ of None)                     |         89.2 ns |    11,210,000 | ( 88.0 ns …  98.9 ns) |  89.2 ns |  96.8 ns |  98.0 ns |
| Array.from(Some(1))                       |        184.8 ns |     5,410,000 | (182.8 ns … 199.0 ns) | 184.5 ns | 193.6 ns | 196.3 ns |
| Array.from(None)                          |        162.7 ns |     6,147,000 | (161.1 ns … 175.9 ns) | 162.4 ns | 170.4 ns | 174.0 ns |


file:///core.js/bench/result_bench.ts

| benchmark                                     | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| --------------------------------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |
| Result({ ok: true, value })                   |          4.1 ns |   241,100,000 | (  4.1 ns …   9.0 ns) |   4.1 ns |   4.7 ns |   5.0 ns |
| Result({ ok: false, error })                  |          4.2 ns |   235,600,000 | (  4.2 ns …   7.0 ns) |   4.2 ns |   4.8 ns |   5.1 ns |
| ok(1)                                         |          3.9 ns |   257,100,000 | (  3.9 ns …   7.7 ns) |   3.9 ns |   4.4 ns |   4.7 ns |
| err(0)                                        |          3.9 ns |   254,600,000 | (  3.9 ns …   8.9 ns) |   3.9 ns |   4.5 ns |   4.8 ns |
| Result.try(fn: () => number)                  |          4.7 ns |   211,200,000 | (  4.7 ns …   6.9 ns) |   4.7 ns |   5.3 ns |   5.6 ns |
| Result.try(fn: () => Promise<number>)         |        154.0 ns |     6,493,000 | (149.1 ns … 206.9 ns) | 152.5 ns | 201.1 ns | 203.3 ns |
| Result.try(fn: () => throw number)            |          2.0 µs |       494,000 | (  2.0 µs …   2.1 µs) |   2.0 µs |   2.1 µs |   2.1 µs |
| Result.try(fn: () => Promise<throw number>)   |        415.3 ns |     2,408,000 | (407.7 ns … 496.5 ns) | 421.8 ns | 465.8 ns | 496.5 ns |
| ok(1).and((n) => ok(n + 1))                   |          3.9 ns |   257,600,000 | (  3.9 ns …   6.6 ns) |   3.9 ns |   4.4 ns |   4.6 ns |
| err(0).and((n) => ok(n + 1))                  |          4.0 ns |   252,800,000 | (  3.9 ns …  97.9 ns) |   3.9 ns |   4.9 ns |   5.5 ns |
| ok(1).or(() => ok(0))                         |          3.9 ns |   256,500,000 | (  3.9 ns …   6.7 ns) |   3.9 ns |   4.5 ns |   4.8 ns |
| err(0).or(() => ok(0))                        |          7.2 ns |   139,200,000 | (  6.5 ns …  11.1 ns) |   7.1 ns |   9.9 ns |  10.0 ns |
| ok(1).map((n) => n + 1)                       |          3.9 ns |   256,500,000 | (  3.9 ns …   6.6 ns) |   3.9 ns |   4.4 ns |   4.6 ns |
| err(0).map((n) => n + 1)                      |          4.0 ns |   247,200,000 | (  3.9 ns …  91.4 ns) |   4.0 ns |   5.9 ns |   9.2 ns |
| ok(1).filter((n) => n > 0)                    |          3.9 ns |   255,900,000 | (  3.9 ns …  36.4 ns) |   3.9 ns |   4.6 ns |   4.9 ns |
| ok(0).filter((n) => n > 0)                    |          9.9 ns |   101,200,000 | (  9.2 ns …  14.6 ns) |   9.9 ns |  12.4 ns |  12.6 ns |
| ok(0).filter((n) => n > 0, () => 0)           |          9.9 ns |   101,300,000 | (  9.2 ns …  13.5 ns) |   9.8 ns |  12.0 ns |  12.4 ns |
| err(0).filter((n) => n + 0)                   |          3.9 ns |   256,600,000 | (  3.9 ns …   6.7 ns) |   3.9 ns |   4.4 ns |   4.7 ns |
| ok(1).unwrap()                                |          3.9 ns |   257,000,000 | (  3.9 ns …   7.9 ns) |   3.9 ns |   4.3 ns |   4.5 ns |
| ok(1).unwrap(() => 0)                         |          3.9 ns |   256,600,000 | (  3.9 ns …   6.7 ns) |   3.9 ns |   4.2 ns |   4.5 ns |
| err(1).unwrap(() => 0)                        |          3.9 ns |   258,100,000 | (  3.8 ns …   5.6 ns) |   3.9 ns |   4.2 ns |   4.5 ns |
| await Result.and(...)                         |        246.6 ns |     4,055,000 | (244.3 ns … 251.9 ns) | 247.2 ns | 250.2 ns | 251.7 ns |
| Result.and(...)                               |         45.7 ns |    21,880,000 | ( 45.0 ns …  50.2 ns) |  45.9 ns |  48.5 ns |  48.6 ns |
| await Result.and(...[len=1000])               |         38.7 µs |        25,860 | ( 37.5 µs … 107.3 µs) |  38.5 µs |  51.8 µs |  54.9 µs |
| Result.and(...[len=1000])                     |          9.2 µs |       108,800 | (  8.5 µs … 104.7 µs) |   9.0 µs |  10.7 µs |  14.6 µs |
| await Result.or(...)                          |        274.8 ns |     3,639,000 | (270.5 ns … 295.0 ns) | 275.7 ns | 293.1 ns | 295.0 ns |
| Result.or(...)                                |         46.1 ns |    21,700,000 | ( 44.1 ns …  52.9 ns) |  48.0 ns |  50.0 ns |  50.2 ns |
| await Result.or(...[len=1000])                |        103.8 µs |         9,635 | ( 91.3 µs … 441.2 µs) |  97.5 µs | 195.3 µs | 211.0 µs |
| Result.or(...[len=1000])                      |          9.1 µs |       109,300 | (  8.7 µs … 111.0 µs) |   9.2 µs |  10.0 µs |  11.9 µs |
| Result.fromOption(some(0))                    |          5.0 ns |   200,500,000 | (  5.0 ns …   7.3 ns) |   5.0 ns |   5.3 ns |   5.5 ns |
| Result.fromOption(some(0), () => string)      |          5.0 ns |   200,700,000 | (  5.0 ns …   7.5 ns) |   5.0 ns |   5.3 ns |   5.3 ns |
| Result.fromOption(none())                     |          6.0 ns |   165,400,000 | (  5.9 ns …  17.9 ns) |   6.0 ns |   7.8 ns |  11.1 ns |
| Result.fromOption(none(), () => string)       |          6.1 ns |   164,500,000 | (  5.9 ns …  17.2 ns) |   6.0 ns |   8.0 ns |  11.0 ns |
| Result.lazy()...eval()                        |        317.8 ns |     3,146,000 | (308.9 ns … 387.5 ns) | 318.5 ns | 349.4 ns | 387.5 ns |
```
