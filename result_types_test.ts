import { test } from "./types_test.ts";
import {
  type Err,
  err,
  type ErrInstance,
  type InferErr,
  type InferOk,
  isErr,
  isOk,
  type Ok,
  ok,
  type OkInstance,
  Result,
  type ResultInstance,
} from "./result.ts";
import { none, type Option, some } from "./option.ts";

const resultNumber: ResultInstance<number> = ok(Math.random())
  .filter((n) => n > 0.5)
  .or((n) => err(new Error(`${n} is too small`)));

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
  test<ResultInstance<unknown, string>>(result);
}

{
  const result = Result<number, string>({ ok: false, error: "error" });
  test<Err<string>>(result);
  test<ResultInstance<number, string>>(result);
}

{
  const result = Result<number, string>({
    ok: Math.random() >= 0.5,
    value: 1,
    error: "error",
  });
  test<ResultInstance<number, string>>(result);
}

{
  const result: OkInstance<number, string> = ok(1);
  test<Ok<number>>(result);
  test<OkInstance<number, string>>(result);
  test<Result<number, string>>(result);
  test<Result<number, string>>(result);
}

{
  const result = ok(1);
  test<Ok<number>>(result);
  test<ResultInstance<number>>(result);
}

{
  const result: ErrInstance<number, string> = err("error");
  test<Err<string>>(result);
  test<ErrInstance<number, string>>(result);
  test<Result<number, string>>(result);
  test<ResultInstance<number, string>>(result);
}

{
  const result = resultNumber
    .and(() => ({ ok: true, value: 1 }));
  test<Result<number, unknown>>(result);
}

{
  const andThen = (): Result<number, string> => ({ ok: false, error: "error" });
  const result = resultNumber
    .and(andThen);
  test<Result<number, string | Error>>(result);
}

{
  const result = resultNumber
    .and<number, string, Result<number, string>>(() => ({
      ok: false,
      error: "error",
    }));
  test<Result<number, string | Error>>(result);
}

{
  const result = resultNumber
    .and<number, string>(() => err("error"));
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = resultNumber
    .and((n) => ({ ok: true, value: n + 1 }));
  test<Result<number>>(result);
}

{
  const result = resultNumber
    .and((n) => ({ ok: false, error: n }));
  test<Result<never, number | Error>>(result);
}

{
  const result = resultNumber
    .and<number, string, Result<number, string>>((n) => ({
      ok: false,
      error: n.toFixed(2),
    }));
  test<Result<number, string | Error>>(result);
}

{
  const result = resultNumber
    .and<number, string>((n) => err(n.toFixed(2)));
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = resultNumber.and(() => ok(1));
  test<ResultInstance<number>>(result);
}

{
  const result = resultNumber.and(() => err("error"));
  test<ResultInstance<never, string | Error>>(result);
}

{
  const result = resultNumber.and((n) => ok(n + 1));
  test<ResultInstance<number>>(result);
}

{
  const result = resultNumber.and((n) => err(n));
  test<ResultInstance<never, number | Error>>(result);
}

{
  const result = resultNumber
    .and<number, string>((n) => err(n.toFixed(2)));
  test<Result<number, string | Error>>(result);
}
{
  const result = resultNumber
    .and(() => ok(1));
  test<ResultInstance<number>>(result);
}

{
  const result = resultNumber
    .and(() => err("error"));
  test<ResultInstance<never, string | Error>>(result);
}

{
  const result = resultNumber
    .and<number, string>(() => ok(1));
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = resultNumber
    .and<number, string>(() => err("error"));
  test<ResultInstance<number, string | Error>>(result);
}

{
  const result = resultNumber
    .or(() => ({ ok: true, value: "ok" }));
  test<Result<number | string>>(result);
}

{
  const result = resultNumber
    .or(() => ({ ok: false, error: "error" }));
  test<Result<number, string>>(result);
}

{
  const result = resultNumber
    .or<string, string, Result<string, string>>(() => ({
      ok: false,
      error: "error",
    }));
  test<Result<number | string, string>>(result);
}

{
  const result = resultNumber
    .or<string, string>(() => err("error"));
  test<ResultInstance<number | string, string>>(result);
}

{
  const result = resultNumber
    .or(() => ok("ok"));
  test<ResultInstance<number | string>>(result);
}

{
  const result = resultNumber
    .or(() => err("error"));
  test<Result<number, string>>(result);
}

{
  const result = resultNumber
    .or<string, string>(() => err("error"));
  test<ResultInstance<number | string, string>>(result);
}

