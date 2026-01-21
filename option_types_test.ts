import { assert } from "@std/assert";
import { test } from "./types_test.ts";
import {
  type InferNone,
  type InferSome,
  isNone,
  isSome,
  type None,
  none,
  type NoneInstance,
  Option,
  type OptionInstance,
  type Some,
  some,
  type SomeInstance,
} from "./option.ts";
import { err, isErr, isOk, ok, type Result } from "./result.ts";

const optionNumber: OptionInstance<number> = some(Math.random())
  .filter((n) => n > 0.5);

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
  const option: SomeInstance<number> = some(1);
  test<Some<number>>(option);
  test<SomeInstance<number>>(option);
  test<Option<number>>(option);
  test<OptionInstance<number>>(option);
}

{
  const option = some(1);
  test<Some<number>>(option);
  test<OptionInstance<number>>(option);
}

{
  const option: NoneInstance<number> = none();
  test<None>(option);
  test<NoneInstance<number>>(option);
  test<Option<number>>(option);
  test<OptionInstance<number>>(option);
}

{
  const option = none<number>();
  test<None>(option);
  test<OptionInstance<number>>(option);
}

{
  const option = optionNumber.and(() => some("2"));
  test<OptionInstance<string>>(option);
}

{
  const andThen = (): Option<string> => ({ some: true, value: "2" });
  const option = optionNumber.and(andThen);
  test<Option<string>>(option);
}

