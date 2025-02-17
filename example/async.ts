import { Result } from "@askua/core/result";

const asyncRandom = () => Promise.resolve(Math.random());

async function getNumber(): Promise<Result<number>> {
  const num = await asyncRandom();
  if (num >= 0.5) {
    return Result.ok<number>(num);
  }
  return Result.err<number>(new Error(`Number is less than 0.5: ${num}`));
}

async function myProcess(): Promise<Result<[number, number, number]>> {
  return Result(await getNumber()).asyncAndThen<[number, number, number]>(
    async (n1) =>
      Result(await getNumber()).asyncAndThen<[number, number, number]>(
        async (n2) =>
          Result(await getNumber()).map<[number, number, number]>((
            n3,
          ) => [n1, n2, n3]),
      ),
  );
}

let i = 0;
while (++i) {
  const result = await myProcess();
  if (result.ok) {
    console.log(i, result.value);
    break;
  } else {
    console.error(i, result.error);
  }
}
