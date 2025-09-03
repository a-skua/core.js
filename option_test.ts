import {
  assert,
  assertEquals,
  assertObjectMatch,
  assertThrows,
} from "@std/assert";
import {
  isNone,
  isSome,
  type None,
  none,
  Option,
  OptionInstance,
  type Some,
  some,
} from "./option.ts";
import { Result } from "./result.ts";

Deno.test("Option", async (t) => {
  const tests = [
    [{ some: true, value: 1 }, Option.some(1)],
    [{ some: false }, Option.none()],
    [
      { some: false, value: 1 } as { some: boolean; value: number },
      Option.none(),
    ],
    // [{ some: false } as { some: boolean }, Option.none()],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`Option(${input}) => ${expected}`, () => {
      assertEquals(Option(input), expected);
    });
  }
});

Deno.test("OptionInstance", async (t) => {
  await t.step("(OptionInstance).toString", async (t) => {
    const tests = [
      [Option.some("value"), "Some(value)"],
      [Option.none(), "None"],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`${option}.toString() => ${expected}`, () => {
        assertEquals(`${option}`, expected);
      });
    }
  });

  await t.step("(OptionInstance).[Symbol.iterator]", async (t) => {
    const tests: [OptionInstance<unknown>, unknown[]][] = [
      [Option.some("value"), ["value"]],
      [Option.none(), []],
    ];

    for (const [option, expected] of tests) {
      await t.step(`for (const v of ${option})`, () => {
        let i = 0;
        for (const value of option) {
          assertEquals(value, expected[i++]);
        }
        assertEquals(i, expected.length);
      });
    }

    for (const [option, expected] of tests) {
      await t.step(`Array.from(${option}) => [${expected}]`, () => {
        assertEquals(Array.from(option), expected);
      });
    }

    for (const [input, expected] of tests) {
      await t.step(`[...Option(${input})] => [${expected}]`, () => {
        assertEquals([...Option(input)], expected);
      });
    }
  });

  await t.step("(OptionInstance).toResult", async (t) => {
    const tests: [
      OptionInstance<unknown>,
      unknown[],
      Result<unknown, unknown>,
    ][] = [
      [Option.some("value"), [], Result.ok("value")],
      [Option.none(), [], Result.err(new Error("None"))],
      [Option.some("value"), ["is none"], Result.ok("value")],
      [Option.none(), ["is none"], Result.err("is none")],
    ];

    for (const [option, args, expected] of tests) {
      await t.step(`${option}.toResult(${args}) => ${expected}`, () => {
        assertEquals(option.toResult(...args), expected);
      });
    }
  });

  await t.step("(OptionInstance).andThen", async (t) => {
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
  });

  await t.step("(OptionInstance).and", async (t) => {
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
  });

  await t.step("(OptionInstance).orElse", async (t) => {
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
  });

  await t.step("(OptionInstance).or", async (t) => {
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
  });

  await t.step("(OptionInstance).map", async (t) => {
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
  });

  await t.step("(OptionInstance).unwrap", async (t) => {
    const tests = [
      [Option.some(1), 1],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`${option}.unwrap() => ${expected}`, () => {
        assertEquals(option.unwrap(), expected);
      });
    }
  });

  await t.step("(OptionInstance).unwrap => throw", async (t) => {
    const tests = [
      [Option.none(), Error],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`${option}.unwrap() => throw ${expected}`, () => {
        assertThrows(() => option.unwrap(), expected);
      });
    }
  });

  await t.step("(OptionInstance).unwrapOr", async (t) => {
    const tests = [
      [Option.some(1), 0, 1],
      [Option.none<number>(), 0, 0],
    ] as const;

    for (const [option, value, expected] of tests) {
      await t.step(`${option}.unwrapOr(${value}) => ${expected}`, () => {
        assertEquals(option.unwrapOr(value), expected);
      });
    }
  });

  await t.step("(OptionInstance).unwrapOrElse", async (t) => {
    const tests = [
      [Option.some(1), () => 2, 1],
      [Option.none<number>(), () => 2, 2],
    ] as const;

    for (const [option, fn, expected] of tests) {
      await t.step(`${option}.unwrapOrElse(${fn}) => ${expected}`, () => {
        assertEquals(option.unwrapOrElse(fn), expected);
      });
    }
  });
});

