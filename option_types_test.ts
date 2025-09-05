import { assert } from "@std/assert";
import { test } from "./types_test.ts";
import {
  type InferNone,
  type InferSome,
  isNone,
  isSome,
  type None,
  none,
  Option,
  type OptionInstance,
  type Some,
  some,
} from "./option.ts";

const optionNumber: OptionInstance<number> = Option.some(Math.random()).andThen(
  (n) => n > 0.5 ? Option.some(n) : Option.none(),
);

{
  const some = { some: true, value: 1 } as const;
  test<Some<number>>(some);
  test<Option<number>>(some);
}
{
  const none = { some: false } as const;
  test<None>(none);
  test<Option<number>>(none);
}

{
  const option = { some: Math.random() >= 0.5, value: 1 };
  test<Option<number>>(option);
}

{
  const some = Option({ some: true, value: 1 });
  test<Some<number>>(some);
  test<OptionInstance<number>>(some);
}

{
  const none = Option({ some: false });
  test<None>(none);
  test<OptionInstance<unknown>>(none);
}

{
  const option = Option({ some: Math.random() >= 0.5, value: 1 });
  test<OptionInstance<number>>(option);
}

{
  const some = Option<number>({ some: true, value: 1 });
  test<Some<number>>(some);
  test<OptionInstance<number>>(some);
}

{
  const none = Option<number>({ some: false });
  test<None>(none);
  test<OptionInstance<number>>(none);
}

{
  const option = Option<number>({ some: Math.random() >= 0.5, value: 1 });
  test<OptionInstance<number>>(option);
}

{
  const some = Option.some(1);
  test<Some<number>>(some);
  test<OptionInstance<number>>(some);
}

{
  const none = Option.none();
  test<None>(none);
  test<OptionInstance<number>>(none);
}

