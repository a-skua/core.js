import { Result } from "@askua/core/result";

const getRandom = () => Promise.resolve(Math.random());

async function getNumber(): Promise<Result<number, Error>> {
  const num = await getRandom();
  if (num >= 0.5) {
    return Result.ok(num);
  }
  return Result.err(new Error("Number is too small"));
}

const getNineNumbers = async (
  retry = 0,
): Promise<
  readonly [
    ...string[],
    { retry: number },
  ]
> =>
  (await Result.andThen(
    getNumber,
    getNumber,
    getNumber,
    getNumber,
    getNumber,
    getNumber,
    getNumber,
    getNumber,
    getNumber,
  )).map((nums) => [...nums.map((n) => n.toFixed(2)), { retry }] as const)
    .unwrapOrElse(() => getNineNumbers(retry + 1));

console.time("getNineNumbers");
console.debug(await getNineNumbers());
console.timeEnd("getNineNumbers");
