import { assertEquals, assertObjectMatch, assertThrows } from "@std/assert";
import { Result } from "./result.ts";
import type { ResultInstance } from "./result.ts";
import { Option } from "./option.ts";

Deno.test("ResultInstance", async (t) => {
  {
    const tests = [
      [Result.ok("value"), "Ok(value)"],
      [Result.err("error"), "Err(error)"],
    ] as const;

    for (const [result, expected] of tests) {
      await t.step(`${result}.toString() => ${expected}`, () => {
        assertEquals(`${result}`, expected);
      });
    }
  }

  {
    const tests = [
      [Result.ok("value"), ["value"]],
      [Result.err("error"), []],
    ] as const;

    for (const [result, expected] of tests) {
      await t.step(`for of ${result}`, () => {
        let i = 0;
        for (const value of result) {
          assertEquals(value, expected[i++]);
        }
        assertEquals(i, expected.length);
      });
    }
  }

  {
    const tests = [
      [Result.ok("value"), ["value"] as string[]],
      [Result.err("error"), [] as string[]],
    ] as const;

    for (const [result, expected] of tests) {
      await t.step(`Array.from(${result}) => [${expected}]`, () => {
        const array = Array.from(result);
        assertEquals(array, expected);
      });
    }
  }

  {
    const tests = [
      [Result.ok("value"), true],
      [Result.err("error"), true],
    ] as const;

    for (const [result, expected] of tests) {
      await t.step(`Symbol.iterator in ${result} => ${expected}`, () => {
        assertEquals(Symbol.iterator in result, expected);
      });
    }
  }

  {
    const tests: [ResultInstance<string, string>, Option<string>][] = [
      [Result.ok("value"), Option.some("value")],
      [Result.err("error"), Option.none()],
    ];

    for (const [result, expected] of tests) {
      await t.step(`${result}.toOption() => ${expected}`, () => {
        assertEquals(result.toOption(), expected);
      });
    }
  }

  {
    const tests = [
      [{ ok: true, value: "value" }, ["value"] as string[]],
      [{ ok: false, error: "error" }, []],
    ] as const;
    for (const [input, expected] of tests) {
      await t.step(`[...Result(${input})] => [${expected}]`, () => {
        assertEquals([...Result(input)], expected);
      });
    }
  }

  {
    const tests = [
      [{ ok: true, value: "value" }, "Ok(value)"],
      [{ ok: false, error: "error" }, "Err(error)"],
    ] as const;
    for (const [input, expected] of tests) {
      await t.step(`Result(${input}).toString() => ${expected}`, () => {
        assertEquals(Result(input).toString(), expected);
      });
    }
  }

  {
    const tests: [
      ResultInstance<number, string>,
      (n: number) => Result<number, string>,
      Result<number, string>,
    ][] = [
      [Result.ok(1), (n) => Result.ok(n + 1), Result.ok(2)],
      [Result.ok(1), () => Result.err("error"), Result.err("error")],
      [Result.err("error"), (n) => Result.ok(n + 1), Result.err("error")],
    ];

    for (const [result, fn, expected] of tests) {
      await t.step(`${result}.andThen(${fn}) => ${expected}`, () => {
        assertEquals(result.andThen(fn), expected);
      });
    }
  }

  {
    const tests: [
      ResultInstance<number, string>,
      Result<number, string>,
      ResultInstance<number, string>,
    ][] = [
      [Result.ok(1), Result.ok(2), Result.ok(2)],
      [Result.ok(1), Result.err("error"), Result.err("error")],
      [Result.err("error"), Result.ok(2), Result.err("error")],
    ];

    for (const [result, value, expected] of tests) {
      await t.step(`${result}.and(${value}) => ${expected}`, () => {
        assertEquals(result.and(value), expected);
      });
    }
  }

  {
    const tests: [
      ResultInstance<number, string>,
      (n: number) => number,
      Result<number, string>,
    ][] = [
      [Result.ok(1), (n) => n + 1, Result.ok(2)],
      [Result.err("error"), (n) => n + 1, Result.err("error")],
    ];

    for (const [result, fn, expected] of tests) {
      await t.step(`${result}.map(${fn}) => ${expected}`, () => {
        assertEquals(
          result.map(fn),
          expected as Result<number, string>,
        );
      });
    }
  }

  {
    const tests = [
      [Result.ok(1), 1],
    ] as const;

    for (const [result, expected] of tests) {
      await t.step(`${result}.unwrap() => ${expected}`, () => {
        assertEquals(result.unwrap(), expected);
      });
    }
  }

  {
    const tests = [
      [Result.err(new Error("error")), Error],
    ] as const;

    for (const [result, expected] of tests) {
      await t.step(`${result}.unwrap() => throw ${expected}`, () => {
        assertThrows(() => result.unwrap(), expected);
      });
    }
  }

  {
    const tests: [ResultInstance<number, Error>, number, number][] = [
      [Result.ok(1), 0, 1],
      [Result.err(new Error("error")), 0, 0],
    ] as const;

    for (const [result, defaultValue, expected] of tests) {
      await t.step(`${result}.unwrapOr(${defaultValue}) => ${expected}`, () => {
        assertEquals(result.unwrapOr(defaultValue), expected);
      });
    }
  }

  {
    const fn = (e: string) => Result.ok(e + "!!");
    const tests: [
      ResultInstance<number, string>,
      ResultInstance<number | string, string>,
    ][] = [
      [Result.ok(1), Result.ok(1)],
      [Result.err("error"), Result.ok("error!!")],
    ];

    for (const [result, expected] of tests) {
      await t.step(`${result}.orElse(${fn}) => ${expected}`, () => {
        assertEquals(result.orElse(fn), expected);
      });
    }
  }

  {
    const value = Result.ok(-1);
    const tests: [
      ResultInstance<number, string>,
      ResultInstance<number, string | Error>,
    ][] = [
      [Result.ok(1), Result.ok(1)],
      [Result.err("error"), Result.ok(-1)],
    ];

    for (const [result, expected] of tests) {
      await t.step(`${result}.or(${value}) => ${expected}`, () => {
        assertEquals(result.or(value), expected);
      });
    }
  }
});

