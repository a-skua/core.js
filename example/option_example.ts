import { Option, type OptionInstance } from "@askua/core/option";

Option({ some: true, value: "some" });
Option<string>({ some: false });
Option(Option.some(1));
Option<number>(Option.none());
Option(foo());

Option<number>({ some: false })
  .map((n) => n + 1)
  .and<OptionInstance<number>>(Option.none())
  .and(Option.none())
  // .and({ some: false })
  // .and({ some: true, value: 1 })
  .and(Option.some(1))
  // .and(({ some: true, value: 1 }))
  // .and(({ some: false }))
  .andThen<OptionInstance<string>>(() => Option.none())
  .andThen(() => Option.some(1))
  // .andThen(() => ({ some: true, value: 1 }))
  // .andThen(() => ({ some: false }))
  .andThen((n) => n > 0 ? Option.some(n) : Option.none())
  .and(Option.some(0))
  .lazy()
  .map((n) => n + 1)
  .and<Option<number>>(Promise.resolve(Option.none()))
  .and(Promise.resolve(Option.some("")))
  // .and(({ some: true, value: 1 }))
  // .and(({ some: false }))
  .andThen<Option<number | string>>((s) =>
    s.length > 0 ? Option.some(s) : Option.none<number>()
  )
  .andThen(() => ({ some: true, value: 1 }))
  .andThen(() => ({ some: false }))
  .andThen(() => Promise.resolve(Option.some(1)))
  .andThen<Option<number>>(() => Promise.resolve(Option.none()))
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
  .orElse<OptionInstance<number>>(() => Option.none())
  .lazy()
  .eval();

Option.some(null)
  .lazy()
  .or(Option.some(""))
  .or<Option<number>>(Option.none())
  .map(() => Promise.resolve(1))
  .map((n) => Promise.resolve(!!n))
  .or({ some: true, value: 1 })
  .or({ some: false })
  .orElse(() => Option.some(1))
  .orElse<Option<symbol>>(() => Option.none())
  .orElse(() => ({ some: true, value: "" }))
  .orElse(() => ({ some: false }))
  .eval();

function foo(): OptionInstance<number> {
  return Option.some(1);
}

Option.orElse(
  Option.some(1),
  Option.none(),
  Option.some(""),
  Option.none(),
  { some: true, value: null },
  { some: false },
  foo,
  foo(),
);

Option.orElse<Option<number | string>>(
  Option.some(1),
  Option.none(),
  foo,
  foo(),
);

Option.andThen(
  Option.some(1),
  Option.none(),
  Option.some(""),
  Option.none(),
  { some: true, value: null },
  { some: false },
  foo,
  foo(),
);

Option.andThen<Option<[string, number]>>(
  Option.none(),
  Option.some(1),
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

Option.lazy(Option.some(1)).eval();
Option.lazy<Option<string>>(Option.none()).eval();
