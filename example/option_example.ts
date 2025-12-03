import { none, Option, type OptionInstance, some } from "@askua/core/option";

Option({ some: true, value: "some" });
Option<string>({ some: false });
Option(some(1));
Option<number>(none());
Option(foo());

Option<number>({ some: false })
  .map((n) => n + 1)
  .and<OptionInstance<number>>(() => none())
  .and(() => none())
  // .and({ some: false })
  // .and({ some: true, value: 1 })
  .and(() => some(1))
  // .and(({ some: true, value: 1 }))
  // .and(({ some: false }))
  .and<OptionInstance<string>>(() => none())
  .and(() => some(1))
  // .andThen(() => ({ some: true, value: 1 }))
  // .andThen(() => ({ some: false }))
  .and((n) => n > 0 ? some(n) : none())
  .and(() => some(0))
  .lazy()
  .map((n) => n + 1)
  .and<Option<number>>(() => Promise.resolve(none()))
  .and(() => Promise.resolve(some("")))
  // .and(({ some: true, value: 1 }))
  // .and(({ some: false }))
  .and<Option<number | string>>((s) => s.length > 0 ? some(s) : none<number>())
  .and(() => ({ some: true, value: 1 }))
  .and(() => ({ some: false }))
  .and(() => Promise.resolve(some(1)))
  .and<Option<number>>(() => Promise.resolve(none()))
  .eval();

some(null)
  .or(() => some(""))
  .or(() => none())
  .map((n) => !!n)
  // .or(foo())
  // .orElse(foo)
  // .or(({ some: true, value: 1 }))
  // .or(({ some: false }))
  // .orElse(() => ({ some: true, value: 1 }))
  // .orElse(() => ({ some: false }))
  .or(() => some(1))
  .or<OptionInstance<number>>(() => none())
  .lazy()
  .eval();

some(null)
  .lazy()
  .or(() => some(""))
  .or<Option<number>>(() => none())
  .map(() => Promise.resolve(1))
  .map((n) => Promise.resolve(!!n))
  .or(() => ({ some: true, value: 1 }))
  .or(() => ({ some: false }))
  .or(() => some(1))
  .or<Option<symbol>>(() => none())
  .or(() => ({ some: true, value: "" }))
  .or(() => ({ some: false }))
  .eval();

function foo(): OptionInstance<number> {
  return some(1);
}

Option.or(
  some(1),
  none(),
  some(""),
  none(),
  { some: true, value: null },
  { some: false },
  foo,
  foo(),
);

Option.or<Option<number | string>>(
  some(1),
  none(),
  foo,
  foo(),
);

Option.and(
  some(1),
  none(),
  some(""),
  none(),
  { some: true, value: null },
  { some: false },
  foo,
  foo(),
);

Option.and<Option<[string, number]>>(
  none(),
  some(1),
);

Option.lazy(some(1)).eval();
Option.lazy(none()).eval();
Option.lazy({ some: true, value: 1 }).eval();
Option.lazy({ some: false }).eval();
Option.lazy(() => some(1)).eval();
Option.lazy(() => none()).eval();
Option.lazy(() => ({ some: true, value: 1 })).eval();
Option.lazy(() => ({ some: false })).eval();

Option.lazy(Option.and(
  some(1),
  none(),
  some(""),
  none(),
  { some: true, value: null },
  { some: false },
)).eval();

Option.lazy(Option.and(
  some(""),
  none(),
  { some: true, value: null },
  { some: false },
  foo(),
  foo,
)).eval();

Option.lazy(Option.or(
  some(1),
  none(),
  some(""),
  none(),
  { some: true, value: null },
  { some: false },
)).eval();

Option.lazy(Option.or(
  some(""),
  none(),
  { some: true, value: null },
  { some: false },
  foo(),
  foo,
)).eval();

Option.lazy(some(1)).eval();
Option.lazy<Option<string>>(none()).eval();
