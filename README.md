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
    .map((n) => n * 100)
    .andThen((n) => n >= 50 ? Option.some(n) : Option.none<number>());

const option = await Option
  .lazy(Option.andThen(
    getNumber,
    getNumber,
    getNumber,
  ))
  .map((n) => n.reduce((acc, n) => acc + n, 0))
  .orElse(() => Option.some(0))
  .map((n) => n.toFixed(2))
  .map((sum) => ({ sum }))
  .eval();

console.log(option.unwrap()); // { sum: "0.00" }

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

file:///core.js/bench/option_bench.ts

benchmark                        time/iter (avg)        iter/s      (min … max)           p75      p99     p995
-------------------------------- ----------------------------- --------------------- --------------------------
Option => Some(1)                         4.3 ns   233,800,000 (  4.1 ns …   9.0 ns)   4.3 ns   5.0 ns   5.3 ns
Option => None                            4.2 ns   237,100,000 (  4.1 ns …   7.0 ns)   4.2 ns   4.9 ns   5.1 ns
(Option).toResult: Some(1)                6.5 ns   154,500,000 (  5.9 ns …  20.6 ns)   6.3 ns  11.5 ns  11.7 ns
(Option).toResult: None                   1.8 µs       566,700 (  1.7 µs …   2.1 µs)   1.7 µs   2.1 µs   2.1 µs
(Option).andThen: Some(1)                 4.2 ns   239,700,000 (  4.0 ns …   7.1 ns)   4.2 ns   4.5 ns   4.9 ns
(Option).andThen: None                    4.2 ns   238,500,000 (  4.2 ns …   5.7 ns)   4.2 ns   4.5 ns   4.7 ns
(Option).and: Some(1)                     4.2 ns   240,100,000 (  4.1 ns …   5.7 ns)   4.2 ns   4.5 ns   4.7 ns
(Option).and: None                        4.5 ns   221,100,000 (  4.4 ns …   8.8 ns)   4.5 ns   4.8 ns   5.1 ns
(Option).orElse: Some(1)                  4.2 ns   239,100,000 (  4.0 ns …   5.8 ns)   4.2 ns   4.5 ns   4.7 ns
(Option).orElse: None                     7.5 ns   133,800,000 (  6.8 ns … 136.4 ns)   7.1 ns  11.9 ns  12.0 ns
(Option).or: Some(1)                      4.2 ns   237,900,000 (  4.2 ns …   7.3 ns)   4.2 ns   4.5 ns   4.7 ns
(Option).or: None                         4.9 ns   206,000,000 (  4.4 ns … 938.3 ns)   4.6 ns   6.2 ns  12.9 ns
(Option).map: Some(1)                     4.2 ns   240,000,000 (  4.1 ns …   6.5 ns)   4.1 ns   4.8 ns   5.1 ns
(Option).map: None                        4.3 ns   231,000,000 (  4.1 ns … 321.1 ns)   4.2 ns   5.6 ns  11.6 ns
(Option).unwrap: Some(1)                  4.2 ns   239,800,000 (  4.1 ns …   7.3 ns)   4.2 ns   4.8 ns   5.0 ns
(Option).unwrapOr: Some(1)                4.2 ns   236,900,000 (  4.2 ns …   6.7 ns)   4.2 ns   5.0 ns   5.2 ns
(Option).unwrapOr: None                   4.2 ns   237,800,000 (  4.2 ns …   8.2 ns)   4.2 ns   4.7 ns   5.0 ns
(Option).unwrapOrElse: Some(1)            4.2 ns   240,000,000 (  4.1 ns …   6.3 ns)   4.2 ns   4.6 ns   4.9 ns
(Option).unwrapOrElse: None               4.2 ns   240,200,000 (  4.1 ns …   6.5 ns)   4.2 ns   4.6 ns   4.9 ns
for (const v of Some(1))                 97.8 ns    10,220,000 ( 94.2 ns … 107.7 ns) 100.0 ns 103.9 ns 105.4 ns
for (const _ of None)                    86.1 ns    11,610,000 ( 84.0 ns … 101.8 ns)  86.4 ns  92.2 ns  93.5 ns
[...Some(1)]                            148.5 ns     6,733,000 (144.4 ns … 154.3 ns) 150.8 ns 153.8 ns 154.2 ns
[...None)]                              117.1 ns     8,541,000 (113.6 ns … 127.1 ns) 119.5 ns 125.3 ns 125.6 ns
Array.from(Some(1))                     194.5 ns     5,142,000 (191.0 ns … 205.2 ns) 196.7 ns 200.6 ns 202.5 ns
Array.from(None)                        168.4 ns     5,939,000 (165.1 ns … 193.2 ns) 170.5 ns 176.4 ns 184.3 ns
Option.some                               4.1 ns   241,200,000 (  4.1 ns …   6.9 ns)   4.1 ns   4.7 ns   4.9 ns
Option.none                               4.2 ns   238,500,000 (  4.0 ns …   6.8 ns)   4.2 ns   4.8 ns   5.0 ns
Option.andThen                          260.9 ns     3,833,000 (254.4 ns … 319.8 ns) 260.4 ns 313.1 ns 316.7 ns
Option.orElse                           246.6 ns     4,055,000 (243.1 ns … 301.1 ns) 246.0 ns 264.4 ns 299.3 ns
Option.andThen(...[len=1000])            28.9 µs        34,640 ( 28.2 µs …  43.4 µs)  28.9 µs  32.4 µs  35.7 µs
Option.orElse(...[len=1000])             27.9 µs        35,820 ( 26.0 µs … 433.6 µs)  26.8 µs 102.3 µs 112.0 µs
Option.lazy().eval()                    576.6 ns     1,734,000 (569.5 ns … 612.5 ns) 577.7 ns 612.5 ns 612.5 ns


