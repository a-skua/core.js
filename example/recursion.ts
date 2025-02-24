import { Option } from "@askua/core";

const getNumber = () =>
  Option.some(Math.random())
    .map((n) => n * 100)
    .andThen((n) => n >= 99.9 ? Option.some(n) : Option.none<number>());

const retryGetNumber = (retry = 0): { n: number; retry: number } =>
  getNumber()
    .map((n) => ({ n, retry }))
    .unwrapOrElse(() => retryGetNumber(retry + 1));

console.time("retryGetNumber");
console.debug(retryGetNumber());
console.timeEnd("retryGetNumber");

const asyncGetNumber = () => Promise.resolve(getNumber());

const asyncRetryGetNumber = (
  retry = 0,
): Promise<{ n: number; retry: number }> =>
  Option.lazy(asyncGetNumber)
    .map((n) => ({ n, retry }))
    .eval().then((option) =>
      option.unwrapOrElse(() => asyncRetryGetNumber(retry + 1))
    );

console.time("asyncRetryGetNumber");
console.debug(await asyncRetryGetNumber());
console.timeEnd("asyncRetryGetNumber");
