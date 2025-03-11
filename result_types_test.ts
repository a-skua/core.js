import { test } from "./types_test.ts";
import { type Err, type Instance, type Ok, Result } from "./result.ts";

const resultNumber: Instance<number> = Result.ok(Math.random()).andThen((n) =>
  n > 0.5 ? Result.ok(n) : Result.err(new Error("n is too small"))
);

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
  test<Instance<number, never>>(result);
}

{
  const result = Result<number, string>({ ok: true, value: 1 });
  test<Ok<number>>(result);
  test<Instance<number, string>>(result);
}

{
  const result = Result({ ok: false, error: "error" });
  test<Err<string>>(result);
  test<Instance<never, string>>(result);
}

{
  const result = Result<number, string>({ ok: false, error: "error" });
  test<Err<string>>(result);
  test<Instance<number, string>>(result);
}

{
  const result = Result({ ok: Math.random() >= 0.5, value: 1, error: "error" });
  test<Instance<number, string>>(result);
}

{
  const result = Result.ok(1);
  test<Ok<number>>(result);
  test<Instance<number, never>>(result);
}

{
  const result = Result.err("error");
  test<Err<string>>(result);
  test<Instance<never, string>>(result);
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
  test<Instance<number>>(result);
}

{
  const result = resultNumber
    .andThen(() => Result.err("error"));
  test<Instance<never, string | Error>>(result);
}

{
  const result = resultNumber
    .andThen((n) => Result.ok(n + 1));
  test<Instance<number>>(result);
}

{
  const result = resultNumber
    .andThen((n) => Result.err(n));
  test<Instance<never, number | Error>>(result);
}

{
  const result = resultNumber
    .andThen<Result<number, string>>((n) => Result.err(n.toFixed(2)));
  test<Result<number, string | Error>>(result);
}
{
  const result = resultNumber
    .and(Result.ok(1));
  test<Instance<number>>(result);
}

{
  const result = resultNumber
    .and(Result.err("error"));
  test<Instance<never, string | Error>>(result);
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
  test<Instance<number | string>>(result);
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
  test<Instance<number | string>>(result);
}

{
  const result = resultNumber
    .orElse((e) => Result.err(e.message));
  test<Instance<number, string>>(result);
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
  test<Instance<number | string>>(result);
}

{
  const result = resultNumber
    .or(Result.err("error"));
  test<Instance<number, string>>(result);
}

{
  const result = resultNumber
    .map(() => "ok");
  test<Instance<string>>(result);
}

{
  const result = resultNumber
    .map<string>(() => "ok");
  test<Instance<string>>(result);
}

{
  const result = resultNumber
    .map((n) => n.toFixed(2));
  test<Instance<string>>(result);
}

{
  const result = resultNumber
    .map<string>((n) => n.toFixed(2));
  test<Instance<string>>(result);
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
    .and<Instance<"3">>(Result.ok("3"))
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
  test<Instance<"2", Error>>(result);
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
  test<Instance<[number, number, number, number]>>(result);
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
  const result = await Result.andThen<Instance<[number, never], string>>(
    () => Promise.resolve(Result.ok(Math.random())),
    () => Promise.resolve(Result.err("error")),
  );
  test<Instance<[number, number], string>>(result);
}

{
  const result = await Result.orElse<
    Instance<number | "1" | "2" | "3" | "4", Error | "error">
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
  test<Instance<number | string, Error | string>>(result);
}

{
  const result = await Result.lazy(resultNumber).eval();
  test<Instance<number>>(result);
}

{
  const result = await Result.lazy(Result.andThen(
    resultNumber,
    resultNumber,
    resultNumber,
  )).eval();
  test<Instance<[number, number, number]>>(result);
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
