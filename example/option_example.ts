import { Instance as Option } from "@askua/core/option";

Option({ some: true, value: "some" });
Option<string>({ some: false });
Option(Option.some(1));
Option<number>(Option.none());
Option(foo());

Option({ some: false })
  .map((n) => n + 1)
  .and(Option.none())
  .and(Option.some(1))
  // .and(({ some: true, value: 1 }))
  // .and(({ some: false }))
  .andThen(() => Option.none())
  .andThen(() => Option.some(1))
  // .andThen(() => ({ some: true, value: 1 }))
  // .andThen(() => ({ some: false }))
  .andThen((n) => n > 0 ? Option.some(n) : Option.none())
  .and(Option.some(0))
  .lazy()
  .map((n) => n + 1)
  .and(Option.none())
  .and(Option.some(""))
  // .and(({ some: true, value: 1 }))
  // .and(({ some: false }))
  .andThen((s) => s.length > 0 ? Option.some(s) : Option.none<number>())
  .andThen(() => ({ some: true, value: 1 }))
  .andThen(() => ({ some: false }))
  .eval();

Option.some(null)
  .or(Option.some(""))
  .or(Option.none())
  .map((n) => !!n)
  // .or(foo())
  // .orElse(foo)
  // .or(({ some: true, value: 1 }))
  // .or(({ some: false }))
  // .orElse(() => ({ some: true, value: 1 }))
  // .orElse(() => ({ some: false }))
  .orElse(() => Option.some(1))
  .orElse(() => Option.none())
  .lazy()
  .eval();

Option.some(null)
  .lazy()
  .or(Option.some(""))
  .or(Option.none())
  .map(() => Promise.resolve(1))
  .map((n) => Promise.resolve(!!n))
  .or({ some: true, value: 1 })
  .or({ some: false })
  .orElse(() => Option.some(1))
  .orElse(() => Option.none())
  .orElse(() => ({ some: true, value: "" }))
  .orElse(() => ({ some: false }))
  .eval();

function foo(): Option<number> {
  return Option.some(1);
}

Option.orElse(
  Option.some(1),
  Option.none(),
  Option.some(""),
  Option.none(),
  { some: true, value: null },
  { some: false },
);

Option.andThen(
  Option.some(1),
  Option.none(),
  Option.some(""),
  Option.none(),
  { some: true, value: null },
  { some: false },
);

Option.lazy(Option.some(1)).eval();
Option.lazy(Option.none()).eval();
Option.lazy({ some: true, value: 1 }).eval();
Option.lazy({ some: false }).eval();
Option.lazy(() => Option.some(1)).eval();
Option.lazy(() => Option.none()).eval();
Option.lazy(() => ({ some: true, value: 1 })).eval();
Option.lazy(() => ({ some: false })).eval();

Option.lazy(Option.andThen(
  Option.some(1),
  Option.none(),
  Option.some(""),
  Option.none(),
  { some: true, value: null },
  { some: false },
)).eval();

Option.lazy(Option.andThen(
  Option.some(""),
  Option.none(),
  { some: true, value: null },
  { some: false },
  foo(),
  foo,
)).eval();

Option.lazy(Option.orElse(
  Option.some(1),
  Option.none(),
  Option.some(""),
  Option.none(),
  { some: true, value: null },
  { some: false },
)).eval();

Option.lazy(Option.orElse(
  Option.some(""),
  Option.none(),
  { some: true, value: null },
  { some: false },
  foo(),
  foo,
)).eval();
