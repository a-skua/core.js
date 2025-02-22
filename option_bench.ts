import { Option } from "./option.ts";

const getNumber = () => Option.some(1);
const getString = () => Option.some("hello");
const asyncGetNumber = () => Promise.resolve(Option.some(1));
const asyncGetString = () => Promise.resolve(Option.some("hello"));
const getNone = () => Option.none();

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

Deno.bench("Option.some(value).andThen(fn)", () => {
  Option.some(1).andThen(
    (n) => Option.some(n),
  ).andThen(
    (n) => Option.some(n * 10),
  ).andThen(
    (n) => Option.some(n * 10),
  );
});

Deno.bench("Option.none().andThen(fn)", () => {
  Option.none<number>().andThen((n) => Option.some(n));
});

Deno.bench("Option.some(value).and(other)", () => {
  Option.some(1).and(Option.some(2));
});

Deno.bench("Option.none().and(other)", () => {
  Option.none<number>().and(Option.some(2));
});

Deno.bench("Option.some(value).orElse(fn)", () => {
  Option.some(1).orElse(() => Option.some(0));
});

Deno.bench("Option.none().orElse(fn)", () => {
  Option.none<number>().orElse(
    () => Option.none(),
  ).orElse(
    () => Option.none(),
  ).orElse(
    () => Option.some(0),
  );
});

Deno.bench("Option.some(value).or(other)", () => {
  Option.some(1).or(Option.some(0));
});

Deno.bench("Option.none().or(other)", () => {
  Option.none<number>().or(Option.some(0));
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

Deno.bench("Option.andThen(...sync)", async () => {
  await Option.andThen(getNumber, getString, getNone);
});

Deno.bench("Option.andThen(...async)", async () => {
  await Option.andThen(asyncGetNumber, asyncGetString, getNone);
});

Deno.bench("Option.orElse(...sync)", async () => {
  await Option.orElse(getNone, getNone, getNumber);
});

Deno.bench("Option.orElse(...async)", async () => {
  await Option.orElse(getNone, getNone, asyncGetNumber);
});

const fn1 = Array.from(
  { length: 1000 },
  (_, i) => () => Promise.resolve(Option.some(i)),
);
const fn2 = Array.from(
  { length: 1000 },
  () => () => Promise.resolve(Option.none()),
);

Deno.bench("Option.andThen(...async[len=1000])", async () => {
  await Option.andThen(...fn1);
});

type Fn = typeof fn2[number];
Deno.bench("Option.orElse(...async[len=1000])", async () => {
  await Option.orElse(...fn2 as [Fn, ...Fn[]]);
});

Deno.bench("Result.lazy().eval()", async () => {
  await Option.lazy(Option.some(1))
    .map((n) => n + 1)
    .andThen((): Option<string> => Option.none())
    .orElse((): Option<number | Error> => Option.some(1))
    .eval();
});
