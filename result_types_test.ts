import { test } from "./types_test.ts";
import {
  type Err,
  err,
  type InferErr,
  type InferOk,
  type Ok,
  ok,
  Result,
  type ResultInstance,
} from "./result.ts";
import { none, type Option, some } from "./option.ts";

const resultNumber: ResultInstance<number> = Result.ok(Math.random()).andThen((
  n,
) => n > 0.5 ? Result.ok(n) : Result.err(new Error("n is too small")));

{
  const result = { ok: true as const, value: 1 };
  test<Ok<number>>(result);
  test<Result<number, string>>(result);
}

{
  const result = { ok: false as const, error: "error" };
  test<Err<string>>(result);
  test<Result<number, string>>(result);
}

{
  const result = { ok: Math.random() >= 0.5, value: 1, error: "error" };
  test<Result<number, string>>(result);
}

{
  const result = Result({ ok: true, value: 1 });
  test<Ok<number>>(result);
  test<ResultInstance<number, never>>(result);
}

{
  const result = Result<number, string>({ ok: true, value: 1 });
  test<Ok<number>>(result);
  test<ResultInstance<number, string>>(result);
}

{
  const result = Result({ ok: false, error: "error" });
  test<Err<string>>(result);
  test<ResultInstance<never, string>>(result);
}

{
  const result = Result<number, string>({ ok: false, error: "error" });
  test<Err<string>>(result);
  test<ResultInstance<number, string>>(result);
}

{
  const result = Result({ ok: Math.random() >= 0.5, value: 1, error: "error" });
  test<ResultInstance<number, string>>(result);
}

{
  const result = Result.ok(1);
  test<Ok<number>>(result);
  test<ResultInstance<number>>(result);
}

{
  const result = Result.err("error");
  test<Err<string>>(result);
  test<ResultInstance<never, string>>(result);
}

{
  const result = resultNumber
    .andThen(() => ({ ok: true, value: 1 }));
  test<Result<number>>(result);
}

{
  const result = resultNumber
    .andThen(() => ({ ok: false, error: "error" }));
  test<Result<never, string | Error>>(result);
}

{
  const result = resultNumber
    .andThen((n) => ({ ok: true, value: n + 1 }));
  test<Result<number>>(result);
}

{
  const result = resultNumber
    .andThen((n) => ({ ok: false, error: n }));
  test<Result<never, number | Error>>(result);
}

{
  const result = resultNumber
    .andThen<Result<number, string>>((n) => ({
      ok: false,
      error: n.toFixed(2),
    }));
  test<Result<number, string | Error>>(result);
}

{
  const result = resultNumber
    .andThen(() => Result.ok(1));
  test<ResultInstance<number>>(result);
}

{
  const result = resultNumber
    .andThen(() => Result.err("error"));
  test<ResultInstance<never, string | Error>>(result);
}

{
  const result = resultNumber
    .andThen((n) => Result.ok(n + 1));
  test<ResultInstance<number>>(result);
}

{
  const result = resultNumber
    .andThen((n) => Result.err(n));
  test<ResultInstance<never, number | Error>>(result);
}

{
  const result = resultNumber
    .andThen<Result<number, string>>((n) => Result.err(n.toFixed(2)));
  test<Result<number, string | Error>>(result);
}
{
  const result = resultNumber
    .and(Result.ok(1));
  test<ResultInstance<number>>(result);
}

{
  const result = resultNumber
    .and(Result.err("error"));
  test<ResultInstance<never, string | Error>>(result);
}

{
  const result = resultNumber
    .and<Result<number, string>>(Result.ok(1));
  test<Result<number, string | Error>>(result);
}

{
  const result = resultNumber
    .and<Result<number, string>>(Result.err("error"));
  test<Result<number, string | Error>>(result);
}

{
  const result = resultNumber
    .orElse(() => ({ ok: true, value: "ok" }));
  test<Result<number | string>>(result);
}

{
  const result = resultNumber
    .orElse(() => ({ ok: false, error: "error" }));
  test<Result<number, string>>(result);
}

{
  const result = resultNumber
    .orElse<Result<string, string>>(() => ({ ok: false, error: "error" }));
  test<Result<number | string, string>>(result);
}

