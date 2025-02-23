import { Option } from "@askua/core";

const getN = () =>
  Option.some(Math.random())
    .map((n) => n * 100)
    .andThen((n) => n >= 99.5 ? Option.some(n) : Option.none<number>());

const getNumber = (
  retry = 0,
): { number: string; retry: number } =>
  getN()
    .map((n) => n.toFixed(2))
    .map((number) => ({ number, retry }))
    .unwrapOrElse(() => getNumber(retry + 1));

console.time("getNumber");
console.debug(getNumber());
console.timeEnd("getNumber");
