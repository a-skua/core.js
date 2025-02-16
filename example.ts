import { Option } from "@askua/core/option";
import { Result } from "@askua/core/result";

const option = Array.from({ length: 10 }).map(() =>
  Option.some(Math.random())
    .bind<number>((n) => n > 0.5 ? Option.some(n) : Option.none())
    .map<string>((n) => n.toFixed(2))
    .map<string>((s) => s + "!!")
);
console.debug("Option");
console.debug(`> [${option}]`);
console.debug(`> [${option.map((o) => o.unwrapOr("_"))}]`);
console.debug(`> [${option.map((o) => `[${[...o]}]`)}]`);
console.debug(`> [${option.map((o) => [...o]).flat()}]`);

const result = Array.from({
  length: 10,
}).map(() =>
  Result.ok(Math.random())
    .bind<number>((n) =>
      n > 0.5 ? Result.ok(n) : Result.err(new Error("less than 0.5"))
    )
    .map<string>((n) => n.toFixed(2))
    .map<string>((s) => s + "!!")
);
console.debug("Result");
console.debug(`> [${result}]`);
console.debug(`> [${result.map((r) => r.unwrapOr("_"))}]`);
console.debug(`> [${result.map((r) => `[${[...r]}]`)}]`);
console.debug(`> [${result.map((r) => [...r]).flat()}]`);