{
  const result = resultNumber
    .or((e) => ({ ok: true, value: e.message }));
  test<Result<number | string>>(result);
}

{
  const result = resultNumber
    .or((e) => ({ ok: false, error: e.message }));
  test<Result<number, string>>(result);
}

{
  const result = resultNumber
    .or((e) => ok(e.message));
  test<ResultInstance<number | string>>(result);
}

{
  const result = resultNumber
    .or((e) => err(e.message));
  test<ResultInstance<number, string>>(result);
}

{
  const result = resultNumber
    .or<string, string>((e) => err(e.message));
  test<ResultInstance<number | string, string>>(result);
}

{
  const result = resultNumber
    .or(() => ({ ok: true, value: "ok" }));
  test<Result<number | string>>(result);
}

{
  const result = resultNumber
    .or(() => ({ ok: false, error: "error" }));
  test<Result<number, string>>(result);
}

{
  const result = resultNumber
    .or(() => ok("ok"));
  test<ResultInstance<number | string>>(result);
}

{
  const result = resultNumber
    .or(() => err("error"));
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
  const result = resultNumber;
  test<number | false>(result.unwrap(() => false));
}

{
  const result = resultNumber.unwrap(() => "error");
  test<number | string>(result);
}

{
  const result = resultNumber.unwrap(() => "error");
  test<number | string>(result);
}

{
  const result = resultNumber.unwrap(() => "error");
  test<number | string>(result);
}

{
  const result = resultNumber.unwrap((e) => e.message);
  test<number | string>(result);
}

{
  const result = resultNumber.unwrap((e) => e.message);
  test<number | string>(result);
}

{
  const result = await resultNumber
    .lazy()
    .and((n) => ({ ok: true, value: n + 1 }))
    .and(() => Promise.resolve({ ok: true, value: 2 as const }))
    .and((n) => ok(n + 1))
    .and((n) => Promise.resolve(ok(n.toFixed(2))))
    .eval();
  test<Result<string>>(result);
}

{
  const result = await resultNumber
    .lazy()
    .and(() => ({ ok: false, error: "1" as const }))
    .and((n) => Promise.resolve({ ok: false, error: n }))
    .and(() => err("3" as const))
    .and((_) => Promise.resolve(err("4" as const)))
    .eval();
  test<Result<never, Error | "1" | number | "3" | "4">>(result);
}

{
  const result = await resultNumber
    .lazy()
    .and(() => ({ ok: true, value: "1" as const }))
    .and(() => Promise.resolve({ ok: true, value: "2" as const }))
    .and(() => ok("3" as const))
    .and(() => Promise.resolve(ok("4" as const)))
    .eval();
  test<Result<"4">>(result);
}

{
  const result = await resultNumber
    .lazy()
    .and(() => ({ ok: false, error: "1" as const }))
    .and(() => Promise.resolve({ ok: false, error: "2" as const }))
    .and(() => err("3" as const))
    .and(() => Promise.resolve(err("4" as const)))
    .eval();
  test<Result<never, Error | "1" | "2" | "3" | "4">>(result);
}

{
  const result = await resultNumber
    .lazy()
    .or((e) => ({ ok: false, error: e.message }))
    .or(() => Promise.resolve({ ok: true, value: "1" as const }))
    .or(() => ok("2" as const))
    .or((_) => Promise.resolve(ok("3" as const)))
    .eval();
  test<Result<number | "1" | "2" | "3", never>>(result);
}

{
  const result = await resultNumber
    .lazy()
    .or((e) => ({ ok: false, error: e.message }))
    .or(() => Promise.resolve({ ok: false, error: "1" as const }))
    .or((_) => err("2" as const))
    .or((_) => Promise.resolve(err("3" as const)))
    .eval();
  test<Result<number, "3">>(result);
}

{
  const result = await resultNumber
    .lazy()
    .or(() => ({ ok: true, value: "1" as const }))
    .or(() => Promise.resolve({ ok: true, value: "2" as const }))
    .or(() => ok("3" as const))
    .or(() => Promise.resolve(ok("4" as const)))
    .eval();
  test<Result<number | "1" | "2" | "3" | "4", never>>(result);
}

{
  const result = await resultNumber
    .lazy()
    .or(() => ({ ok: false, error: "1" as const }))
    .or(() => Promise.resolve({ ok: false, error: "2" as const }))
    .or(() => err("3" as const))
    .or(() => Promise.resolve(err<string, "4">("4" as const)))
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
    .and((n) => ({ ok: true, value: n + 1 }))
    .map((n) => n + 1)
    .map((n) => Promise.resolve(n + 1))
    .map<string>((n) => Promise.resolve(n.toFixed(2)))
    .map(() => "1")
    .map(() => Promise.resolve("2" as const))
    .eval();
  test<Result<"2", Error>>(result);
}

