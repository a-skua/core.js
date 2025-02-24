import { Brand, Option, Result } from "@askua/core";

const PassedNumber = Brand<number, "Passed">;

const getNumber = () =>
  Option.some(Math.random())
    .map((n) => n * 100)
    .andThen((n) => n >= 50 ? Option.some(n) : Option.none<number>())
    .map((n) => PassedNumber(n));

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
    return Result.ok(PassedNumber(0));
  })
  .map((n) => n.toFixed(2))
  .eval();

console.log(result.unwrap()); // 0.00