{
  const result = resultNumber
    .orElse(() => Result.ok("ok"));
  test<ResultInstance<number | string>>(result);
}

{
  const result = resultNumber
    .orElse(() => Result.err("error"));
  test<Result<number, string>>(result);
}

{
  const result = resultNumber
    .orElse<Result<string, string>>(() => Result.err("error"));
  test<Result<number | string, string>>(result);
}

{
  const result = resultNumber
    .orElse((e) => ({ ok: true, value: e.message }));
  test<Result<number | string>>(result);
}

{
  const result = resultNumber
    .orElse((e) => ({ ok: false, error: e.message }));
  test<Result<number, string>>(result);
}

{
  const result = resultNumber
    .orElse((e) => Result.ok(e.message));
  test<ResultInstance<number | string>>(result);
}

{
  const result = resultNumber
    .orElse((e) => Result.err(e.message));
  test<ResultInstance<number, string>>(result);
}

{
  const result = resultNumber
    .orElse<Result<string, string>>((e) => Result.err(e.message));
  test<Result<number | string, string>>(result);
}

{
  const result = resultNumber
    .or({ ok: true, value: "ok" });
  test<Result<number | string>>(result);
}

{
  const result = resultNumber
    .or({ ok: false, error: "error" });
  test<Result<number, string>>(result);
}

{
  const result = resultNumber
    .or(Result.ok("ok"));
  test<ResultInstance<number | string>>(result);
}

{
  const result = resultNumber
    .or(Result.err("error"));
  test<ResultInstance<number, string>>(result);
}

{
  const result = resultNumber
    .map(() => "ok");
  test<ResultInstance<string>>(result);
}

{
  const result = resultNumber
    .map<string>(() => "ok");
  test<ResultInstance<string>>(result);
}

{
  const result = resultNumber
    .map((n) => n.toFixed(2));
  test<ResultInstance<string>>(result);
}

{
  const result = resultNumber
    .map<string>((n) => n.toFixed(2));
  test<ResultInstance<string>>(result);
}

try {
  const result = resultNumber.unwrap();
  test<number>(result);
} catch (e) {
  console.debug(e);
}

{
  const result = resultNumber.unwrapOr("error");
  test<number | string>(result);
}

{
  const result = resultNumber.unwrapOr<string>("error");
  test<number | string>(result);
}

{
  const result = resultNumber.unwrapOrElse(() => "error");
  test<number | string>(result);
}

{
  const result = resultNumber.unwrapOrElse((e) => e.message);
  test<number | string>(result);
}

{
  const result = resultNumber.unwrapOrElse<string>((e) => e.message);
  test<number | string>(result);
}

{
  const result = await resultNumber
    .lazy()
    .andThen((n) => ({ ok: true, value: n + 1 }))
    .andThen(() => Promise.resolve({ ok: true, value: 2 as const }))
    .andThen((n) => Result.ok(n + 1))
    .andThen((n) => Promise.resolve(Result.ok(n.toFixed(2))))
    .eval();
  test<Result<string>>(result);
}

{
  const result = await resultNumber
    .lazy()
    .andThen<Result<number, "1">>(() => ({ ok: false, error: "1" }))
    .andThen((n) => Promise.resolve({ ok: false, error: n }))
    .andThen(() => Result.err("3" as const))
    .andThen((_) => Promise.resolve(Result.err("4" as const)))
    .eval();
  test<Result<never, Error | "1" | number | "3" | "4">>(result);
}

{
  const result = await resultNumber
    .lazy()
    .and({ ok: true, value: "1" as const })
    .and(Promise.resolve({ ok: true, value: "2" as const }))
    .and<ResultInstance<"3">>(Result.ok("3"))
    .and(Promise.resolve(Result.ok("4" as const)))
    .eval();
  test<Result<"4">>(result);
}

{
  const result = await resultNumber
    .lazy()
    .and<Result<number, "1">>({ ok: false, error: "1" })
    .and(Promise.resolve({ ok: false, error: "2" as const }))
    .and(Result.err("3" as const))
    .and(Promise.resolve(Result.err("4" as const)))
    .eval();
  test<Result<never, Error | "1" | "2" | "3" | "4">>(result);
}