{
  const result = await Result.and(
    resultNumber,
    Promise.resolve(resultNumber),
    () => resultNumber,
    () => Promise.resolve(resultNumber),
  );
  test<ResultInstance<[number, number, number, number]>>(result);
}

{
  const result = await Result.and(
    resultNumber,
    Promise.resolve(resultNumber),
    () => resultNumber,
    () => Promise.resolve(resultNumber as Result<number>),
  );
  test<Result<[number, number, number, number]>>(result);
}

{
  const result = Result.and(
    resultNumber,
    resultNumber as Result<number>,
    () => resultNumber,
    () => resultNumber,
  );
  test<Result<[number, number, number, number]>>(result);
}

{
  const result = Result.and(
    () => ({ ok: true, value: Math.random() }),
    () => ({ ok: false, error: "error" }),
  );
  test<Result<[number, unknown], string>>(result);
}

{
  const result = Result.and(
    () => ok(Math.random()),
    () => err("error"),
  );
  test<ResultInstance<[number, unknown], string>>(result);
}

{
  const result = await Result.and(
    () => Promise.resolve(ok(Math.random())),
    () => Promise.resolve(err("error")),
  );
  test<ResultInstance<[number, unknown], string>>(result);
}

{
  const result = await Result.and(
    () => Promise.resolve(ok(Math.random())),
    () => Promise.resolve(err("error")),
  );
  test<ResultInstance<[number, unknown], string>>(result);
}

{
  const result = Result.or(
    resultNumber,
    resultNumber as Result<number>,
    () => resultNumber,
    () => resultNumber,
    ok("1" as const),
    ok("2" as const),
    () => ok("3" as const),
    () => ok("4" as const),
    () => err("error"),
  );
  test<Result<number | "1" | "2" | "3" | "4", Error | string>>(result);
}

{
  const result = await Result.or(
    resultNumber,
    Promise.resolve(resultNumber),
    () => resultNumber,
    () => Promise.resolve(resultNumber),
    ok("1" as const),
    Promise.resolve(ok("2" as const)),
    () => ok("3" as const),
    () => Promise.resolve(ok("4" as const) as Result<"4">),
    () => err("error"),
  );
  test<Result<number | "1" | "2" | "3" | "4", Error | string>>(result);
}

{
  const result = Result.or(
    resultNumber,
    resultNumber,
    () => resultNumber,
    () => resultNumber,
    ok("1" as const),
    ok("2" as const),
    () => ok("3" as const),
    () => ok("4" as const),
    () => err("error"),
  );
  test<ResultInstance<number | "1" | "2" | "3" | "4", Error | string>>(result);
}

{
  const result = await Result.or(
    resultNumber,
    Promise.resolve(resultNumber),
    () => resultNumber,
    () => Promise.resolve(resultNumber),
    ok("1" as const),
    Promise.resolve(ok("2" as const)),
    () => ok("3" as const),
    () => Promise.resolve(ok("4" as const)),
    () => err("error"),
  );
  test<ResultInstance<number | "1" | "2" | "3" | "4", Error | string>>(result);
}

{
  const result = await Result.lazy(resultNumber).eval();
  test<ResultInstance<number>>(result);
}

{
  const result = await Result.lazy(Result.and(
    resultNumber,
    resultNumber,
    resultNumber,
  )).eval();
  test<ResultInstance<[number, number, number]>>(result);
}

{
  const result = await Result.lazy(err("error"))
    .eval();
  test<Result<number, string>>(result);
}

{
  const result = await Result.lazy(Result.and(
    resultNumber,
    resultNumber,
  )).eval();
  test<Result<[number, number]>>(result);
}

{
  const result = await Result.lazy(Result.or(
    () => resultNumber,
    () => resultNumber,
    () => resultNumber,
  ))
    .map((n) => n + 1)
    .or((e) => ok(e.message))
    .eval();
  test<number | string>(result.unwrap());
}

{
  const result = ok(0) as ResultInstance<number>;
  const a = result as InferOk<typeof result, number, Error>;
  test<Ok<number>>(a);
  // test<Err<Error>>(a);
  test<Result<number>>(a);
  test<ResultInstance<number>>(a);
}

