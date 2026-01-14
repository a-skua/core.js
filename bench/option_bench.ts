import { none, Option, type OptionInstance, some } from "@askua/core/option";

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

Deno.bench("Option.fromNullable(null)", () => {
  Option.fromNullable(null);
});

Deno.bench("Option.fromNullable(undefined)", () => {
  Option.fromNullable(undefined);
});

Deno.bench("Option.fromNullable(1)", () => {
  Option.fromNullable(1);
});

Deno.bench("some(1).and((n) => some(n + 1))", () => {
  some(1).and((n) => some(n + 1));
});

Deno.bench("none().and((n) => some(n + 1))", () => {
  none().and((n) => some(n + 1));
});

Deno.bench("some(1).or(() => some(0))", () => {
  some(1).or(() => some(0));
});

Deno.bench("none().or(() => some(0))", () => {
  none().or(() => some(0));
});

Deno.bench("some(1).map((n) => n + 1)", () => {
  some(1).map((n) => n + 1);
});

Deno.bench("none().map((n) => n + 1)", () => {
  none().map((n) => n + 1);
});

Deno.bench("some(1).filter((n) => n > 0)", () => {
  some(1).filter((n) => n > 0);
});

Deno.bench("some(0).filter((n) => n > 0)", () => {
  some(0).filter((n) => n > 0);
});

Deno.bench("none().filter((n) => n > 0)", () => {
  none().filter((n) => n > 0);
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

Deno.bench("[...some(1)]", () => {
  [...some(1)];
});

Deno.bench("[...none()]", () => {
  [...none()];
});

Deno.bench("some(1).lazy().map((n) => n + 1).eval()", async () => {
  await some(1).lazy().map((n) => n + 1).eval();
});

Deno.bench("none().lazy().map((n) => n + 1).eval()", async () => {
  await (none() as OptionInstance<number>).lazy().map((n) => n + 1).eval();
});

Deno.bench("Option.and(...)", async () => {
  await Option.and(
    Option.some(1),
    Promise.resolve(Option.some(2)),
    () => Option.some(3),
    () => Promise.resolve(Option.some(4)),
  );
});

Deno.bench("await Option.or(...)", async () => {
  await Option.or(
    none(),
    Promise.resolve(none()),
    () => none(),
    () => Promise.resolve(none()),
  );
});

Deno.bench("Option.or(...)", () => {
  Option.or(
    none(),
    none(),
    () => none(),
    () => none(),
  );
});

Deno.bench("await Option.or(...[len=1000])", async (t) => {
  const args = Array.from(
    { length: 1000 },
    (_, i) => {
      switch (i % 4) {
        case 1:
          return none();
        case 2:
          return Promise.resolve(none());
        case 3:
          return () => none();
        default:
          return () => Promise.resolve(none());
      }
    },
  );
  type Arg = typeof args[number];

  t.start();
  await Option.or(...args as [Arg, ...Arg[]]);
  t.end();
});

Deno.bench("Option.or(...[len=1000])", (t) => {
  const args = Array.from(
    { length: 1000 },
    (_, i) => {
      switch (i % 2) {
        case 1:
          return none();
        default:
          return () => none();
      }
    },
  );
  type Arg = typeof args[number];

  t.start();
  Option.or(...args as [Arg, ...Arg[]]);
  t.end();
});

Deno.bench("Option.lazy()...eval()", async () => {
  await Option.lazy(() => none())
    .or(() => none())
    .or(() => Promise.resolve(none()))
    .or(() => none())
    .or(() => Promise.resolve(some(1)))
    .and(() => some(2))
    .and(() => Promise.resolve(some(3)))
    .and((n) => some(n + 1))
    .and((n) => Promise.resolve(some(n + 1)))
    .map((n) => n + 1)
    .map((n) => Promise.resolve(n + 1))
    .eval();
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

Deno.bench("Array.from(Some(1))", () => {
  Array.from(Option.some(1));
});

Deno.bench("Array.from(None)", () => {
  Array.from(Option.none());
});

Deno.bench("Option.and(...[len=1000])", async (t) => {
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
  await Option.and(...args);
  t.end();
});
