import type { ResultInstance } from "@askua/core/result";
import { Result } from "@askua/core/result";

function getNumber(): ResultInstance<number, Error> {
  const num = Math.random();
  if (num >= 0.5) {
    return Result.ok(num);
  }
  return Result.err(new Error("Number is too small"));
}

const getNineNumbers = (
  retry = 0,
): readonly [
  ...string[],
  { retry: number },
] =>
  getNumber().andThen((n1) =>
    getNumber().andThen((n2) =>
      getNumber().andThen((n3) =>
        getNumber().andThen((n4) =>
          getNumber().andThen((n5) =>
            getNumber().andThen((n6) =>
              getNumber().andThen((n7) =>
                getNumber().andThen((n8) =>
                  getNumber().andThen((n9) =>
                    Result.ok(
                      [
                        ...[n1, n2, n3, n4, n5, n6, n7, n8, n9].map((n) =>
                          n.toFixed(2)
                        ),
                        { retry },
                      ] as const,
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  ).unwrapOrElse(() => getNineNumbers(retry + 1));

console.time("getNineNumbers");
console.debug(getNineNumbers());
console.timeEnd("getNineNumbers");
