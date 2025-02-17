import { Result } from "./result.ts";

Deno.bench("Result.ok(value)", () => {
  Result.ok("value");
});

Deno.bench("Result.err(error)", () => {
  Result.err("error");
});

Deno.bench("for (const v of Result.ok(value))", () => {
  const values = [];
  for (const v of Result.ok("value")) {
    values.push(v);
  }
});

Deno.bench("for (const e of Result.err(error))", () => {
  const values = [];
  for (const v of Result.err("error")) {
    values.push(v); // never
  }
});

Deno.bench("[...Result.ok(value)]", () => {
  [...Result.ok("value")];
});

Deno.bench("[...Result.err(error)]", () => {
  [...Result.err("error")];
});

Deno.bench("Array.from(Result.ok(value))", () => {
  Array.from(Result.ok("value"));
});

Deno.bench("Array.from(Result.err(error))", () => {
  Array.from(Result.err("error"));
});

Deno.bench("Result({ ok: true, value })", () => {
  Result({ ok: true, value: "value" });
});

Deno.bench("Result({ ok: false, error })", () => {
  Result({ ok: false, error: "error" });
});

Deno.bench("Result.ok(value).toOption()", () => {
  Result.ok("value").toOption();
});

Deno.bench("Result.err(error).toOption()", () => {
  Result.err("error").toOption();
});

Deno.bench("Result.ok(value).andThen(fn)", () => {
  Result.ok(1).andThen((v) => Result.ok(v));
});

Deno.bench("Result.err(err).andThen(fn)", () => {
  Result.err(0).andThen((v) => Result.ok(v));
});

Deno.bench("Result.ok(value).and(other)", () => {
  Result.ok(1).and(Result.ok(2));
});

Deno.bench("Result.err(err).and(other)", () => {
  Result.err<number, number>(0).and(Result.ok(2));
});

Deno.bench("Result.ok(value).orElse(fn)", () => {
  Result.ok(1).orElse(() => Result.ok(0));
});

Deno.bench("Result.err(err).orElse(fn)", () => {
  Result.err(0).orElse<number>((e) => Result.ok(e));
});

Deno.bench("Result.ok(value).or(other)", () => {
  Result.ok(1).or(Result.ok(0));
});

Deno.bench("Result.err(err).or(other)", () => {
  Result.err(0).or<number>(Result.ok(0));
});

Deno.bench("Result.ok(value).map(fn)", () => {
  Result.ok(1).map((v) => v + 1);
});

Deno.bench("Result.err(err).map(fn)", () => {
  Result.err(0).map((v) => v + 1);
});

Deno.bench("Result.ok(value).unwrap()", () => {
  Result.ok(1).unwrap();
});

Deno.bench("Result.err(err).unwrapOr(0)", () => {
  Result.err<number, number>(0).unwrapOr(0);
});
