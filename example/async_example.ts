import { err, ok, Result, type ResultInstance } from "@askua/core/result";

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
        ok<number>(Math.random())
          .and((n) =>
            n >= 0.1
              ? ok<number>(n)
              : err<number>(new Error("Number is less than 0.1"))
          ),
      );
    }, 200);
  });

test("Result.and(...Promise[])", () =>
  Result
    .lazy(Result.and(getNumber(), getNumber(), getNumber()))
    .map((n) => n.reduce((v, n) => v + n) * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Result.and(...() => Promise[])", () =>
  Result
    .lazy(Result.and(getNumber, getNumber, getNumber))
    .map((n) => n.reduce((v, n) => v + n) * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Result.or(...Promise[])", () =>
  Result
    .lazy(Result.or(getNumber(), getNumber(), getNumber()))
    .map((n) => n * 100)
    .map((n) => n.toFixed(2))
    .eval());

test("Result.or(...() => Promise[])", () =>
  Result
    .lazy(Result.or(getNumber, getNumber, getNumber))
    .map((n) => n * 100)
    .map((n) => n.toFixed(2))
    .eval());
