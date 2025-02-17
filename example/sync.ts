import { Result } from "@askua/core/result";

const asyncRandom = () => Math.random();

function getNumber(): Result<number> {
  const num = asyncRandom();
  if (num >= 0.5) {
    return Result.ok<number>(num);
  }
  return Result.err<number>(new Error(`Number is less than 0.5: ${num}`));
}

function myProcess(): Result<[number, number, number]> {
  return Result(getNumber()).andThen<[number, number, number]>(
    (n1) =>
      Result(getNumber()).andThen<[number, number, number]>(
        (n2) =>
          Result(getNumber()).map<[number, number, number]>((
            n3,
          ) => [n1, n2, n3]),
      ),
  );
}

let i = 0;
while (++i) {
  const result = myProcess();
  if (result.ok) {
    console.log(i, result.value);
    break;
  } else {
    console.error(i, result.error);
  }
}
