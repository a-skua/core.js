import { Result, type ResultInstance } from "@askua/core/result";

async function test(name: string, fn: () => Promise<unknown>) {
  console.time(name);
  const result = await fn();
  console.timeEnd(name);

  console.log(`${name}: ${result}`);
}

const getNumber = (): Promise<ResultInstance<number>> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        Result.ok(Math.random())
          .andThen((n) =>
            n >= 0.1
              ? Result.ok<number>(n)
              : Result.err<number>(new Error("Number is less than 0.1"))
          ),
      );
    }, 200);
  });

test("Result.andThen(...Promise[])", () =>
  Result
    .lazy(Result.andThen(getNumber(), getNumber(), getNumber()))
    .map((n) => n.reduce((v, n) => v + n) * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Result.andThen(...() => Promise[])", () =>
  Result
    .lazy(Result.andThen(getNumber, getNumber, getNumber))
    .map((n) => n.reduce((v, n) => v + n) * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Result.orElse(...Promise[])", () =>
  Result
    .lazy(Result.orElse(getNumber(), getNumber(), getNumber()))
    .map((n) => n * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Result.orElse(...() => Promise[])", () =>
  Result
    .lazy(Result.orElse(getNumber, getNumber, getNumber))
    .map((n) => n * 100)
    .map((n) => n.toFixed(2))
    .eval());
