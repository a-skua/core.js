import { Result } from "@askua/core/result";

Deno.bench("Result => Ok(1)", () => {
  Result({ ok: true, value: 1 });
});

Deno.bench("Result => Err(0)", () => {
  Result({ ok: false, error: 0 });
});

Deno.bench("(Result).toOption: Ok(1)", () => {
  Result.ok(1).toOption();
});

Deno.bench("(Result).toOption: Err(0)", () => {
  Result.err(0).toOption();
});

Deno.bench("(Result).andThen: Ok(1)", () => {
  Result.ok(1).andThen((v) => Result.ok(v));
});

Deno.bench("(Result).andThen: Err(0)", () => {
  Result.ok(0).andThen((v) => Result.ok(v));
});

Deno.bench("(Result).and: Ok(1)", () => {
  Result.ok(1).and(Result.ok(2));
});

Deno.bench("(Result).and: Err(0)", () => {
  Result.err(0).and(Result.ok(1));
});

Deno.bench("(Result).orElse: Ok(1)", () => {
  Result.ok(1).orElse(() => Result.ok(0));
});

Deno.bench("(Result).orElse: Err(0)", () => {
  Result.err(0).orElse(() => Result.ok(1));
});

Deno.bench("(Result).or: Ok(1)", () => {
  Result.ok(1).or(Result.ok(0));
});

Deno.bench("(Result).or: Err(0)", () => {
  Result.err(0).or(Result.ok(1));
});

Deno.bench("(Result).map: Ok(1)", () => {
  Result.ok(1).map((v) => v + 1);
});

Deno.bench("(Result).map: Err(0)", () => {
  Result.err<number, number>(0).map((v) => v + 1);
});

Deno.bench("(Result).unwrap: Ok(1)", () => {
  Result.ok(1).unwrap();
});

Deno.bench("(Result).unwrapOr: Ok(1)", () => {
  Result.err(1).unwrapOr(0);
});

Deno.bench("(Result).unwrapOr: Err(0)", () => {
  Result.err(0).unwrapOr(1);
});

Deno.bench("(Result).unwrapOrElse: Ok(1)", () => {
  Result.err(1).unwrapOrElse(() => 0);
});

Deno.bench("(Result).unwrapOrElse: Err(0)", () => {
  Result.err(0).unwrapOrElse(() => 1);
});

Deno.bench("for (const v of Ok(1))", () => {
  const values = [];
  for (const v of Result.ok(1)) {
    values.push(v);
  }
});

Deno.bench("for (const _ of Err(0))", () => {
  const values = [];
  for (const v of Result.err(0)) {
    values.push(v); // never
  }
});

Deno.bench("[...Ok(1)]", () => {
  [...Result.ok(1)];
});

Deno.bench("[...Err(0)]", () => {
  [...Result.err(0)];
});

Deno.bench("Array.from(Ok(1))", () => {
  Array.from(Result.ok(1));
});

Deno.bench("Array.from(Err(0))", () => {
  Array.from(Result.err(0));
});

Deno.bench("Result.ok", () => {
  Result.ok(1);
});

Deno.bench("Result.err", () => {
  Result.err(0);
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

Deno.bench("Result.orElse(...async[len=1000])", async (t) => {
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

Deno.bench("Result.lazy().eval()", async () => {
  await Result.lazy(() => Result.err<number, number>(0))
    .or(Result.err<number, number>(0))
    .or(Promise.resolve(Result.err<number, number>(0)))
    .orElse(() => Result.err<number, number>(0))
    .orElse(() => Promise.resolve(Result.err<number, number>(0)))
    .and(Result.ok(1))
    .and(Promise.resolve(Result.ok(2)))
    .andThen((n) => Result.ok(n + 1))
    .andThen((n) => Promise.resolve(Result.ok(n + 1)))
    .map((n) => n + 1)
    .map((n) => Promise.resolve(n + 1))
    .eval();
});