{
  const result = await resultNumber
    .lazy()
    .orElse((e) => ({ ok: false, error: e.message }))
    .orElse(() => Promise.resolve({ ok: true, value: "1" as const }))
    .orElse(() => Result.ok("2" as const))
    .orElse((_) => Promise.resolve(Result.ok("3" as const)))
    .eval();
  test<Result<number | "1" | "2" | "3", never>>(result);
}

{
  const result = await resultNumber
    .lazy()
    .orElse((e) => ({ ok: false, error: e.message }))
    .orElse(() => Promise.resolve({ ok: false, error: "1" as const }))
    .orElse((_) => Result.err("2" as const))
    .orElse((_) => Promise.resolve(Result.err("3" as const)))
    .eval();
  test<Result<number, "3">>(result);
}

{
  const result = await resultNumber
    .lazy()
    .or({ ok: true, value: "1" as const })
    .or(Promise.resolve({ ok: true, value: "2" as const }))
    .or(Result.ok("3" as const))
    .or(Promise.resolve(Result.ok("4" as const)))
    .eval();
  test<Result<number | "1" | "2" | "3" | "4", never>>(result);
}

{
  const result = await resultNumber
    .lazy()
    .or({ ok: false, error: "1" as const })
    .or(Promise.resolve({ ok: false, error: "2" as const }))
    .or(Result.err("3" as const))
    .or<Result<string, "4">>(Promise.resolve(Result.err("4" as const)))
    .eval();
  test<Result<number | string, "4">>(result);
}

{
  const result = await resultNumber
    .lazy()
    .map((n) => n + 1)
    .map((n) => Promise.resolve(n + 1))
    .map<string>((n) => Promise.resolve(n.toFixed(2)))
    .map(() => "1")
    .map(() => Promise.resolve("2" as const))
    .eval();
  test<ResultInstance<"2", Error>>(result);
}

{
  const result = await resultNumber
    .lazy()
    .andThen((n) => ({ ok: true, value: n + 1 }))
    .map((n) => n + 1)
    .map((n) => Promise.resolve(n + 1))
    .map<string>((n) => Promise.resolve(n.toFixed(2)))
    .map(() => "1")
    .map(() => Promise.resolve("2" as const))
    .eval();
  test<Result<"2", Error>>(result);
}

{
  const result = await Result.andThen(
    resultNumber,
    Promise.resolve(resultNumber),
    () => resultNumber,
    () => Promise.resolve(resultNumber),
  );
  test<ResultInstance<[number, number, number, number]>>(result);
}

{
  const result = await Result.andThen<Result<[number, number, number, number]>>(
    resultNumber,
    Promise.resolve(resultNumber),
    () => resultNumber,
    () => Promise.resolve(resultNumber),
  );
  test<Result<[number, number, number, number]>>(result);
}

{
  const result = await Result.andThen<Result<[number, never], string>>(
    () => ({ ok: true, value: Math.random() }),
    () => ({ ok: false, error: "error" }),
  );
  test<Result<[number, number], string>>(result);
}

{
  const result = await Result.andThen<ResultInstance<[number, never], string>>(
    () => Promise.resolve(Result.ok(Math.random())),
    () => Promise.resolve(Result.err("error")),
  );
  test<ResultInstance<[number, number], string>>(result);
}

{
  const result = await Result.orElse<
    ResultInstance<number | "1" | "2" | "3" | "4", Error | "error">
  >(
    resultNumber,
    Promise.resolve(resultNumber),
    () => resultNumber,
    () => Promise.resolve(resultNumber),
    Result.ok("1"),
    Promise.resolve(Result.ok("2")),
    () => Result.ok("3"),
    () => Promise.resolve(Result.ok("4")),
    () => Result.err("error"),
  );
  test<ResultInstance<number | string, Error | string>>(result);
}

{
  const result = await Result.lazy(resultNumber).eval();
  test<ResultInstance<number>>(result);
}

{
  const result = await Result.lazy(Result.andThen(
    resultNumber,
    resultNumber,
    resultNumber,
  )).eval();
  test<ResultInstance<[number, number, number]>>(result);
}