Deno.test("Option.some", async (t) => {
  const tests = [
    ["value", { some: true, value: "value" }],
    [1, { some: true, value: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`Option.some(${input}) => ${expected})`, () => {
      const actual = Option.some(input);
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("Option.none", async (t) => {
  const tests = [
    [{ some: false }],
  ] as const;

  for (const [expected] of tests) {
    await t.step(`Option.none() => ${expected})`, () => {
      const actual = Option.none();
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("Option.andThen", async (t) => {
  type Arg =
    | Promise<Option<unknown>>
    | Option<unknown>
    | (() => Promise<Option<unknown>>)
    | (() => Option<unknown>);

  const tests: [Arg[], Option<unknown>][] = [
    [
      [Option.some(1), Promise.resolve(Option.some("hello"))],
      Option.some([1, "hello"]),
    ],
    [[
      Option.some(1),
      Promise.resolve(Option.some(2)),
      () => Promise.resolve(Option.some(3)),
      () => Option.some(4),
    ], Option.some([1, 2, 3, 4])],
    [[
      Option.some(1),
      Promise.resolve(Option.some(2)),
      () => Promise.resolve(Option.some(3)),
      () => Option.none(),
    ], Option.none()],
  ];

  for (const [args, expected] of tests) {
    await t.step(`Option.andThen(${args})() => ${expected}`, async () => {
      assertEquals(await Option.andThen(...args), expected);
    });
  }
});

Deno.test("Option.orElse", async (t) => {
  type Arg =
    | Promise<Option<unknown>>
    | Option<unknown>
    | (() => Promise<Option<unknown>>)
    | (() => Option<unknown>);

  const tests: [[Arg, ...Arg[]], Option<unknown>][] = [
    [[
      Option.none(),
      Promise.resolve(Option.some(1)),
    ], Option.some(1)],
    [[
      () => Option.none(),
      () => Promise.resolve(Option.some("hello")),
    ], Option.some("hello")],
    [[
      Option.none(),
      Promise.resolve(Option.none()),
      () => Option.none(),
      () => Promise.resolve(Option.none()),
    ], Option.none()],
    [[
      Option.none(),
      Promise.resolve(Option.none()),
      () => Promise.resolve(Option.some(1)),
      () => Option.none(),
    ], Option.some(1)],
  ];

  for (const [args, expected] of tests) {
    await t.step(`(Option.orElse(${args}) => ${expected}`, async () => {
      assertEquals(await Option.orElse(...args), expected);
    });
  }
});

Deno.test("Option.lazy", async (t) => {
  const fn = (n: number) => n.toFixed(2);
  const tests = [
    [Option.some(1), Option.some("1.00")],
    [() => Option.some(2), Option.some("2.00")],
    [Promise.resolve(Option.some(3)), Option.some("3.00")],
    [() => Promise.resolve(Option.some(4)), Option.some("4.00")],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(
      `Option.lazy(${input}).map(${fn}).eval() => ${expected}`,
      async () => {
        assertEquals(await Option.lazy(input).map(fn).eval(), expected);
      },
    );
  }
});

Deno.test("OptionInstance.some", async (t) => {
  const tests = [
    ["value", { some: true, value: "value" }],
    [1, { some: true, value: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`OptionInstance.some(${input}) => ${expected})`, () => {
      const actual = OptionInstance.some(input);
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("OptionInstance.none", async (t) => {
  const tests = [
    [{ some: false }],
  ] as const;

  for (const [expected] of tests) {
    await t.step(`OptionInstance.none() => ${expected})`, () => {
      const actual = OptionInstance.none();
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("OptionInstance.andThen", async (t) => {
  type Arg =
    | Promise<OptionInstance<unknown>>
    | OptionInstance<unknown>
    | (() => Promise<OptionInstance<unknown>>)
    | (() => OptionInstance<unknown>);

  const tests: [Arg[], OptionInstance<unknown>][] = [
    [
      [OptionInstance.some(1), Promise.resolve(OptionInstance.some("hello"))],
      OptionInstance.some([1, "hello"]),
    ],
    [[
      OptionInstance.some(1),
      Promise.resolve(OptionInstance.some(2)),
      () => Promise.resolve(OptionInstance.some(3)),
      () => OptionInstance.some(4),
    ], OptionInstance.some([1, 2, 3, 4])],
    [[
      OptionInstance.some(1),
      Promise.resolve(OptionInstance.some(2)),
      () => Promise.resolve(OptionInstance.some(3)),
      () => OptionInstance.none(),
    ], OptionInstance.none()],
  ];

  for (const [args, expected] of tests) {
    await t.step(
      `OptionInstance.andThen(${args})() => ${expected}`,
      async () => {
        assertEquals(await OptionInstance.andThen(...args), expected);
      },
    );
  }
});

Deno.test("OptionInstance.orElse", async (t) => {
  type Arg =
    | Promise<OptionInstance<unknown>>
    | OptionInstance<unknown>
    | (() => Promise<OptionInstance<unknown>>)
    | (() => OptionInstance<unknown>);

  const tests: [[Arg, ...Arg[]], OptionInstance<unknown>][] = [
    [[
      OptionInstance.none(),
      Promise.resolve(OptionInstance.some(1)),
    ], OptionInstance.some(1)],
    [[
      () => OptionInstance.none(),
      () => Promise.resolve(OptionInstance.some("hello")),
    ], OptionInstance.some("hello")],
    [[
      OptionInstance.none(),
      Promise.resolve(OptionInstance.none()),
      () => OptionInstance.none(),
      () => Promise.resolve(OptionInstance.none()),
    ], OptionInstance.none()],
    [[
      OptionInstance.none(),
      Promise.resolve(OptionInstance.none()),
      () => Promise.resolve(OptionInstance.some(1)),
      () => OptionInstance.none(),
    ], OptionInstance.some(1)],
  ];

  for (const [args, expected] of tests) {
    await t.step(`(OptionInstance.orElse(${args}) => ${expected}`, async () => {
      assertEquals(await OptionInstance.orElse(...args), expected);
    });
  }
});

Deno.test("OptionInstance.lazy", async (t) => {
  const fn = (n: number) => n.toFixed(2);
  const tests = [
    [OptionInstance.some(1), OptionInstance.some("1.00")],
    [() => OptionInstance.some(2), OptionInstance.some("2.00")],
    [Promise.resolve(OptionInstance.some(3)), OptionInstance.some("3.00")],
    [
      () => Promise.resolve(OptionInstance.some(4)),
      OptionInstance.some("4.00"),
    ],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(
      `OptionInstance.lazy(${input}).map(${fn}).eval() => ${expected}`,
      async () => {
        assertEquals(await OptionInstance.lazy(input).map(fn).eval(), expected);
      },
    );
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

Deno.test("isSome", async (t) => {
  await t.step("true", () => {
    const a = some(1) as Option<number>;
    assert(isSome(a));

    const b: Some<number> = a;
    assertEquals(a, b);
  });

  await t.step("false", () => {
    const a = none() as Option<number>;
    assert(!isSome(a));

    const b: None = a;
    assertEquals(a, b);
  });
});

Deno.test("isNone", async (t) => {
  await t.step("true", () => {
    const a = none() as Option<number>;
    assert(isNone(a));

    const b: None = a;
    assertEquals(a, b);
  });

  await t.step("false", () => {
    const a = some(1) as Option<number>;
    assert(!isNone(a));

    const b: Some<number> = a;
    assertEquals(a, b);
  });
});
