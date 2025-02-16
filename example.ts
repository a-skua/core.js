import { Option } from "@askua/core/option";
import { Result } from "@askua/core/result";

const option = Array.from({ length: 10 }).map(() =>
  Option.some(Math.random())
    .map((n) => n > 0.5 ? Option.some(n) : Option.none())
    .map((n) => Option.some(n.toFixed(2)))
);
console.debug("Option");
console.debug(`> [${option}]`);
console.debug(`> [${option.map((o) => `[${[...o]}]`)}]`);
console.debug(`> [${option.map((o) => [...o]).flat()}]`);

const result = Array.from({ length: 10 }).map(() =>
  Result.ok(Math.random())
    .map((n) => n > 0.5 ? Result.ok(n) : Result.err("less than 0.5"))
    .map((n) => Result.ok(n.toFixed(2)))
);
console.debug("Result");
console.debug(`> [${result}]`);
console.debug(`> [${result.map((r) => `[${[...r]}]`)}]`);
console.debug(`> [${result.map((r) => [...r]).flat()}]`);
