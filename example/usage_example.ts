import { Brand, none, Option, Result, some } from "@askua/core";

const PassedNumber = Brand<number, "Passed">;

const getNumber = () =>
  some(Math.random())
    .map((n) => n * 100)
    .and((n) => n >= 50 ? some(n) : none())
    .map((n) => PassedNumber(n));

const option = await Option
  .lazy(Option.and(
    getNumber,
    getNumber,
    getNumber,
  ))
  .map((n) => n.reduce((acc, n) => acc + n, 0))
  .or(() => some(0))
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
