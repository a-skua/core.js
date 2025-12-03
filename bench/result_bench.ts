import { err, ok, Result } from "@askua/core/result";
import { none, some } from "@askua/core/option";

Deno.bench("Result({ ok: true, value })", () => {
  Result({ ok: true, value: 1 });
});

Deno.bench("Result({ ok: false, error })", () => {
  Result({ ok: false, error: 0 });
});

Deno.bench("ok(1)", () => {
  ok(1);
});

Deno.bench("err(0)", () => {
  err(0);
});

Deno.bench("ok(1).and((n) => ok(n + 1))", () => {
  ok(1).and((n) => ok(n + 1));
});

Deno.bench("err(0).and((n) => ok(n + 1))", () => {
  err(0).and((n) => ok(n + 1));
});

Deno.bench("ok(1).or(() => ok(0))", () => {
  ok(1).or(() => ok(0));
});

Deno.bench("err(0).or(() => ok(0))", () => {
  err(1).or(() => ok(0));
});

Deno.bench("ok(1).map((n) => n + 1)", () => {
  ok(1).map((n) => n + 1);
});

Deno.bench("err(0).map((n) => n + 1)", () => {
  err(0).map((n) => n + 1);
});

Deno.bench("ok(1).filter((n) => n > 0)", () => {
  ok(1).filter((n) => n > 0);
});

Deno.bench("ok(0).filter((n) => n > 0)", () => {
  ok(0).filter((n) => n > 0);
});

Deno.bench("ok(0).filter((n) => n > 0, () => 0)", () => {
  ok(0).filter((n) => n > 0, () => 0);
});

Deno.bench("err(0).filter((n) => n + 0)", () => {
  err(0).filter((n) => n > 0);
});

Deno.bench("ok(1).unwrap()", () => {
  ok(1).unwrap();
});

Deno.bench("ok(1).unwrap(() => 0)", () => {
  ok(1).unwrap(() => 0);
});

Deno.bench("err(1).unwrap(() => 0)", () => {
  err(1).unwrap(() => 0);
});

Deno.bench("for (const v of Ok(1))", () => {
  const values = [];
  for (const v of Result.ok(1)) {
    values.push(v);
  }
});

Deno.bench("[...Ok(1)]", () => {
  [...Result.ok(1)];
});

Deno.bench("Array.from(Ok(1))", () => {
  Array.from(Result.ok(1));
});

Deno.bench("Result.andThen", async () => {
  await Result.andThen(
    Result.ok(1),
    Promise.resolve(Result.ok(2)),
    () => Result.ok(3),
    () => Promise.resolve(Result.ok(4)),
  );
});

Deno.bench("Result.orElse", async () => {
  await Result.orElse(
    Result.err(1),
    Promise.resolve(Result.err(2)),
    () => Result.err(3),
    () => Promise.resolve(Result.err(4)),
  );
});

Deno.bench("Result.fromOption(Some(0))", () => {
  Result.fromOption(some(0));
});

Deno.bench("Result.fromOption(Some(0), () => string)", () => {
  Result.fromOption(some(0), () => "Error!");
});

Deno.bench("Result.fromOption(None)", () => {
  Result.fromOption(none());
});

Deno.bench("Result.fromOption(None, () => string)", () => {
  Result.fromOption(none(), () => "Error!");
});

Deno.bench("Result.andThen(...[len=1000])", async (t) => {
  const args = Array.from(
    { length: 1000 },
    (_, i) => {
      switch (i % 4) {
        case 1:
          return Result.ok(i);
        case 2:
          return Promise.resolve(Result.ok(i));
        case 3:
          return () => Result.ok(i);
        default:
          return () => Promise.resolve(Result.ok(i));
      }
    },
  );

  t.start();
  await Result.andThen(...args);
  t.end();
});

Deno.bench("Result.orElse(...[len=1000])", async (t) => {
  const args = Array.from(
    { length: 1000 },
    (_, i) => {
      switch (i % 4) {
        case 1:
          return Result.err(i);
        case 2:
          return Promise.resolve(Result.err(i));
        case 3:
          return () => Result.err(i);
        default:
          return () => Promise.resolve(Result.err(i));
      }
    },
  );
  type Arg = typeof args[number];

  t.start();
  await Result.orElse(...args as [Arg, ...Arg[]]);
  t.end();
});

Deno.bench("Result.lazy()...eval()", async () => {
  await Result.lazy(() => err<number, number>(0))
    .or(() => err<number, number>(0))
    .or(() => Promise.resolve(err<number, number>(0)))
    .or(() => err<number, number>(0))
    .or(() => Promise.resolve(err<number, number>(0)))
    .and(() => ok(1))
    .and(() => Promise.resolve(ok(2)))
    .and((n) => ok(n + 1))
    .and((n) => Promise.resolve(ok(n + 1)))
    .map((n) => n + 1)
    .map((n) => Promise.resolve(n + 1))
    .eval();
});

Deno.bench("Result.try(fn: () => number)", () => {
  Result.try(() => 1);
});

Deno.bench(
  "Result.try(fn: () => Promise<number>)",
  async () => {
    await Result.try(() => Promise.resolve(1));
  },
);

Deno.bench("Result.try(fn: () => throw number)", () => {
  Result.try(() => {
    throw 1;
  });
});

Deno.bench(
  "Result.try(fn: () => Promise<throw number>)",
  async () => {
    await Result.try(() => {
      return new Promise(() => {
        throw 1;
      });
    });
  },
);
