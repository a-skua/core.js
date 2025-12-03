import { none, Option, some } from "@askua/core/option";

Deno.bench("Option({ some: true, value })", () => {
  Option({ some: true, value: 1 });
});

Deno.bench("Option({ some: false })", () => {
  Option({ some: false });
});

Deno.bench("some(1)", () => {
  some(1);
});

Deno.bench("none()", () => {
  none();
});

Deno.bench("(Option).toResult: Some(1)", () => {
  Option.some(1).toResult();
});

Deno.bench("(Option).toResult: None", () => {
  Option.none<number>().toResult();
});

Deno.bench("(Option).andThen: Some(1)", () => {
  Option.some(1).andThen((n) => Option.some(n));
});

Deno.bench("(Option).andThen: None", () => {
  Option.none<number>().andThen((n) => Option.some(n));
});

Deno.bench("(Option).and: Some(1)", () => {
  Option.some(1).and(Option.some(2));
});

Deno.bench("(Option).and: None", () => {
  Option.none<number>().and(Option.some(2));
});

Deno.bench("(Option).orElse: Some(1)", () => {
  Option.some(1).orElse(() => Option.some(0));
});

Deno.bench("(Option).orElse: None", () => {
  Option.none<number>().orElse(() => Option.some(0));
});

Deno.bench("some(1).or(() => some(0))", () => {
  some(1).or(() => some(0));
});

Deno.bench("none().or(() => some(0))", () => {
  none().or(() => some(0));
});

Deno.bench("(Option).map: Some(1)", () => {
  Option.some(1).map((n) => n + 1);
});

Deno.bench("(Option).map: None", () => {
  Option.none<number>().map((n) => n + 1);
});

Deno.bench("some(1).unwrap()", () => {
  some(1).unwrap();
});

Deno.bench("some(1).unwrap(() => 0)", () => {
  some(1).unwrap(() => 0);
});

Deno.bench("none().unwrap(() => 0)", () => {
  none().unwrap(() => 0);
});

Deno.bench("(Option).unwrapOr: Some(1)", () => {
  Option.some(1).unwrapOr(0);
});

Deno.bench("(Option).unwrapOr: None", () => {
  Option.none<number>().unwrapOr(0);
});

Deno.bench("(Option).unwrapOrElse: Some(1)", () => {
  Option.some(1).unwrapOrElse(() => 0);
});

Deno.bench("(Option).unwrapOrElse: None", () => {
  Option.none<number>().unwrapOr(() => 0);
});

Deno.bench("some(1).unwrapOr(Error)", () => {
  some(1).unwrapOr(new Error("test"));
});

Deno.bench("some(1).unwrapOrElse(() => Error)", () => {
  some(1).unwrapOr(() => new Error("test"));
});

Deno.bench("for (const v of Some(1))", () => {
  const values = [];
  for (const v of Option.some(1)) {
    values.push(v);
  }
});

Deno.bench("for (const _ of None)", () => {
  const values = [];
  for (const v of Option.none()) {
    values.push(v); // never
  }
});

Deno.bench("[...Some(1)]", () => {
  [...Option.some(1)];
});

Deno.bench("[...None)]", () => {
  [...Option.none()];
});

Deno.bench("Array.from(Some(1))", () => {
  Array.from(Option.some(1));
});

Deno.bench("Array.from(None)", () => {
  Array.from(Option.none());
});

Deno.bench("Option.some", () => {
  Option.some(1);
});

Deno.bench("Option.none", () => {
  Option.none<number>();
});

Deno.bench("Option.andThen", async () => {
  await Option.andThen(
    Option.some(1),
    Promise.resolve(Option.some(2)),
    () => Option.some(3),
    () => Promise.resolve(Option.some(4)),
  );
});

Deno.bench("Option.orElse", async () => {
  await Option.orElse(
    Option.none(),
    Promise.resolve(Option.none()),
    () => Option.none(),
    () => Promise.resolve(Option.none()),
  );
});

Deno.bench("Option.andThen(...[len=1000])", async (t) => {
  const args = Array.from(
    { length: 1000 },
    (_, i) => {
      switch (i % 4) {
        case 1:
          return Option.some(i);
        case 2:
          return Promise.resolve(Option.some(i));
        case 3:
          return () => Option.some(i);
        default:
          return () => Promise.resolve(Option.some(i));
      }
    },
  );

  t.start();
  await Option.andThen(...args);
  t.end();
});

Deno.bench("Option.orElse(...[len=1000])", async (t) => {
  const args = Array.from(
    { length: 1000 },
    (_, i) => {
      switch (i % 4) {
        case 1:
          return Option.none();
        case 2:
          return Promise.resolve(Option.none());
        case 3:
          return () => Option.none();
        default:
          return () => Promise.resolve(Option.none());
      }
    },
  );
  type Arg = typeof args[number];

  t.start();
  await Option.orElse(...args as [Arg, ...Arg[]]);
  t.end();
});

Deno.bench("Option.lazy()...eval()", async () => {
  await Option.lazy(() => none<number>())
    .or(() => none<number>())
    .or(() => Promise.resolve(none<number>()))
    .orElse(() => none<number>())
    .orElse(() => Promise.resolve(some(1)))
    .and(some(2))
    .and(Promise.resolve(some(3)))
    .andThen((n) => some(n + 1))
    .andThen((n) => Promise.resolve(some(n + 1)))
    .map((n) => n + 1)
    .map((n) => Promise.resolve(n + 1))
    .eval();
});
