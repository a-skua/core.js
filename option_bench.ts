import { Option } from "./option.ts";

Deno.bench("Option.some(value)", () => {
  Option.some("value");
});

Deno.bench("Option.none()", () => {
  Option.none();
});

Deno.bench("for (const v of Option.some(value))", () => {
  const values = [];
  for (const v of Option.some("value")) {
    values.push(v);
  }
});

Deno.bench("for (const _ of Option.none())", () => {
  const values = [];
  for (const v of Option.none()) {
    values.push(v); // never
  }
});

Deno.bench("[...Option.some(value)]", () => {
  [...Option.some("value")];
});

Deno.bench("[...Option.none()]", () => {
  [...Option.none()];
});

Deno.bench("Array.from(Option.some(value))", () => {
  Array.from(Option.some("value"));
});

Deno.bench("Array.from(Option.none())", () => {
  Array.from(Option.none());
});

Deno.bench("Option({ some: true, value })", () => {
  Option({ some: true, value: "value" });
});

Deno.bench("Option({ some: false })", () => {
  Option({ some: false });
});

Deno.bench("Option.some(value).toResult()", () => {
  Option.some("value").toResult();
});

Deno.bench("Option.none().toResult()", () => {
  Option.none().toResult();
});

Deno.bench("Option.some(value).toResult(error)", () => {
  Option.some("value").toResult("error");
});

Deno.bench("Option.none().toResult(error)", () => {
  Option.none().toResult("error");
});

Deno.bench("Option.some(value).bind(fn)", () => {
  Option.some(1).bind((n) => Option.some(n));
});

Deno.bench("Option.none().bind(fn)", () => {
  Option.none<number>().bind((n) => Option.some(n));
});

Deno.bench("Option.some(value).map(fn)", () => {
  Option.some(1).map((n) => n + 1);
});

Deno.bench("Option.none().map(fn)", () => {
  Option.none<number>().map((n) => n + 1);
});

Deno.bench("Option.some(value).unwrap()", () => {
  Option.some(1).unwrap();
});

Deno.bench("Option.none().unwrapOr(0)", () => {
  Option.none<number>().unwrapOr(0);
});
