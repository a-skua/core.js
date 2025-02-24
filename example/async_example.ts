import { Result } from "@askua/core";

const getN = () =>
  Promise.resolve(
    Result.ok(Math.random())
      .map((n) => Math.floor(n * 100))
      .andThen((n) =>
        n >= 50 ? Result.ok(n) : Result.err<number>(new Error("Too low"))
      ),
  );

const getNumbers = (
  retry = 0,
): Promise<{ numbers: string; retry: number }> =>
  Result
    .lazy(Result.andThen(getN, getN, getN, getN, getN, getN, getN, getN, getN))
    .map((n) => n.map((n) => n.toFixed(2)).join(", "))
    .map((numbers) => ({ numbers, retry }))
    .eval().then((result) => result.unwrapOrElse(() => getNumbers(retry + 1)));

console.time("getNumbers");
console.debug(await getNumbers());
console.timeEnd("getNumbers");
