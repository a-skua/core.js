import { err, ok, Result, type ResultInstance } from "@askua/core/result";

declare function bar(): ResultInstance<number>;

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
Result<number, Error>(ok(1));
Result<number, number>(err(-1));
Result(foo());

Result({ ok: false, error: "error" })
  .map((n) => n + 1)
  .and(() => err(-1))
  .and(() => ok(1))
  .and(() => err(-1))
  .and(() => ok(1))
  .and((n) => n > 0 ? ok(n) : err(-1))
  .and(() => ok(0))
  .lazy()
  .map((n) => n + 1)
  .map((n) => !!n)
  .map((n) => Promise.resolve(n.toString()))
  .and(() => err(""))
  .and(() => ok(""))
  .and((s) => s.length > 0 ? ok(s) : err(-1))
  .and(() => ({ ok: true, value: 1 }))
  .and(() => Promise.resolve({ ok: true, value: 1 }))
  .and((_) => ({ ok: true, value: 1 }))
  .and((_) => ({ ok: true, value: 1 }) as const)
  .and((_) => ({ ok: true as const, value: 1 }))
  .and((_) => ({ ok: true, value: 1 }))
  .and((_) => Promise.resolve({ ok: true, value: 1 }))
  .and((_) => ok(1))
  .and(() => ({ ok: false, error: -1 }))
  .and((_) => ({ ok: false, error: -1 }))
  .eval();

ok(null)
  .or(() => ok(""))
  .or(() => err(""))
  .or(() => ok(1))
  .or(() => err(-1))
  .lazy()
  .eval();

ok(null)
  .lazy()
  .or(() => ok(""))
  .or(() => err(""))
  .or(() => ok(1))
  .or(() => err(-1))
  .eval();

function foo(): Result<number> {
  return ok<number>(1);
}

Result.or(
  ok(1),
  err(-1),
);

Result.or(
  ok(1),
  err(-1),
  ok(""),
  err(""),
  { ok: true, value: null },
  { ok: false, error: null },
);

Result.and(
  ok(1),
  err(-1),
  ok(""),
  err(""),
  { ok: true, value: null },
  { ok: false, error: null },
  foo,
  foo(),
);

Result.and(
  ok(1),
  err(-1),
);

Result.lazy(ok(1)).eval();
Result.lazy(err("error")).eval();
Result.lazy({ ok: true, value: 1 }).eval();
Result.lazy({ ok: false, error: "error" }).eval();
Result.lazy(() => ok(1)).eval();
Result.lazy(() => err("error")).eval();
Result.lazy(() => ({ ok: true, value: 1 })).eval();
Result.lazy(() => ({ ok: false, error: "error" })).eval();

Result.lazy(Result.and(
  ok(1),
  err(-1),
  ok(""),
  err(""),
  { ok: true, value: null },
  { ok: false, error: null },
)).eval();

Result.lazy(Result.and(
  ok(""),
  err(""),
  { ok: true, value: null },
  { ok: false, error: null },
  foo(),
  foo,
)).eval();

Result.lazy(Result.or(
  ok(1),
  err(-1),
  ok(""),
  err(""),
  { ok: true, value: null },
  { ok: false, error: null },
)).eval();

Result.lazy(Result.or(
  ok(""),
  err(""),
  { ok: true, value: null },
  { ok: false, error: null },
  foo(),
  foo,
)).eval();

Result.lazy(ok(1));
Result.lazy(err(1));