file:///core.js/bench/result_bench.ts

benchmark                       time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------- ----------------------------- --------------------- --------------------------
Result => Ok(1)                          4.1 ns   243,000,000 (  4.1 ns …   9.2 ns)   4.1 ns   4.7 ns   4.9 ns
Result => Err(0)                         4.4 ns   228,200,000 (  4.3 ns …   6.3 ns)   4.4 ns   5.1 ns   5.4 ns
(Result).toOption: Ok(1)                 6.4 ns   156,800,000 (  6.0 ns …  16.6 ns)   6.2 ns  10.8 ns  10.9 ns
(Result).toOption: Err(0)                6.5 ns   153,500,000 (  6.1 ns …  20.5 ns)   6.3 ns  11.8 ns  12.0 ns
(Result).andThen: Ok(1)                  4.2 ns   239,600,000 (  4.1 ns …   6.8 ns)   4.2 ns   4.8 ns   5.0 ns
(Result).andThen: Err(0)                 4.2 ns   238,800,000 (  4.1 ns …  34.2 ns)   4.2 ns   4.8 ns   5.2 ns
(Result).and: Ok(1)                      4.2 ns   238,200,000 (  4.2 ns …  33.9 ns)   4.2 ns   4.5 ns   4.8 ns
(Result).and: Err(0)                     4.5 ns   222,000,000 (  4.5 ns …   7.3 ns)   4.5 ns   5.2 ns   5.5 ns
(Result).orElse: Ok(1)                   4.2 ns   237,300,000 (  4.1 ns … 112.9 ns)   4.1 ns   5.0 ns  11.3 ns
(Result).orElse: Err(0)                  7.5 ns   132,500,000 (  6.9 ns …  33.4 ns)   7.1 ns  12.4 ns  12.6 ns
(Result).or: Ok(1)                       4.2 ns   240,700,000 (  4.1 ns …  13.6 ns)   4.1 ns   4.7 ns   5.1 ns
(Result).or: Err(0)                      4.5 ns   221,700,000 (  4.5 ns …  14.3 ns)   4.5 ns   5.3 ns   5.8 ns
(Result).map: Ok(1)                      4.2 ns   238,300,000 (  4.2 ns …   6.8 ns)   4.2 ns   4.5 ns   4.9 ns
(Result).map: Err(0)                     4.2 ns   240,200,000 (  4.1 ns …   7.9 ns)   4.2 ns   4.5 ns   4.7 ns
(Result).unwrap: Ok(1)                   4.2 ns   240,000,000 (  4.1 ns …   7.0 ns)   4.2 ns   4.5 ns   4.7 ns
(Result).unwrapOr: Ok(1)                 4.2 ns   238,900,000 (  4.2 ns …   8.0 ns)   4.2 ns   4.5 ns   4.8 ns
(Result).unwrapOr: Err(0)                4.2 ns   240,500,000 (  4.1 ns …   6.0 ns)   4.2 ns   4.5 ns   4.7 ns
(Result).unwrapOrElse: Ok(1)             4.2 ns   236,900,000 (  4.2 ns …   8.2 ns)   4.2 ns   4.5 ns   4.8 ns
(Result).unwrapOrElse: Err(0)            4.2 ns   237,400,000 (  4.2 ns …   7.8 ns)   4.2 ns   5.0 ns   5.2 ns
for (const v of Ok(1))                  98.7 ns    10,130,000 ( 95.0 ns … 106.9 ns) 101.2 ns 104.1 ns 105.7 ns
for (const _ of Err(0))                 87.3 ns    11,450,000 ( 84.3 ns … 123.6 ns)  88.7 ns  97.8 ns 100.8 ns
[...Ok(1)]                             148.6 ns     6,731,000 (143.3 ns … 156.7 ns) 150.5 ns 155.1 ns 155.4 ns
[...Err(0)]                            118.3 ns     8,452,000 (115.3 ns … 126.6 ns) 120.5 ns 124.4 ns 124.9 ns
Array.from(Ok(1))                      194.9 ns     5,131,000 (190.1 ns … 202.0 ns) 197.9 ns 201.5 ns 201.5 ns
Array.from(Err(0))                     169.3 ns     5,907,000 (165.8 ns … 175.7 ns) 171.6 ns 174.5 ns 175.3 ns
Result.ok                                4.1 ns   241,600,000 (  4.1 ns …   7.8 ns)   4.1 ns   4.5 ns   4.8 ns
Result.err                               4.2 ns   239,300,000 (  4.1 ns …   7.4 ns)   4.2 ns   4.5 ns   4.9 ns
Result.andThen                         262.0 ns     3,817,000 (256.0 ns … 321.5 ns) 261.0 ns 314.1 ns 321.3 ns
Result.orElse                          246.2 ns     4,062,000 (242.6 ns … 301.2 ns) 245.7 ns 262.5 ns 297.4 ns
Result.andThen(...[len=1000])           28.5 µs        35,030 ( 27.9 µs …  48.1 µs)  28.6 µs  31.7 µs  32.2 µs
Result.orElse(...[len=1000])            28.3 µs        35,360 ( 26.9 µs … 405.8 µs)  27.7 µs  35.5 µs 111.5 µs
Result.lazy().eval()                   663.5 ns     1,507,000 (650.2 ns … 681.9 ns) 667.2 ns 681.9 ns 681.9 ns
```
