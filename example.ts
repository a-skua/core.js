import { Option } from "@askua/core/option";
import { Result } from "@askua/core/result";

const option = Array.from({ length: 10 }).map(() =>
  Option.some(Math.random())
    .andThen((n) => n >= 0.5 ? Option.some(n) : Option.none())
    .map((n) => n.toFixed(2))
    .map((s) => s + "!!")
);
console.debug("Option");
console.debug(`> [${option}]`);
console.debug(`> [${
  option.map((r) =>
    r.orElse(() => {
      console.debug("None");
      return Option.some("_");
    })
  )
}]`);
console.debug(`> [${option.map((o) => o.unwrapOr("_"))}]`);
console.debug(`> [${option.map((o) => `[${[...o]}]`)}]`);
console.debug(`> [${option.map((o) => [...o]).flat()}]`);

const result = Array.from({
  length: 10,
}).map(() =>
  Result.ok(Math.random())
    .andThen<number, string>((n) =>
      n >= 0.3 ? Result.ok(n) : Result.err("less than 0.3")
    )
    .andThen<number>((n) =>
      n >= 0.5 ? Result.ok(n) : Result.err("less than 0.5")
    )
    .map((n) => n.toFixed(2))
);
console.debug("Result");
console.debug(`> [${result}]`);
console.debug(`> [${
  result.map((r) =>
    r.orElse((e) => {
      console.debug(`Error: ${e}`);
      return Result.ok("_");
    })
  )
}]`);
console.debug(`> [${result.map((r) => r.unwrapOr("_"))}]`);
console.debug(`> [${result.map((r) => `[${[...r]}]`)}]`);
console.debug(`> [${result.map((r) => [...r]).flat()}]`);