{
  const result = ok(0) as Result<number>;
  const a = result as InferOk<typeof result, number, Error>;
  test<Ok<number>>(a);
  // test<Err<Error>>(a);
  test<Result<number>>(a);
  // test<ResultInstance<number>>(a);
}

{
  const result = err("error") as ResultInstance<number, string>;
  const a = result as InferErr<typeof result, number, string>;
  test<Err<string>>(a);
  // test<Ok<number>>(a);
  test<Result<number, string>>(a);
  test<ResultInstance<number, string>>(a);
}

{
  const result = err("error") as Result<number, string>;
  const a = result as InferErr<typeof result, number, string>;
  test<Err<string>>(a);
  // test<Ok<number>>(a);
  test<Result<number, string>>(a);
  // test<ResultInstance<number, string>>(a);
}

{
  const result = Result.fromOption(some(1 as const));
  test<Ok<1>>(result);
}

{
  const result = Result.fromOption(none());
  test<Err<null>>(result);
}

{
  const option = some(1) as Option<number>;
  const result = Result.fromOption(option);
  test<ResultInstance<number, null>>(result);
}

{
  const isOne = (n: number): n is 1 => n === 1;
  const result = ok(1).filter(isOne);
  test<ResultInstance<1, number>>(result);
}

{
  const result = ok(1).filter((n) => n > 0);
  test<ResultInstance<number, number>>(result);
}

{
  const isOne = (n: number): n is 1 => n === 1;
  const result = ok(1).filter(isOne, () => "ERR!");
  test<ResultInstance<1, string>>(result);
}

{
  const result = ok(1).filter((n) => n > 0, () => "ERR!");
  test<ResultInstance<number, string>>(result);
}

{
  const result = ok(1).filter((n) => n > 0, (n) => `Err(${n})!`);
  test<ResultInstance<number, string>>(result);
}

{
  const result = ok(1).filter((n) => n > 0);
  test<ResultInstance<number, number>>(result);
}

{
  const result = ok(1).filter((n) => n > 0, () => "ERR!");
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
  test<ResultInstance<number, number>>(result);
}

{
  const result = await ok(1).lazy()
    .filter((n) => Promise.resolve(n > 0)).eval();
  test<ResultInstance<number, number>>(result);
}

{
  const result = await ok(0).lazy()
    .filter((n) => n > 0, () => "ERR!").eval();
  test<ResultInstance<number, string>>(result);
}

{
  const result = await ok(0).lazy()
    .filter((n) => n > 0, (n) => `Err(${n})!`).eval();
  test<ResultInstance<number, string>>(result);
}

{
  const result = await ok(0).lazy()
    .filter((n) => Promise.resolve(n > 0), () => "ERR!").eval();
  test<ResultInstance<number, string>>(result);
}

{
  const result = await ok(0).lazy()
    .filter((n) => Promise.resolve(n > 0), (n) => `Err(${n})!`).eval();
  test<ResultInstance<number, string>>(result);
}

{
  const result = await ok(1).lazy()
    .filter((n) => n > 0).eval();
  test<ResultInstance<number, number>>(result);
}

{
  const result = await ok(1).lazy()
    .filter((n) => Promise.resolve(n > 0)).eval();
  test<ResultInstance<number, number>>(result);
}

{
  const result = await ok(1).lazy()
    .filter((n) => n > 0, () => "ERR!").eval();
  test<ResultInstance<number, string>>(result);
}

{
  const result = await ok(1).lazy()
    .filter((n) => Promise.resolve(n > 0), () => "ERR!").eval();
  test<ResultInstance<number, string>>(result);
}

{
  const result = ok(1) as Result<number>;
  if (isOk(result)) test<Ok<number>>(result);
}

{
  const result = ok(1) as ResultInstance<number>;
  if (isOk(result)) test<OkInstance<number, Error>>(result);
}

{
  const result = err(1) as Result<string, number>;
  if (isErr(result)) test<Err<number>>(result);
}

{
  const result = err(1) as ResultInstance<string, number>;
  if (isErr(result)) test<ErrInstance<string, number>>(result);
}

{
  const fn = (): number => {
    throw new Error("test");
  };
  const result = Result.try(fn);
  test<Result<number, unknown>>(result);
}

{
  const fn = (): Promise<number> => {
    throw new Error("test");
  };
  const result = Result.try(fn);
  test<Promise<Result<number, unknown>>>(result);
}

{
  const fn = (): number => {
    throw false;
  };
  test<Result<number, false>>(Result.try<number, false>(fn));
}
