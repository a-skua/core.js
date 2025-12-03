import { none, Option, some } from "@askua/core/option";

async function test(name: string, fn: () => Promise<unknown>) {
  console.time(name);
  const result = await fn();
  console.timeEnd(name);

  console.log(`${name}: ${result}`);
}

const getNumber = () =>
  some(Math.random())
    .and((n) => n >= 0.1 ? some<number>(n) : none<number>());

test("Option.and(...Promise[])", () =>
  Option
    .lazy(Option.and(getNumber(), getNumber(), getNumber()))
    .map((n) => n.reduce((v, n) => v + n) * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Option.and(...() => Promise[])", () =>
  Option
    .lazy(Option.and(getNumber, getNumber, getNumber))
    .map((n) => n.reduce((v, n) => v + n) * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Option.or(...Promise[])", () =>
  Option
    .lazy(Option.or(getNumber(), getNumber(), getNumber()))
    .map((n) => n * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Option.or(...() => Promise[])", () =>
  Option
    .lazy(Option.or(getNumber, getNumber, getNumber))
    .map((n) => n * 100)
    .map((n) => n.toFixed(2))
    .eval());
