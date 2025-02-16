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

Deno.bench("Result.ok(value).bind(fn)", () => {
  Result.ok(1).bind((v) => Result.ok(v));
});

Deno.bench("Result.err(err).bind(fn)", () => {
  Result.err<number, number>(0).bind((v) => Result.ok(v));
});
