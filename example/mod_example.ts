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