Deno.test("Result.ok(...)", async (t) => {
  const tests = [
    ["value", { ok: true, value: "value" }],
    [1, { ok: true, value: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`Result.ok(${input}) => ${expected})`, () => {
      assertObjectMatch(Result.ok(input), expected);
    });
  }
});

Deno.test("Result.err(...)", async (t) => {
  const tests = [
    ["error", { ok: false, error: "error" }],
    [1, { ok: false, error: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`Result.err(${input}) => ${expected})`, () => {
      assertObjectMatch(Result.err(input), expected);
    });
  }
});

Deno.test("Result.andThen(...)", async (t) => {
  const getNumber = () => Result.ok<number>(1);
  const asyncGetNumber = () => Promise.resolve(Result.ok<number>(1));
  const getString = () => Result.ok<string>("hello");
  const asyncGetString = () => Promise.resolve(Result.ok<string>("hello"));
  const getError = () => Result.err("Error!!");

  const tests: [
    () => Promise<Result<unknown, unknown>>,
    Result<unknown, unknown>,
  ][] = [
    [() => Result.andThen(getNumber, getString), Result.ok([1, "hello"])],
    [
      () => Result.andThen(getNumber, getError, getString),
      Result.err("Error!!"),
    ],
    [
      () => Result.andThen(getNumber, getError, getString),
      Result.err("Error!!"),
    ],
    [() => Result.andThen(asyncGetNumber, getString), Result.ok([1, "hello"])],
    [() => Result.andThen(asyncGetString, getError), Result.err("Error!!")],
  ];

  for (const [fn, expected] of tests) {
    await t.step(`(${fn})() => ${expected}`, async () => {
      assertEquals(await fn(), expected);
    });
  }
});

Deno.test("Result.orElse(...)", async (t) => {
  const getNumber = () => Result.ok<number>(1);
  const asyncGetNumber = () => Promise.resolve(Result.ok<number>(1));
  const getString = () => Result.ok<string>("hello");
  const asyncGetString = () => Promise.resolve(Result.ok<string>("hello"));
  const getError = () => Result.err("Error!!");

  const tests: [
    () => Promise<Result<unknown, unknown>>,
    Result<unknown, unknown>,
  ][] = [
    [() => Result.orElse(getNumber, getString), Result.ok(1)],
    [() => Result.orElse(getError, getString), Result.ok("hello")],
    [() => Result.orElse(getError, getError), Result.err("Error!!")],
    [() => Result.orElse(asyncGetNumber, getString), Result.ok(1)],
    [() => Result.orElse(asyncGetString, getError), Result.ok("hello")],
  ];

  for (const [fn, expected] of tests) {
    await t.step(`(${fn})() => ${expected}`, async () => {
      assertEquals(await fn(), expected);
    });
  }
});