{
  const option = optionNumber.and(() => ({ some: true, value: "2" }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and((n) => some(n.toString()));
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and((): OptionInstance<string> => some("2"));
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and((n): OptionInstance<string> =>
    some(n.toString())
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and<string>(() => some("2"));
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and<string>((n) => some(n.toString()));
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and<string>(
    (): OptionInstance<
      string
    > => some("2"),
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and<string>((
    n,
  ): OptionInstance<string> => some(n.toString()));
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and(() => ({ some: true, value: "2" }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and((n) => ({
    some: true,
    value: n.toString(),
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and((): Option<string> => ({
    some: true,
    value: "2",
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and((n): Option<string> => ({
    some: true,
    value: n.toString(),
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and<string, Option<string>>(() => ({
    some: true,
    value: "2",
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and<string, Option<string>>((n) => ({
    some: true,
    value: n.toString(),
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and<string, Option<string>>((): Option<
    string
  > => ({
    some: true,
    value: "2",
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and<string, Option<string>>((
    n,
  ): Option<string> => ({ some: true, value: n.toString() }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and(() => none());
  test<OptionInstance<never>>(option);
}

{
  const option = optionNumber.and((_) => none());
  test<OptionInstance<never>>(option);
}

{
  const option = optionNumber.and((): OptionInstance<string> => none());
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and((_): OptionInstance<string> => none());
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and<string>(() => none());
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and<string>((_) => none());
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and<string>(
    (): OptionInstance<
      string
    > => none(),
  );
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and<string>((
    _,
  ): OptionInstance<string> => none());
  test<OptionInstance<string>>(option);
}

{
  const option = optionNumber.and(() => ({ some: false }));
  test<Option<never>>(option);
}

{
  const option = optionNumber.and((_) => ({ some: false }));
  test<Option<never>>(option);
}

{
  const option = optionNumber.and((): Option<string> => ({
    some: false,
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and((_): Option<string> => ({
    some: false,
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and<string, Option<string>>(() => ({
    some: false,
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and<string, Option<string>>((_) => ({
    some: false,
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and<string, Option<string>>((): Option<
    string
  > => ({
    some: false,
  }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and<string, Option<string>>((
    _,
  ): Option<string> => ({ some: false }));
  test<Option<string>>(option);
}

{
  const option = optionNumber.and(() => ({ some: true, value: 1 }));
  test<Option<number>>(option);
}

{
  const option = optionNumber.and(() => ({ some: false }));
  test<Option<never>>(option);
  test<Option<number>>(option);
}

{
  const option = optionNumber.and(() => some(1));
  test<OptionInstance<number>>(option);
}

{
  const option = optionNumber.and(() => none());
  test<OptionInstance<never>>(option);
  test<OptionInstance<number>>(option);
}

{
  const option = optionNumber.and<number, Option<number>>(() => ({
    some: true,
    value: 1,
  }));
  test<Option<number>>(option);
}

{
  const option = optionNumber.and<number, Option<number>>(() => ({
    some: false,
  }));
  test<Option<number>>(option);
}

{
  const option = optionNumber.and<number, Option<number>>(() => some(1));
  test<Option<number>>(option);
}

{
  const option = optionNumber.and<number, Option<number>>(() => none());
  test<Option<number>>(option);
}

{
  const option = optionNumber.or(() => ({ some: true, value: "2" }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or(() => ({ some: false }));
  test<Option<number>>(option);
}

{
  const option = optionNumber.or(() => some("2"));
  test<OptionInstance<number | string>>(option);
}

{
  const option = optionNumber.or(() => none());
  test<OptionInstance<number>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => ({
    some: true,
    value: "2",
  }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => ({
    some: false,
  }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => some("2"));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => none());
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or(() => ({ some: true, value: "2" }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or(() => ({ some: false }));
  test<Option<number>>(option);
}

{
  const option = optionNumber.or(() => some("2"));
  test<OptionInstance<number | string>>(option);
}

{
  const option = optionNumber.or(() => none());
  test<OptionInstance<number>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => ({
    some: false,
  }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => some("2"));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => none());
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<string>(() => none());
  test<OptionInstance<number | string>>(option);
}

{
  const option = optionNumber.or<string>(() => some("2"));
  test<OptionInstance<number | string>>(option);
}

{
  const option = optionNumber.or<string>(() => none());
  test<OptionInstance<number | string>>(option);
}

{
  const option = optionNumber.or(() => ({ some: true, value: "2" }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or(() => ({ some: false }));
  test<Option<number>>(option);
}

{
  const option = optionNumber.or(() => some("2"));
  test<OptionInstance<number | string>>(option);
}

{
  const option = optionNumber.or(() => none());
  test<OptionInstance<number>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => ({
    some: true,
    value: "2",
  }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => ({
    some: false,
  }));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => some("2"));
  test<Option<number | string>>(option);
}

{
  const option = optionNumber.or<string, Option<string>>(() => none());
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
  const option = optionNumber;
  test<number | false>(option.unwrap(() => false));
}

{
  const option = some(1);
  test<number>(option.unwrap());
}

{
  const option = none<number>();
  test<number | "0">(option.unwrap(() => "0"));
}

{
  const option = some(1);
  test<number | string>(option.unwrap(() => "0"));
}

{
  const option = optionNumber.unwrap(() => "2" as const);
  test<number | "2">(option);
  test<number | string>(option);
}

{
  const option = optionNumber.unwrap(() => "2");
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
    .and(() => ({ some: true, value: 2 }))
    .and(() => Promise.resolve({ some: true, value: 3 }))
    .and((n) => ({ some: true, value: n + 1 }))
    .and((n) => Promise.resolve({ some: true, value: n + 1 }))
    .and(() => some(6))
    .and(() => Promise.resolve(some(7)))
    .and((n) => some(n + 1))
    .and((n) => Promise.resolve(some(n.toFixed(2))))
    .eval();
  test<Option<string>>(option);
}

{
  const option = await optionNumber
    .lazy()
    .and(() => ({ some: true, value: 2 }))
    .and(() => Promise.resolve({ some: true, value: 3 }))
    .and(() => some(4))
    .and(() => Promise.resolve(some("5")))
    .eval();
  test<Option<string>>(option);
}

{
  const option = await optionNumber
    .lazy()
    .or(() => ({ some: true, value: "2" as const }))
    .or(() => ({ some: false }))
    .or(() => Promise.resolve({ some: true, value: "3" as const }))
    .or(() => Promise.resolve({ some: false }))
    .or(() => some("4" as const))
    .or(() => none())
    .or(() => Promise.resolve(some("5" as const)))
    .or(() => Promise.resolve(none()))
    .eval();
  test<Option<number | "2" | "3" | "4" | "5">>(option);
}

{
  const option = await optionNumber
    .lazy()
    .or(() => ({ some: true, value: "2" as const }))
    .or(() => ({ some: false }))
    .or(() => Promise.resolve({ some: true, value: "3" as const }))
    .or(() => Promise.resolve({ some: false }))
    .or(() => some("4" as const))
    .or(() => none())
    .or(() => Promise.resolve(some("5" as const)))
    .or(() => Promise.resolve(none()))
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
  const option = await Option.and(
    optionNumber,
    Promise.resolve(optionNumber),
    () => optionNumber,
    () => Promise.resolve(optionNumber),
  );
  test<OptionInstance<[number, number, number, number]>>(option);
}

{
  const option = await Option.and(
    optionNumber as Option<number>,
    Promise.resolve(optionNumber as Option<number>),
    () => optionNumber as Option<number>,
    () => Promise.resolve(optionNumber as Option<number>),
  );
  test<Option<[number, number, number, number]>>(option);
}

{
  const option = Option.and(
    optionNumber,
    optionNumber,
    () => optionNumber,
    () => optionNumber,
  );
  test<OptionInstance<[number, number, number, number]>>(option);
}

{
  const option = Option.and(
    optionNumber as Option<number>,
    optionNumber as Option<number>,
    () => optionNumber as Option<number>,
    () => optionNumber as Option<number>,
  );
  test<Option<[number, number, number, number]>>(option);
}

{
  const option = Option.and(
    optionNumber,
    optionNumber as Option<number>,
    () => optionNumber,
    () => optionNumber as Option<number>,
  );
  test<Option<[number, number, number, number]>>(option);
}

{
  const option = await Option.and(
    { some: false } as Option<1>,
    Promise.resolve({ some: false } as Option<2>),
    () => ({ some: true, value: 3 as const }),
    () => Promise.resolve({ some: false } as Option<4>),
  );
  test<Option<[1, 2, 3, 4]>>(option);
}

{
  const option = Option.and(
    { some: false } as Option<1>,
    { some: false } as Option<2>,
    () => ({ some: true, value: 3 as const }),
    () => ({ some: false } as Option<4>),
  );
  test<Option<[1, 2, 3, 4]>>(option);
}

{
  const option = await Option.and(
    some("1" as const),
    Promise.resolve(some("2" as const)),
    () => some("3" as const),
    () => Promise.resolve(some("4" as const)),
  );
  test<OptionInstance<["1", "2", "3", "4"]>>(option);
}

{
  const option = Option.and(
    some("1" as const),
    some("2" as const),
    () => some("3" as const),
    () => (some("4" as const)),
  );
  test<OptionInstance<["1", "2", "3", "4"]>>(option);
}

{
  const option = await Option.or(
    optionNumber as Option<number>,
    Promise.resolve(optionNumber as Option<number>),
    () => optionNumber as Option<number>,
    () => Promise.resolve(optionNumber as Option<number>),
    () => some("hello") as Option<string>,
  );
  test<Option<number | string>>(option);
}

{
  const option = await Option.or(
    optionNumber,
    Promise.resolve(optionNumber),
    () => optionNumber,
    () => Promise.resolve(optionNumber),
    () => some("hello"),
  );
  test<OptionInstance<number | string>>(option);
}

{
  const option = await Option.or(
    optionNumber,
    Promise.resolve(optionNumber as Option<number>),
    () => optionNumber,
    () => Promise.resolve(optionNumber),
    () => some("hello"),
  );
  test<Option<number | string>>(option);
}

{
  const option = Option.or(
    optionNumber,
    none(),
    () => optionNumber,
    () => none(),
    () => some("hello"),
  );
  test<OptionInstance<number | string>>(option);
}

{
  const option = Option.or(
    optionNumber,
    none(),
    () => optionNumber as Option<number>,
    () => none(),
    () => some("hello"),
  );
  test<Option<number | string>>(option);
}

{
  const option = await Option.or(
    { some: false },
    Promise.resolve({ some: false }),
    () => ({ some: false }),
    () => Promise.resolve({ some: false }),
  );
  test<Option<number>>(option);
}

{
  const option = Option.or(
    { some: false },
    () => ({ some: false }),
  );
  test<Option<number>>(option);
}

{
  const option = await Option.or(
    some(1),
    none(),
    Promise.resolve(some("2")),
    Promise.resolve(none()),
    () => some(3),
    () => none(),
    () => Promise.resolve(some("4")),
    () => Promise.resolve(none()),
  );
  test<OptionInstance<number | string>>(option);
}

{
  const option = Option.or(
    some(1),
    none(),
    some("2"),
    none(),
    () => some(3),
    () => none(),
    () => some("4"),
    () => none(),
  );
  test<OptionInstance<number | string>>(option);
}

{
  const option = await Option.lazy(optionNumber).eval();
  test<OptionInstance<number>>(option);
}

{
  const option = await Option.lazy(Option.and(
    optionNumber,
    optionNumber,
    optionNumber,
  )).eval();
  test<OptionInstance<[number, number, number]>>(option);
}

{
  const option = await Option.lazy<string>(none())
    .or(() => some(1))
    .eval();
  test<Option<string | number>>(option);
}

{
  const option = await Option.lazy(Option.and(
    optionNumber,
  )).eval();
  test<OptionInstance<[number]>>(option);
}

{
  const option = await Option.lazy(Option.or(
    () => optionNumber,
    () => optionNumber,
    () => optionNumber,
  ))
    .map((n) => n + 1)
    .or(() => some("some"))
    .eval();
  test<number | string>(option.unwrap());
}

{
  const option = some(1) as Option<number>;
  const a = option as InferSome<typeof option, number>;
  test<Some<number>>(a);
  // test<None>(a);
  test<Option<number>>(a);
  // test<OptionInstance<number>>(a);
}

{
  const option = none() as Option<number>;
  const a = option as InferNone<typeof option, number>;
  // test<Some<number>>(a);
  test<None>(a);
  test<Option<number>>(a);
  // test<OptionInstance<number>>(a);
}

{
  const option = some(1) as OptionInstance<number>;
  const a = option as InferSome<typeof option, number>;
  test<Some<number>>(a);
  // test<None>(a);
  test<Option<number>>(a);
  // test<OptionInstance<number>>(a);
}

{
  const option = none() as OptionInstance<number>;
  const a = option as InferNone<typeof option, number>;
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

{
  const option = Option.fromResult(ok("OK!"));
  test<Some<string>>(option);
}

{
  const option = Option.fromResult(err("ERR!"), () => some(1));
  test<SomeInstance<number>>(option);
}

{
  const option = () => Option.fromResult(err("ERR!"));
  test<() => void>(option);
}

{
  const result = ok("OK!") as Result<string>;
  if (result.ok) {
    const option = Option.fromResult(result);
    test<OptionInstance<string>>(option);
  } else {
    const option = Option.fromResult(result);
    test<void>(option);
  }
}

{
  const result = ok("OK!") as Result<string>;
  if (isOk(result)) {
    const option = Option.fromResult(result);
    test<OptionInstance<string>>(option);
  } else {
    const option = Option.fromResult(result);
    test<void>(option);
  }
}

{
  const result = ok("OK!") as Result<string>;
  if (isErr(result)) {
    const option = Option.fromResult(result);
    test<void>(option);
  } else {
    const option = Option.fromResult(result);
    test<OptionInstance<string>>(option);
  }
}

{
  const option = Option.fromNullable("not null");
  test<Some<string>>(option);
}

{
  const option = Option.fromNullable(null);
  test<None>(option);
}

{
  const option = Option.fromNullable(undefined);
  test<None>(option);
}

{
  const value = "non-null value" as string | null | undefined;
  const option = Option.fromNullable(value);
  test<OptionInstance<string>>(option);
}

{
  const option = Option.fromNullable(0);
  test<Some<number>>(option);
}

{
  const option = Option.fromNullable(null);
  test<None>(option);
}

{
  const option = Option.fromNullable(undefined);
  test<None>(option);
}

{
  const value = 0 as number | null | undefined;
  const option = Option.fromNullable(value);
  test<OptionInstance<number>>(option);
}

{
  const option = some(1).filter((n) => n > 0).map((n) => n + 1);
  test<OptionInstance<number>>(option);
}

{
  const isOne = (n: number): n is 1 => n === 1;
  const option = some(1).filter(isOne);
  test<OptionInstance<1>>(option);
}

{
  const option = some(0).filter((n) => n > 0).map((n) => n + 1);
  test<OptionInstance<number>>(option);
}

{
  const option = none<number>().filter((n) => n > 0).map((n) => n + 1);
  test<OptionInstance<number>>(option);
}

{
  const option = none<number>().filter((n) => n > 0);
  test<OptionInstance<number>>(option);
}

{
  const option = await some(1).lazy()
    .filter((n) => n > 0).map((n) => n + 1).eval();
  test<OptionInstance<number>>(option);
}

{
  const option = await some(1).lazy()
    .filter((n) => Promise.resolve(n > 0)).map((n) => n + 1).eval();
  test<OptionInstance<number>>(option);
}

{
  const option = await some(0).lazy()
    .filter((n) => n > 0).map((n) => n + 1).eval();
  test<OptionInstance<number>>(option);
}

{
  const option = await some(0).lazy()
    .filter((n) => Promise.resolve(n > 0)).map((n) => n + 1).eval();
  test<OptionInstance<number>>(option);
}

{
  const option: OptionInstance<number> = none();
  const a = await option.lazy()
    .filter((n) => n > 0).map((n) => n + 1).eval();
  test<OptionInstance<number>>(a);
}

{
  const option: OptionInstance<number> = none();
  const a = await option.lazy()
    .filter((n) => n > 0).eval();
  test<OptionInstance<number>>(a);
}

{
  const option: OptionInstance<number> = none();
  const a = await option.lazy()
    .filter((n) => n > 0)
    .and((value) => ({ some: true, value }))
    .map((n) => n + 1)
    .eval();
  test<Option<number>>(a);
}
