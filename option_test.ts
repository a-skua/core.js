import { assertEquals, assertObjectMatch, assertThrows } from "@std/assert";
import type { Instance as OptionInstance } from "./option.ts";
import { Option } from "./option.ts";
import { Result } from "./result.ts";

Deno.test("OptionInstance", async (t) => {
  {
    const tests = [
      [Option.some("value"), "Some(value)"],
      [Option.none(), "None"],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`${option}.toString() => ${expected}`, () => {
        assertEquals(`${option}`, expected);
      });
    }
  }

  {
    const tests = [
      [Option.some("value"), ["value"]],
      [Option.none(), []],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`for of ${option}`, () => {
        let i = 0;
        for (const value of option) {
          assertEquals(value, expected[i++]);
        }
        assertEquals(i, expected.length);
      });
    }
  }

  {
    const tests = [
      [Option.some("value"), ["value"] as string[]],
      [Option.none(), []],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`Array.from(${option}) => [${expected}]`, () => {
        assertEquals(Array.from(option), expected);
      });
    }
  }

  {
    const tests = [
      [Option.some("value"), true],
      [Option.none(), true],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`Symbol.iterator in ${option}`, () => {
        assertEquals(Symbol.iterator in option, expected);
      });
    }
  }

  {
    const tests: [OptionInstance<string>, Result<string>][] = [
      [Option.some("value"), Result.ok("value")],
      [Option.none(), Result.err(new Error("None"))],
    ];

    for (const [option, expected] of tests) {
      await t.step(`${option}.toResult() => ${expected}`, () => {
        assertEquals(option.toResult(), expected);
      });
    }
  }

  {
    const tests: [OptionInstance<string>, string, Result<string, string>][] = [
      [Option.some("value"), "is none", Result.ok("value")],
      [Option.none(), "is none", Result.err("is none")],
    ];

    for (const [option, input, expected] of tests) {
      await t.step(`${option}.toResult(${input}) => ${expected}`, () => {
        assertEquals(option.toResult(input), expected);
      });
    }
  }

  {
    const tests = [
      [{ some: true, value: "value" }, ["value"] as string[]],
      [{ some: false }, []],
    ] as const;

    for (const [input, expected] of tests) {
      await t.step(`[...Option(${input})] => [${expected}]`, () => {
        assertEquals([...Option(input)], expected);
      });
    }
  }

  {
    const tests = [
      [{ some: true, value: "value" }, "Some(value)"],
      [{ some: false }, "None"],
    ] as const;

    for (const [input, expected] of tests) {
      await t.step(`Option(${input}).toString() => ${expected}`, () => {
        assertEquals(Option(input).toString(), expected);
      });
    }
  }

  {
    const tests: [
      OptionInstance<number>,
      (n: number) => Option<unknown> & OptionInstance<unknown>,
      Option<unknown>,
    ][] = [
      [Option.some(1), (n) => Option.some(n + 1), Option.some(2)],
      [Option.some(1), () => Option.none(), Option.none()],
      [Option.none(), (n) => Option.some(n + 1), Option.none()],
      [Option.some(1), (n) => Option.some(`${n}`), Option.some("1")],
      [Option.none(), (n) => Option.some(`${n}`), Option.none()],
    ] as const;

    for (const [option, fn, expected] of tests) {
      await t.step(`${option}.andThen(${fn}) => ${expected}`, () => {
        assertEquals(option.andThen(fn), expected);
      });
    }
  }

  {
    const tests: [
      OptionInstance<number>,
      Option<unknown> & OptionInstance<unknown>,
      Option<unknown>,
    ][] = [
      [Option.some(1), Option.some(2), Option.some(2)],
      [Option.some(1), Option.none(), Option.none()],
      [Option.none(), Option.some(2), Option.none()],
      [Option.some(1), Option.some("1"), Option.some("1")],
      [Option.none(), Option.some("1"), Option.none()],
    ] as const;

    for (const [option, value, expected] of tests) {
      await t.step(`${option}.and(${value}) => ${expected}`, () => {
        assertEquals(option.and(value), expected);
      });
    }
  }

  {
    const tests: [
      OptionInstance<number>,
      (n: number) => number,
      Option<number>,
    ][] = [
      [Option.some(1), (n) => n + 1, Option.some(2)],
      [Option.none(), (n) => n + 1, Option.none()],
    ] as const;

    for (const [option, fn, expected] of tests) {
      await t.step(`${option}.map(${fn}) => ${expected}`, () => {
        assertEquals(option.map(fn), expected);
      });
    }
  }

  {
    const tests = [
      [Option.some(1), 1],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`${option}.unwrap() => ${expected}`, () => {
        assertEquals(option.unwrap(), expected);
      });
    }
  }

  {
    const tests = [
      [Option.none(), Error],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`${option}.unwrap() => throw ${expected}`, () => {
        assertThrows(() => option.unwrap(), expected);
      });
    }
  }

  {
    const tests = [
      [Option.some(1), 0, 1],
      [Option.none<number>(), 0, 0],
    ] as const;

    for (const [option, value, expected] of tests) {
      await t.step(`${option}.unwrapOr(${value}) => ${expected}`, () => {
        assertEquals(option.unwrapOr(value), expected);
      });
    }
  }

  {
    const fn = () => Option.some(0);
    const tests: [OptionInstance<number>, Option<number>][] = [
      [Option.some(1), Option.some(1)],
      [Option.none(), Option.some(0)],
    ];

    for (const [option, expected] of tests) {
      await t.step(`${option}.orElse(${fn}) => ${expected}`, () => {
        assertEquals(option.orElse(fn), expected);
      });
    }
  }

  {
    const value = Option.some(0);
    const tests: [OptionInstance<number>, Option<number>][] = [
      [Option.some(1), Option.some(1)],
      [Option.none(), Option.some(0)],
    ];

    for (const [option, expected] of tests) {
      await t.step(`${option}.or(${value}) => ${expected}`, () => {
        assertEquals(option.or(value), expected);
      });
    }
  }
});

