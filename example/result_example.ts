import { Instance as Result, type Ok } from "@askua/core/result";

declare function bar(): Result<number>;

const result = bar();
if (result.ok) {
  console.log(result.value);
} else {
  console.error(result.error);
}

Result({ ok: Math.random() >= 0.5, value: 1, error: "error" });
Result({ ok: true, value: 1 });
Result({ ok: false, error: "error" });

Result<string, Error>({ ok: true, value: "ok" });
Result<string, string>({ ok: false, error: "error" });
Result<number, Error>(Result.ok(1));
Result<number, number>(Result.err(-1));
Result(foo());

Result({ ok: false, error: "error" })
  .map((n) => n + 1)
  .and<Result<string, number>>(Result.err(-1))
  .and(Result.ok(1))
  .andThen<Result<string, number>>(() => Result.err(-1))
  .andThen<Result<number, string>>(() => Result.ok(1))
  .andThen((n) => n > 0 ? Result.ok(n) : Result.err(-1))
  .and(Result.ok(0))
  .lazy()
  .map((n) => n + 1)
  .map((n) => !!n)
  .map((n) => Promise.resolve(n.toString()))
  .and<Result<number, string>>(Result.err(""))
  .and(Result.ok(""))
  .andThen<Result<string, number>>((s) =>
    s.length > 0 ? Result.ok(s) : Result.err(-1)
  )
  .andThen(() => ({ ok: true, value: 1 }))
  .andThen(() => Promise.resolve({ ok: true, value: 1 }))
  .andThen((_): Ok<number> => ({ ok: true, value: 1 }))
  .andThen((_) => ({ ok: true, value: 1 }) as const)
  .andThen((_) => ({ ok: true as const, value: 1 }))
  .andThen((_) => ({ ok: true, value: 1 }))
  .andThen<{ ok: true; value: 1 }>((_) =>
    Promise.resolve({ ok: true, value: 1 })
  )
  .andThen((_) => Result.ok(1))
  .andThen(() => ({ ok: false, error: -1 }))
  .andThen((_) => ({ ok: false, error: -1 }))
  .eval();

Result.ok(null)
  .or(Result.ok(""))
  .or(Result.err(""))
  .orElse(() => Result.ok(1))
  .orElse<Result<string, number>>(() => Result.err(-1))
  .lazy()
  .eval();

Result.ok(null)
  .lazy()
  .or(Result.ok(""))
  .or(Result.err(""))
  .orElse<Result<number>>(() => Result.ok(1))
  .orElse(() => Result.err(-1))
  .eval();

function foo(): Result<number> {
  return Result.ok<number>(1);
}

Result.orElse<Result<number | string, number | string>>(
  Result.ok(1),
  Result.err(-1),
);

Result.orElse(
  Result.ok(1),
  Result.err(-1),
  Result.ok(""),
  Result.err(""),
  { ok: true, value: null },
  { ok: false, error: null },
);

Result.andThen(
  Result.ok(1),
  Result.err(-1),
  Result.ok(""),
  Result.err(""),
  { ok: true, value: null },
  { ok: false, error: null },
  foo,
  foo(),
);

Result.andThen<Result<[number, number], Error | number>>(
  Result.ok(1),
  Result.err(-1),
);

Result.lazy(Result.ok(1)).eval();
Result.lazy(Result.err("error")).eval();
Result.lazy({ ok: true, value: 1 }).eval();
Result.lazy({ ok: false, error: "error" }).eval();
Result.lazy(() => Result.ok(1)).eval();
Result.lazy(() => Result.err("error")).eval();
Result.lazy(() => ({ ok: true, value: 1 })).eval();
Result.lazy(() => ({ ok: false, error: "error" })).eval();

Result.lazy(Result.andThen(
  Result.ok(1),
  Result.err(-1),
  Result.ok(""),
  Result.err(""),
  { ok: true, value: null },
  { ok: false, error: null },
)).eval();

Result.lazy(Result.andThen(
  Result.ok(""),
  Result.err(""),
  { ok: true, value: null },
  { ok: false, error: null },
  foo(),
  foo,
)).eval();

Result.lazy(Result.orElse(
  Result.ok(1),
  Result.err(-1),
  Result.ok(""),
  Result.err(""),
  { ok: true, value: null },
  { ok: false, error: null },
)).eval();

Result.lazy(Result.orElse(
  Result.ok(""),
  Result.err(""),
  { ok: true, value: null },
  { ok: false, error: null },
  foo(),
  foo,
)).eval();

Result.lazy<Result<number, string>>(Result.ok(1));
Result.lazy<Result<string, number>>(Result.err(1));
