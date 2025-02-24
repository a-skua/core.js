import { Option } from "@askua/core/option";

async function test(name: string, fn: () => Promise<unknown>) {
  console.time(name);
  const result = await fn();
  console.timeEnd(name);

  console.log(`${name}: ${result}`);
}

const getNumber = () =>
  Option.some(Math.random())
    .andThen((n) => n >= 0.1 ? Option.some<number>(n) : Option.none<number>());

test("Option.andThen(...Promise[])", () =>
  Option
    .lazy(Option.andThen(getNumber(), getNumber(), getNumber()))
    .map((n) => n.reduce((v, n) => v + n) * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Option.andThen(...() => Promise[])", () =>
  Option
    .lazy(Option.andThen(getNumber, getNumber, getNumber))
    .map((n) => n.reduce((v, n) => v + n) * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Option.orElse(...Promise[])", () =>
  Option
    .lazy(Option.orElse(getNumber(), getNumber(), getNumber()))
    .map((n) => n * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Option.orElse(...() => Promise[])", () =>
  Option
    .lazy(Option.orElse(getNumber, getNumber, getNumber))
    .map((n) => n * 100)
    .map((n) => n.toFixed(2))
    .eval());