{
  const option = optionNumber.andThen(() => Option.some("2"));
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen((n) => Option.some(n.toString()));
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen((): OptionInstance<string> =>
    Option.some("2")
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen((n): OptionInstance<string> =>
    Option.some(n.toString())
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen<OptionInstance<string>>(() =>
    Option.some("2")
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen<OptionInstance<string>>((n) =>
    Option.some(n.toString())
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen<OptionInstance<string>>(
    (): OptionInstance<
      string
    > => Option.some("2"),
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen<OptionInstance<string>>((
    n,
  ): OptionInstance<string> => Option.some(n.toString()));
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen(() => ({ some: true, value: "2" }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen((n) => ({
    some: true,
    value: n.toString(),
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen((): Option<string> => ({
    some: true,
    value: "2",
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen((n): Option<string> => ({
    some: true,
    value: n.toString(),
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen<Option<string>>(() => ({
    some: true,
    value: "2",
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen<Option<string>>((n) => ({
    some: true,
    value: n.toString(),
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen<Option<string>>((): Option<string> => ({
    some: true,
    value: "2",
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen<Option<string>>((
    n,
  ): Option<string> => ({ some: true, value: n.toString() }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen(() => Option.none());
  test<OptionInstance<never>>(option);
}

{
  const option = optionNumber.andThen((_) => Option.none());
  test<OptionInstance<never>>(option);
}

{
  const option = optionNumber.andThen((): OptionInstance<string> =>
    Option.none()
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen((_): OptionInstance<string> =>
    Option.none()
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen<OptionInstance<string>>(() =>
    Option.none()
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen<OptionInstance<string>>((_) =>
    Option.none()
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen<OptionInstance<string>>(
    (): OptionInstance<
      string
    > => Option.none(),
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen<OptionInstance<string>>((
    _,
  ): OptionInstance<string> => Option.none());
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.andThen(() => ({ some: false }));
  test<Option<never>>(option);
}

{
  const option = optionNumber.andThen((_) => ({ some: false }));
  test<Option<never>>(option);
}

{
  const option = optionNumber.andThen((): Option<string> => ({
    some: false,
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen((_): Option<string> => ({
    some: false,
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen<Option<string>>(() => ({
    some: false,
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen<Option<string>>((_) => ({
    some: false,
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen<Option<string>>((): Option<string> => ({
    some: false,
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.andThen<Option<string>>((
    _,
  ): Option<string> => ({ some: false }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and({ some: true, value: 1 });
  test<Option<number>>(option);
}

{
  const option = optionNumber.and({ some: false });
  test<Option<never>>(option);
  test<Option<number>>(option);
}

{
  const option = optionNumber.and(Option.some(1));
  test<OptionInstance<number>>(option);
}

{
  const option = optionNumber.and(Option.none());
  test<OptionInstance<never>>(option);
  test<OptionInstance<number>>(option);
}

{
  const option = optionNumber.and<Option<number>>({ some: true, value: 1 });
  test<Option<number>>(option);
}

{
  const option = optionNumber.and<Option<number>>({ some: false });
  test<Option<number>>(option);
}

{
  const option = optionNumber.and<Option<number>>(Option.some(1));
  test<Option<number>>(option);
}

{
  const option = optionNumber.and<Option<number>>(Option.none());
  test<Option<number>>(option);
}

{
  const option = optionNumber.orElse(() => ({ some: true, value: "2" }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.orElse(() => ({ some: false }));
  test<Option<number>>(option);
}

{
  const option = optionNumber.orElse(() => Option.some("2"));
  test<OptionInstance<number | string>>(option);
}

{
  const option = optionNumber.orElse(() => Option.none());
  test<OptionInstance<number>>(option);
}

{
  const option = optionNumber.orElse<Option<string>>(() => ({
    some: true,
    value: "2",
  }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.orElse<Option<string>>(() => ({ some: false }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.orElse<Option<string>>(() => Option.some("2"));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.orElse<Option<string>>(() => Option.none());
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or({ some: true, value: "2" });
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or({ some: false });
  test<Option<number>>(option);
}

{
  const option = optionNumber.or(Option.some("2"));
  test<OptionInstance<number | string>>(option);
}

{
  const option = optionNumber.or(Option.none());
  test<OptionInstance<number>>(option);
}

{
  const option = optionNumber.or<Option<string>>({
    some: true,
    value: "2",
  });
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<Option<string>>({ some: false });
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<Option<string>>(Option.some("2"));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<Option<string>>(Option.none());
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.map(() => "2");
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.map((n) => n.toString());
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.map<string>(() => "2");
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.map<string>((n) => n.toString());
  test<OptionInstance<string>>(option);
}

try {
  const option = optionNumber.unwrap();
  test<number>(option);
} catch (e) {
  console.debug(e);
}

{
  const option = optionNumber.unwrapOr("2");
  test<number | "2">(option);
  test<number | string>(option);
}

{
  const option = optionNumber.unwrapOrElse(() => "2");
  test<number | string>(option);
}

{
  const option = await optionNumber
    .lazy()
    .eval();
  test<OptionInstance<number>>(option);
}

{
  const option = await optionNumber
    .lazy()
    .andThen(() => ({ some: true, value: 2 }))
    .andThen(() => Promise.resolve({ some: true, value: 3 }))
    .andThen((n) => ({ some: true, value: n + 1 }))
    .andThen((n) => Promise.resolve({ some: true, value: n + 1 }))
    .andThen(() => Option.some(6))
    .andThen(() => Promise.resolve(Option.some(7)))
    .andThen<Option<number>>((n) => Option.some(n + 1))
    .andThen<Option<string>>((n) => Promise.resolve(Option.some(n.toFixed(2))))
    .eval();
  test<Option<string>>(option);
}

{
  const option = await optionNumber
    .lazy()
    .and({ some: true, value: 2 })
    .and(Promise.resolve({ some: true, value: 3 }))
    .and(Option.some(4))
    .and(Promise.resolve(Option.some("5")))
    .eval();
  test<Option<string>>(option);
}

{
  const option = await optionNumber
    .lazy()
    .orElse(() => ({ some: true, value: "2" as const }))
    .orElse(() => ({ some: false }))
    .orElse(() => Promise.resolve({ some: true, value: "3" as const }))
    .orElse(() => Promise.resolve({ some: false }))
    .orElse(() => Option.some("4" as const))
    .orElse(() => Option.none())
    .orElse<Option<"5">>(() => Promise.resolve(Option.some("5")))
    .orElse<Option<number>>(() => Promise.resolve(Option.none()))
    .eval();
  test<Option<number | "2" | "3" | "4" | "5">>(option);
}

{
  const option = await optionNumber
    .lazy()
    .or({ some: true, value: "2" as const })
    .or({ some: false })
    .or(Promise.resolve({ some: true, value: "3" as const }))
    .or(Promise.resolve({ some: false }))
    .or(Option.some("4" as const))
    .or(Option.none())
    .or(Promise.resolve(Option.some("5" as const)))
    .or(Promise.resolve(Option.none()))
    .eval();
  test<Option<number | "2" | "3" | "4" | "5">>(option);
}

{
  const option = await optionNumber
    .lazy()
    .map<2>(() => 2)
    .map<3>(() => Promise.resolve(3))
    .map((n) => n + 1)
    .map((n) => Promise.resolve(n + 1))
    .map((n) => n.toFixed(2))
    .eval();
  test<OptionInstance<string>>(option);
}

{
  const option = await Option.andThen(
    optionNumber,
    Promise.resolve(optionNumber),
    () => optionNumber,
    () => Promise.resolve(optionNumber),
  );
  test<OptionInstance<[number, number, number, number]>>(option);
}

{
  const option = await Option.andThen(
    { some: false },
    Promise.resolve({ some: false }),
    () => ({ some: false as const }),
    () => Promise.resolve({ some: false as const }),
  );
  test<Option<[never, never, never, never]>>(option);
}

{
  const option = await Option.andThen<OptionInstance<["1", "2", "3", "4"]>>(
    Option.some("1"),
    Promise.resolve(Option.some("2")),
    () => Option.some("3"),
    () => Promise.resolve(Option.some("4")),
  );
  test<OptionInstance<["1", "2", "3", "4"]>>(option);
}

{
  const option = await Option.orElse<Option<number | string>>(
    optionNumber,
    Promise.resolve(optionNumber),
    () => optionNumber,
    () => Promise.resolve(optionNumber),
    (): Option<string> => Option.some("hello"),
  );
  test<Option<number | string>>(option);
}

{
  const option = await Option.orElse(
    { some: false },
    Promise.resolve({ some: false }),
    () => ({ some: false as const }),
    () => Promise.resolve({ some: false as const }),
  );
  test<Option<never>>(option);
}

{
  const option = await Option.orElse<OptionInstance<number | string>>(
    Option.some(1),
    Option.none(),
    Promise.resolve(Option.some("2")),
    Promise.resolve(Option.none()),
    () => Option.some(3),
    () => Option.none(),
    () => Promise.resolve(Option.some("4")),
    () => Promise.resolve(Option.none()),
  );
  test<OptionInstance<number | string>>(option);
}

{
  const option = await Option.orElse<OptionInstance<number | string>>(
    Option.some(1),
    Option.none(),
    Promise.resolve(Option.some("2")),
    Promise.resolve(Option.none()),
    () => Option.some(3),
    () => Option.none(),
    () => Promise.resolve(Option.some("4")),
    () => Promise.resolve(Option.none()),
  );
  test<OptionInstance<number | string>>(option);
}

{
  const option = await Option.lazy(optionNumber).eval();
  test<OptionInstance<number>>(option);
}

{
  const option = await Option.lazy(Option.andThen(
    optionNumber,
    optionNumber,
    optionNumber,
  )).eval();
  test<OptionInstance<[number, number, number]>>(option);
}

{
  const option = await Option.lazy<Option<string>>(Option.none())
    .or(Option.some(1))
    .eval();
  test<Option<string | number>>(option);
}

{
  const option = await Option.lazy<OptionInstance<[number]>>(Option.andThen(
    optionNumber,
  )).eval();
  test<OptionInstance<[number]>>(option);
}

{
  const option = await Option.lazy(Option.orElse(
    () => optionNumber,
    () => optionNumber,
    () => optionNumber,
  ))
    .map((n) => n + 1)
    .orElse(() => Option.some("some"))
    .eval();
  test<number | string>(option.unwrap());
}

{
  const option = some(1) as Option<number>;
  const a = option as InferSome<typeof option>;
  test<Some<number>>(a);
  // test<None>(a);
  test<Option<number>>(a);
  // test<OptionInstance<number>>(a);
}

{
  const option = none() as Option<number>;
  const a = option as InferNone<typeof option>;
  // test<Some<number>>(a);
  test<None>(a);
  test<Option<number>>(a);
  // test<OptionInstance<number>>(a);
}

{
  const option = some(1) as OptionInstance<number>;
  const a = option as InferSome<typeof option>;
  test<Some<number>>(a);
  // test<None>(a);
  test<Option<number>>(a);
  // test<OptionInstance<number>>(a);
}

{
  const option = none() as OptionInstance<number>;
  const a = option as InferNone<typeof option>;
  // test<Some<number>>(a);
  test<None>(a);
  test<Option<number>>(a);
  test<OptionInstance<number>>(a);
}

{
  const option = some(1) as Option<number>;
  assert(isSome(option));
  option.value;
  // option.map((n) => n + 1);
}

{
  const option = some(1) as OptionInstance<number>;
  assert(isSome(option));
  option.value;
  option.map((n) => n + 1);
}

{
  const option = none() as Option<number>;
  assert(isNone(option));
  // option.value;
  // option.map((n) => n + 1);
}

{
  const option = none() as OptionInstance<number>;
  assert(isNone(option));
  // option.value;
  option.map((n) => n + 1);
}
