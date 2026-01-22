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

Deno.bench("ok(1).and((n) => ok(n + 1))", () => {
  ok(1).and((n) => ok(n + 1));
});

Deno.bench("err(0).and((n) => ok(n + 1))", () => {
  err<number, number>(0).and((n) => ok(n + 1));
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
  err<number, number>(0).map((n) => n + 1);
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
  err<number, number>(0).filter((n) => n > 0);
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

Deno.bench("await Result.and(...)", async () => {
  await Result.and(
    ok(1),
    Promise.resolve(ok(2)),
    () => ok(3),
    () => Promise.resolve(ok(4)),
  );
});

Deno.bench("Result.and(...)", () => {
  Result.and(
    ok(1),
    ok(2),
    () => ok(3),
    () => ok(4),
  );
});

Deno.bench("await Result.and(...[len=1000])", async (t) => {
  const args = Array.from(
    { length: 1000 },
    (_, i) => {
      switch (i % 4) {
        case 1:
          return ok(i);
        case 2:
          return Promise.resolve(ok(i));
        case 3:
          return () => ok(i);
        default:
          return () => Promise.resolve(ok(i));
      }
    },
  );
  type Arg = typeof args[number];

  t.start();
  await Result.and(...args as [Arg, ...Arg[]]);
  t.end();
});

Deno.bench("Result.and(...[len=1000])", (t) => {
  const args = Array.from(
    { length: 1000 },
    (_, i) => {
      switch (i % 2) {
        case 1:
          return ok(i);
        default:
          return () => ok(i);
      }
    },
  );
  type Arg = typeof args[number];

  t.start();
  Result.and(...args as [Arg, ...Arg[]]);
  t.end();
});

Deno.bench("await Result.or(...)", async () => {
  await Result.or(
    err(1),
    Promise.resolve(err(2)),
    () => err(3),
    () => Promise.resolve(err(4)),
  );
});

Deno.bench("Result.or(...)", () => {
  Result.or(
    err(1),
    err(2),
    () => err(3),
    () => err(4),
  );
});

Deno.bench("await Result.or(...[len=1000])", async (t) => {
  const args = Array.from(
    { length: 1000 },
    (_, i) => {
      switch (i % 4) {
        case 1:
          return err(i);
        case 2:
          return Promise.resolve(err(i));
        case 3:
          return () => err(i);
        default:
          return () => Promise.resolve(err(i));
      }
    },
  );
  type Arg = typeof args[number];

  t.start();
  await Result.or(...args as [Arg, ...Arg[]]);
  t.end();
});

Deno.bench("Result.or(...[len=1000])", (t) => {
  const args = Array.from(
    { length: 1000 },
    (_, i) => {
      switch (i % 2) {
        case 1:
          return err(i);
        default:
          return () => err(i);
      }
    },
  );
  type Arg = typeof args[number];

  t.start();
  Result.or(...args as [Arg, ...Arg[]]);
  t.end();
});

Deno.bench("Result.fromOption(some(0))", () => {
  Result.fromOption(some(0));
});

Deno.bench("Result.fromOption(some(0), () => string)", () => {
  Result.fromOption(some(0));
});

Deno.bench("Result.fromOption(none())", () => {
  Result.fromOption(none());
});

Deno.bench("Result.fromOption(none(), () => string)", () => {
  Result.fromOption(none());
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