Deno.test("Option.some(...)", async (t) => {
  const tests = [
    ["value", { some: true, value: "value" }],
    [1, { some: true, value: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`Option.some(${input}) => ${expected})`, () => {
      assertObjectMatch(Option.some(input), expected);
    });
  }
});

Deno.test("Option.none(...)", async (t) => {
  const tests = [
    [{ some: false }],
  ] as const;

  for (const [expected] of tests) {
    await t.step(`Option.none() => ${expected})`, () => {
      assertObjectMatch(Option.none(), expected);
    });
  }
});

Deno.test("Option.andThen(...)", async (t) => {
  const getNumber = () => Option.some(1);
  const getString = () => Option.some("hello");
  const asyncGetNumber = () => Promise.resolve(Option.some(1));
  const asyncGetString = () => Promise.resolve(Option.some("hello"));
  const getNone = () => Option.none();

  const tests: [() => Promise<Option<unknown>>, Option<unknown>][] = [
    [() => Option.andThen(getNumber, getString), Option.some([1, "hello"])],
    [() => Option.andThen(getNumber, getNone, getString), Option.none()],
    [
      () => Option.andThen(asyncGetNumber, getString),
      Option.some([1, "hello"]),
    ],
    [() => Option.andThen(asyncGetString, getNone), Option.none()],
  ];

  for (const [fn, expected] of tests) {
    await t.step(`(${fn})() => ${expected}`, async () => {
      assertEquals(await fn(), expected);
    });
  }
});

Deno.test("Option.orElse(...)", async (t) => {
  const getNumber = () => Option.some(1);
  const getString = () => Option.some("hello");
  const asyncGetNumber = () => Promise.resolve(Option.some(1));
  const asyncGetString = () => Promise.resolve(Option.some("hello"));
  const getNone = () => Option.none();

  const tests: [() => Promise<Option<unknown>>, Option<unknown>][] = [
    [() => Option.orElse(getNumber, getString), Option.some(1)],
    [() => Option.orElse(getNone, getString), Option.some("hello")],
    [() => Option.orElse(getNone, getNone), Option.none()],
    [() => Option.orElse(asyncGetNumber, getString), Option.some(1)],
    [() => Option.orElse(asyncGetString, getNone), Option.some("hello")],
  ];

  for (const [fn, expected] of tests) {
    await t.step(`(${fn})() => ${expected}`, async () => {
      assertEquals(await fn(), expected);
    });
  }
});

Deno.test("Lazy", async (t) => {
  await t.step("(Lazy).andThen", async (t) => {
    const lazy = Option.some(1)
      .lazy()
      .andThen((n) => Promise.resolve(Option.some(n + 1)))
      .andThen((n) => Option.some(n + 1));

    const expected = Option.some(3);
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).and", async (t) => {
    const lazy = Option.some(1)
      .lazy()
      .and(Promise.resolve(Option.some(2)))
      .and(Option.some(3));

    const expected = Option.some(3);
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).orElse", async (t) => {
    const lazy = Option.none<number>()
      .lazy()
      .orElse(() => Promise.resolve(Option.none()))
      .orElse(() => Option.some(3));

    const expected = Option.some(3);
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).or", async (t) => {
    const lazy = Option.none<number>()
      .lazy()
      .or(Promise.resolve(Option.none()))
      .or(Option.some(3));

    const expected = Option.some(3);
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).map", async (t) => {
    const lazy = Option.some(1)
      .lazy()
      .map((n) => Promise.resolve(n + 1))
      .map((n) => n + 1);

    const expected = Option.some(3);
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).toString", async (t) => {
    const tests = [
      [
        Option.lazy(Option.some(1)),
        "Lazy<Some(1)>",
      ],

      [
        Option.lazy(Option.some(1))
          .map((n) => n + 1),
        "Lazy<Some(1).map((n)=>n + 1)>",
      ],
      [
        Option.lazy(Option.some(1))
          .map((n) => n + 1)
          .andThen((n) => Option.some(n + 1)),
        "Lazy<Some(1).map((n)=>n + 1).andThen((n)=>Option.some(n + 1))>",
      ],
      [
        Option.lazy(Option.some(1))
          .map((n) => n + 1)
          .andThen((n) => Option.some(n + 1))
          .and(Option.none()),
        "Lazy<Some(1).map((n)=>n + 1).andThen((n)=>Option.some(n + 1)).and(None)>",
      ],
      [
        Option.lazy(Option.some(1))
          .map((n) => n + 1)
          .andThen((n) => Option.some(n + 1))
          .and(Option.none())
          .orElse(() => Option.none()),
        "Lazy<Some(1).map((n)=>n + 1).andThen((n)=>Option.some(n + 1)).and(None).orElse(()=>Option.none())>",
      ],
      [
        Option.lazy(Option.some(1))
          .map((n) => n + 1)
          .andThen((n) => Option.some(n + 1))
          .and(Option.none())
          .orElse(() => Option.none())
          .or(Option.some(1)),
        "Lazy<Some(1).map((n)=>n + 1).andThen((n)=>Option.some(n + 1)).and(None).orElse(()=>Option.none()).or(Some(1))>",
      ],
    ] as const;
    for (const [lazy, expected] of tests) {
      await t.step(`(Lazy).toString() => ${expected}`, () => {
        assertEquals(`${lazy}`, expected);
      });
    }
  });
});
