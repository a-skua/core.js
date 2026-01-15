import type { OrFunction, OrPromise } from "./types.ts";
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
  type OptionInstance,
  type Some,
  some,
} from "./option.ts";
import { err, ok, type Result } from "./result.ts";

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

  await t.step("(OptionInstance).and", async (t) => {
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
        await t.step(`${option}.and(${fn}) => ${expected}`, () => {
          assertEquals(option.and(fn), expected);
        });
      }
    }

    {
      const tests: [
        OptionInstance<number>,
        () => Option<unknown> & OptionInstance<unknown>,
        Option<unknown>,
      ][] = [
        [some(1), () => some(2), some(2)],
        [some(1), () => none(), none()],
        [none(), () => some(2), none()],
        [some(1), () => some("1"), some("1")],
        [none(), () => some("1"), none()],
      ] as const;

      for (const [option, andThen, expected] of tests) {
        await t.step(`${option}.and(${andThen}) => ${expected}`, () => {
          assertEquals(option.and(andThen), expected);
        });
      }
    }
  });

  await t.step("(OptionInstance).or", async (t) => {
    const orElse = () => Option.some(0);
    const tests: [OptionInstance<number>, Option<number>][] = [
      [Option.some(1), Option.some(1)],
      [Option.none(), Option.some(0)],
    ];

    for (const [option, expected] of tests) {
      await t.step(`${option}.or(${orElse}) => ${expected}`, () => {
        assertEquals(option.or(orElse), expected);
      });
    }
    {
      const orElse = () => some(0);
      const tests: [OptionInstance<number>, Option<number>][] = [
        [some(1), some(1)],
        [none(), some(0)],
      ];

      for (const [option, expected] of tests) {
        await t.step(`${option}.or(${orElse}) => ${expected}`, () => {
          assertEquals(option.or(orElse), expected);
        });
      }
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

  await t.step("(OptionInstance).filter", async (t) => {
    const tests: [
      OptionInstance<number>,
      (n: number) => boolean,
      Option<number>,
    ][] = [
      [some(1), (n) => n > 0, some(1)],
      [some(0), (n) => n > 0, none()],
      [none(), (n) => n > 0, none()],
    ] as const;

    for (const [option, fn, expected] of tests) {
      await t.step(`${option}.filter(${fn}) => ${expected}`, () => {
        assertEquals(option.filter(fn), expected);
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

  await t.step("(OptionInstance).unwrap(orElse)", async (t) => {
    const tests: [OptionInstance<number>, () => number, number][] = [
      [some(1), () => -1, 1],
      [none(), () => -1, -1],
    ];

    for (const [option, orElse, expected] of tests) {
      await t.step(`${option}.unwrap(${orElse}) => ${expected}`, () => {
        assertEquals(option.unwrap(orElse), expected);
      });
    }
  });

  await t.step("(OptionInstance).unwrap => throw", async (t) => {
    const tests = [
      [Option.none(), Error],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`${option}.unwrap() => throw ${expected}`, () => {
        assertThrows(() => option.unwrap());
      });
    }
  });

  await t.step("(OptionInstance).unwrap", async (t) => {
    const tests: [OptionInstance<number>, () => number, number][] = [
      [some(1), () => 0, 1],
      [none(), () => 0, 0],
    ] as const;

    for (const [option, orElse, expected] of tests) {
      await t.step(`${option}.unwrap(${orElse}) => ${expected}`, () => {
        assertEquals(option.unwrap(orElse), expected);
      });
    }
  });

  await t.step("(OptionInstance).unwrap", async (t) => {
    const tests: [OptionInstance<number>, () => number, number][] = [
      [some(1), () => 2, 1],
      [none(), () => 2, 2],
    ] as const;

    for (const [option, orElse, expected] of tests) {
      await t.step(`${option}.unwrap(${orElse}) => ${expected}`, () => {
        assertEquals(option.unwrap(orElse), expected);
      });
    }
  });

  await t.step("(OptionInstance).lazy", async (t) => {
    const tests: [
      OptionInstance<OrPromise<number>>,
      (n: number) => number,
      OptionInstance<number>,
    ][] = [
      [some(1), (n) => n + 1, some(2)],
      [some(Promise.resolve(1)), (n) => n + 1, some(2)],
      [none(), (n) => n + 1, none()],
    ] as const;

    for (const [option, fn, expected] of tests) {
      await t.step(`${option}.lazy() => ${expected}`, async () => {
        const actual = await option.lazy().map(fn).eval();
        assertEquals(actual, expected);
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

Deno.test("Option.and", async (t) => {
  {
    type Arg = OrFunction<OrPromise<Option<unknown>>>;

    const tests: [[Arg, ...Arg[]], Option<unknown>][] = [
      [
        [
          some(1),
          Promise.resolve(some("hello")),
        ],
        some([1, "hello"]),
      ],
      [
        [
          some(1),
          Promise.resolve(some(2)),
          () => Promise.resolve(some(3)),
          () => some(4),
        ],
        Option.some([1, 2, 3, 4]),
      ],
      [
        [
          some(1),
          Promise.resolve(some(2)),
          () => Promise.resolve(some(3)),
          () => none(),
        ],
        Option.none(),
      ],
    ];

    for (const [args, expected] of tests) {
      await t.step(`await Option.and(${args})() => ${expected}`, async () => {
        assertEquals(await Option.and(...args), expected);
      });
    }
  }

  {
    type Arg = OrFunction<Option<unknown>>;

    const tests: [[Arg, ...Arg[]], Option<unknown>][] = [
      [
        [
          some(1),
          some("hello"),
        ],
        Option.some([1, "hello"]),
      ],
      [
        [
          some(1),
          some(2),
          () => some(3),
          () => some(4),
        ],
        Option.some([1, 2, 3, 4]),
      ],
      [
        [
          some(1),
          some(2),
          () => some(3),
          () => none(),
        ],
        Option.none(),
      ],
    ];

    for (const [args, expected] of tests) {
      await t.step(`Option.and(${args})() => ${expected}`, () => {
        assertEquals(Option.and(...args), expected);
      });
    }
  }
});

Deno.test("Option.or", async (t) => {
  {
    type Arg = OrFunction<OrPromise<Option<unknown>>>;

    const tests: [[Arg, ...Arg[]], Option<unknown>][] = [
      [
        [
          none(),
          Promise.resolve(some(1)),
        ],
        some(1),
      ],
      [
        [
          () => none(),
          () => Promise.resolve(some("hello")),
        ],
        some("hello"),
      ],
      [
        [
          none(),
          Promise.resolve(none()),
          () => none(),
          () => Promise.resolve(none()),
        ],
        none(),
      ],
      [
        [
          none(),
          Promise.resolve(none()),
          () => Promise.resolve(some(1)),
          () => none(),
        ],
        some(1),
      ],
    ];

    for (const [args, expected] of tests) {
      await t.step(`(await Option.or(${args}) => ${expected}`, async () => {
        assertEquals(await Option.or(...args), expected);
      });
    }
  }

  {
    type Arg = OrFunction<Option<unknown>>;

    const tests: [[Arg, ...Arg[]], Option<unknown>][] = [
      [
        [
          none(),
          some(1),
        ],
        some(1),
      ],
      [
        [
          () => none(),
          () => some("hello"),
        ],
        some("hello"),
      ],
      [
        [
          none(),
          () => none(),
          none(),
          () => none(),
        ],
        none(),
      ],
      [
        [
          none(),
          none(),
          () => some(1),
          () => none(),
        ],
        some(1),
      ],
    ];

    for (const [args, expected] of tests) {
      await t.step(`(Option.or(${args}) => ${expected}`, () => {
        assertEquals(Option.or(...args), expected);
      });
    }
  }
});

Deno.test("Option.lazy", async (t) => {
  const tests = [
    [some(1), (n: number) => n.toFixed(2), some("1.00")],
    [() => some(2), (n: number) => n.toFixed(2), some("2.00")],
    [Promise.resolve(some(3)), (n: number) => n.toFixed(2), some("3.00")],
    [() => Promise.resolve(some(4)), (n: number) => n.toFixed(2), some("4.00")],
  ] as const;

  for (const [input, fn, expected] of tests) {
    await t.step(
      `Option.lazy(${input}).map(${fn}).eval() => ${expected}`,
      async () => {
        assertEquals(await Option.lazy(input).map(fn).eval(), expected);
      },
    );
  }
});

Deno.test("Option.fromResult", async (t) => {
  {
    const tests: [
      Result<unknown, unknown>,
      () => Option<unknown>,
      Option<unknown>,
    ][] = [
      [ok(1), () => none(), some(1)],
      [err("error"), () => none(), none()],
    ];

    for (const [input, orElse, expected] of tests) {
      await t.step(
        `Option.fromResult(${input}, ${orElse}) => ${expected}`,
        () => assertEquals(Option.fromResult(input, orElse), expected),
      );
    }
  }

  {
    const tests = [
      [ok(1), some(1)],
    ] as const;

    for (const [input, expected] of tests) {
      await t.step(
        `Option.fromResult(${input}) => ${expected}`,
        () => assertEquals(Option.fromResult(input), expected),
      );
    }
  }

  {
    const tests = [
      [
        err("error"),
        (e: unknown) => {
          assertEquals(e, "error");
          return none();
        },
        none(),
      ],
    ] as const;

    for (const [input, orElse, expected] of tests) {
      await t.step(
        `Option.fromResult(${input}, ${orElse}) => ${expected}`,
        () => assertEquals(Option.fromResult(input, orElse), expected),
      );
    }
  }

  {
    const tests = [
      err(new Error("test")),
    ] as const;

    for (const input of tests) {
      await t.step(
        `Option.fromResult(${input}) => throw`,
        () => assertThrows(() => Option.fromResult(input)) as void,
      );
    }
  }
});

Deno.test("Option.fromNullable", async (t) => {
  const tests: [
    number | string | null | undefined,
    OptionInstance<number | string>,
  ][] = [
    [1, some(1)],
    [null, none()],
    [undefined, none()],
    ["value", some("value")],
  ];

  for (const [input, expected] of tests) {
    await t.step(
      `Option.fromNullable(${input}) => ${expected}`,
      () => assertEquals(Option.fromNullable(input), expected),
    );
  }
});

Deno.test("some", async (t) => {
  const tests = [
    ["value", { some: true, value: "value" }],
    [1, { some: true, value: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`OptionInstance.some(${input}) => ${expected})`, () => {
      const actual = some(input);
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("none", async (t) => {
  const tests = [
    [{ some: false }],
  ] as const;

  for (const [expected] of tests) {
    await t.step(`OptionInstance.none() => ${expected})`, () => {
      const actual = none();
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("Lazy", async (t) => {
  await t.step("(Lazy).and", async (t) => {
    {
      const lazy = some(1)
        .lazy()
        .and((n) => Promise.resolve(some(n + 1)))
        .and((n) => some(n + 1));

      const expected = Option.some(3);
      await t.step(`${lazy}.eval() => ${expected}`, async () => {
        assertEquals(await lazy.eval(), expected);
      });
    }

    {
      const lazy = some(1)
        .lazy()
        .and(() => Promise.resolve(some(2)))
        .and(() => some(3));

      const expected = some(3);
      await t.step(`${lazy}.eval() => ${expected}`, async () => {
        assertEquals(await lazy.eval(), expected);
      });
    }
  });

  await t.step("(Lazy).or", async (t) => {
    const option: OptionInstance<number> = none();
    const lazy = option
      .lazy()
      .or(() => Promise.resolve(Option.none()))
      .or(() => Option.some(3));

    const expected = Option.some(3);
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).or", async (t) => {
    const option: OptionInstance<number> = none();
    const lazy = option
      .lazy()
      .or(() => Promise.resolve(none()))
      .or(() => some(3));

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

  await t.step("(Lazy).filter", async (t) => {
    const tests = [
      [some(1).lazy().filter((n) => n > 0), some(1)],
      [some(1).lazy().filter((n) => Promise.resolve(n > 0)), some(1)],
      [some(0).lazy().filter((n) => n > 0), none()],
      [some(0).lazy().filter((n) => Promise.resolve(n > 0)), none()],
      [(none() as OptionInstance<number>).lazy().filter((n) => n > 0), none()],
      [
        (none() as OptionInstance<number>).lazy().filter((n) =>
          Promise.resolve(n > 0)
        ),
        none(),
      ],
    ] as const;

    for (const [lazy, expected] of tests) {
      await t.step(`${lazy}.eval() => ${expected}`, async () => {
        assertEquals(await lazy.eval(), expected);
      });
    }
  });

  await t.step("(Lazy).toString", async (t) => {
    const tests = [
      [
        Option.lazy(some(1)),
        "Lazy<Some(1)>",
      ],
      [
        Option.lazy(some(1))
          .map((n) => n + 1),
        "Lazy<Some(1).map((n)=>n + 1)>",
      ],
      [
        Option.lazy(some(1))
          .filter((n) => n > 0)
          .map((n) => n + 1),
        "Lazy<Some(1).filter((n)=>n > 0).map((n)=>n + 1)>",
      ],
      [
        Option.lazy(some(1))
          .map((n) => n + 1)
          .and((n) => some(n + 1)),
        "Lazy<Some(1).map((n)=>n + 1).and((n)=>some(n + 1))>",
      ],
      [
        Option.lazy(some(1))
          .map((n) => n + 1)
          .and((n) => some(n + 1))
          .and(() => none()),
        "Lazy<Some(1).map((n)=>n + 1).and((n)=>some(n + 1)).and(()=>none())>",
      ],
      [
        Option.lazy(some(1))
          .map((n) => n + 1)
          .and((n) => some(n + 1))
          .and(() => none())
          .or(() => none()),
        "Lazy<Some(1).map((n)=>n + 1).and((n)=>some(n + 1)).and(()=>none()).or(()=>none())>",
      ],
      [
        Option.lazy(some(1))
          .map((n) => n + 1)
          .and((n) => some(n + 1))
          .and(() => none())
          .or(() => none())
          .or(() => some(1)),
        "Lazy<Some(1).map((n)=>n + 1).and((n)=>some(n + 1)).and(()=>none()).or(()=>none()).or(()=>some(1))>",
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
