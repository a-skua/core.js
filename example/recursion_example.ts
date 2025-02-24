import { Option } from "@askua/core";

async function test(name: string, fn: () => Promise<unknown> | unknown) {
  console.time(name);
  const result = await fn();
  console.timeEnd(name);

  console.log(`${name}:`, result);
}

const getNumber = () =>
  Option.some(Math.random())
    .map((n) => n * 100)
    .andThen((n) => n >= 99.9 ? Option.some(n) : Option.none<number>());

const retryGetNumber = (retry = 0): { n: string; retry: number } =>
  getNumber()
    .map((n) => n.toFixed(2))
    .map((n) => ({ n, retry }))
    .unwrapOrElse(() => retryGetNumber(retry + 1));

test("retryGetNumber", () => retryGetNumber());

const asyncGetNumber = () => Promise.resolve(getNumber());

const asyncRetryGetNumber = (
  retry = 0,
): Promise<{ n: string; retry: number }> =>
  Option.lazy(asyncGetNumber)
    .map((n) => n.toFixed(2))
    .map((n) => ({ n, retry }))
    .eval().then((option) =>
      option.unwrapOrElse(() => asyncRetryGetNumber(retry + 1))
    );

test("asyncRetryGetNumber", () => asyncRetryGetNumber());