{
  const result = await Result.lazy<Result<number, string>>(Result.err("error"))
    .eval();
  test<Result<number, string>>(result);
}

{
  const result = await Result.lazy<Result<[number]>>(Result.andThen(
    resultNumber,
  )).eval();
  test<Result<[number]>>(result);
}

{
  const result = await Result.lazy(Result.orElse(
    () => resultNumber,
    () => resultNumber,
    () => resultNumber,
  ))
    .map((n) => n + 1)
    .orElse((e) => Result.ok(e.message))
    .eval();
  test<number | string>(result.unwrap());
}

{
  const result = ok(0) as ResultInstance<number>;
  const a = result as InferOk<typeof result>;
  test<Ok<number>>(a);
  // test<Err<Error>>(a);
  test<Result<number>>(a);
  test<ResultInstance<number>>(a);
}

{
  const result = ok(0) as Result<number>;
  const a = result as InferOk<typeof result>;
  test<Ok<number>>(a);
  // test<Err<Error>>(a);
  test<Result<number>>(a);
  // test<ResultInstance<number>>(a);
}

{
  const result = err("error") as ResultInstance<number, string>;
  const a = result as InferErr<typeof result>;
  test<Err<string>>(a);
  // test<Ok<number>>(a);
  test<Result<number, string>>(a);
  test<ResultInstance<number, string>>(a);
}

{
  const result = err("error") as Result<number, string>;
  const a = result as InferErr<typeof result>;
  test<Err<string>>(a);
  // test<Ok<number>>(a);
  test<Result<number, string>>(a);
  // test<ResultInstance<number, string>>(a);
}

{
  const result = Result.fromOption(some(1));
  test<Ok<number>>(result);
}

{
  const result = Result.fromOption(none());
  test<Err<Error>>(result);
}

{
  const result = Result.fromOption(none(), () => "ERR!");
  // const result = Result.fromOption<number>(none(), "ERR!");
  test<Err<string>>(result);
}

{
  const option = some(1) as Option<number>;
  const result = Result.fromOption(option);
  test<ResultInstance<number>>(result);
}

{
  const option = some(1) as Option<number>;
  const result = Result.fromOption(option, () => "ERR!");
  test<ResultInstance<number, string>>(result);
}

{
  const result = ok(1).filter((n) => n > 0);
  test<ResultInstance<number, Error>>(result);
}

{
  const result = ok(1).filter((n) => n > 0, () => "ERR!");
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = ok(1).filter((n) => n > 0, (n) => `Err(${n})!`);
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = ok<number, string>(1).filter((n) => n > 0);
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = ok<number, string>(1).filter((n) => n > 0, () => "ERR!");
  test<ResultInstance<number, string>>(result);
}

{
  const result = ok<number, string>(1).filter(
    (n) => n > 0,
    (n) => `Err(${n})!`,
  );
  test<ResultInstance<number, string>>(result);
}

{
  const result = await ok(1).lazy()
    .filter((n) => n > 0).eval();
  test<ResultInstance<number, Error>>(result);
}

{
  const result = await ok(1).lazy()
    .filter((n) => Promise.resolve(n > 0)).eval();
  test<ResultInstance<number, Error>>(result);
}

{
  const result = await ok(0).lazy()
    .filter((n) => n > 0, () => "ERR!").eval();
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = await ok(0).lazy()
    .filter((n) => n > 0, (n) => `Err(${n})!`).eval();
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = await ok(0).lazy()
    .filter((n) => Promise.resolve(n > 0), () => "ERR!").eval();
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = await ok(0).lazy()
    .filter((n) => Promise.resolve(n > 0), (n) => `Err(${n})!`).eval();
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = await ok<number, string>(1).lazy()
    .filter((n) => n > 0).eval();
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = await ok<number, string>(1).lazy()
    .filter((n) => Promise.resolve(n > 0)).eval();
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = await ok<number, string>(1).lazy()
    .filter((n) => n > 0, () => "ERR!").eval();
  test<ResultInstance<number, string>>(result);
}

{
  const result = await ok<number, string>(1).lazy()
    .filter((n) => Promise.resolve(n > 0), () => "ERR!").eval();
  test<ResultInstance<number, string>>(result);
}
