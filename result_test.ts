import {
  assert,
  assertEquals,
  assertObjectMatch,
  assertThrows,
} from "@std/assert";
import { Instance, type Lazy, Result } from "./result.ts";
import { Option } from "./option.ts";

Deno.test("Instance", async (t) => {
  await t.step("(Instance).toString", async (t) => {
    const tests = [
      [Result.ok("value"), "Ok(value)"],
      [Result.err("error"), "Err(error)"],
    ] as const;

    for (const [result, expected] of tests) {
      await t.step(`${result}.toString() => ${expected}`, () => {
        assertEquals(`${result}`, expected);
      });
    }
  });

  await t.step("(Instance).[Symbol.iterator]", async (t) => {
    const tests: [Instance<unknown, unknown>, unknown[]][] = [
      [Result.ok("value"), ["value"]],
      [Result.err("error"), []],
    ];

    for (const [result, expected] of tests) {
      await t.step(`for (const v of ${result})`, () => {
        let i = 0;
        for (const value of result) {
          assertEquals(value, expected[i++]);
        }
        assertEquals(i, expected.length);
      });
    }

    for (const [result, expected] of tests) {
      await t.step(`Array.from(${result}) => [${expected}]`, () => {
        const array = Array.from(result);
        assertEquals(array, expected);
      });
    }

    for (const [input, expected] of tests) {
      await t.step(`[...${input}] => [${expected}]`, () => {
        assertEquals([...input], expected);
      });
    }
  });

  await t.step("(Instance).toOption", async (t) => {
    const tests: [Instance<string, string>, Option<string>][] = [
      [Result.ok("value"), Option.some("value")],
      [Result.err("error"), Option.none()],
    ];

    for (const [result, expected] of tests) {
      await t.step(`${result}.toOption() => ${expected}`, () => {
        assertEquals(result.toOption(), expected);
      });
    }
  });

  await t.step("(Instance).toString", async (t) => {
    const tests = [
      [Result.ok("value"), "Ok(value)"],
      [Result.err("error"), "Err(error)"],
    ] as const;

    for (const [input, expected] of tests) {
      await t.step(`${input}.toString() => ${expected}`, () => {
        assertEquals(input.toString(), expected);
      });
    }
  });

  await t.step("(Instance).andThen", async (t) => {
    const tests: [
      Instance<number, string>,
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
  });

  await t.step("(Instance).and", async (t) => {
    const tests: [
      Instance<number, string>,
      Result<number, string>,
      Instance<number, string>,
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
  });

  await t.step("(Instance).orElse", async (t) => {
    const fn = (e: string) => Result.ok(e + "!!");
    const tests: [
      Instance<number, string>,
      Instance<number | string, string>,
    ][] = [
      [Result.ok(1), Result.ok(1)],
      [Result.err("error"), Result.ok("error!!")],
    ];

    for (const [result, expected] of tests) {
      await t.step(`${result}.orElse(${fn}) => ${expected}`, () => {
        assertEquals(result.orElse(fn), expected);
      });
    }
  });

  await t.step("(Instance).or", async (t) => {
    const value = Result.ok(-1);
    const tests: [
      Instance<number, string>,
      Instance<number, string | Error>,
    ][] = [
      [Result.ok(1), Result.ok(1)],
      [Result.err("error"), Result.ok(-1)],
    ];

    for (const [result, expected] of tests) {
      await t.step(`${result}.or(${value}) => ${expected}`, () => {
        assertEquals(result.or(value), expected);
      });
    }
  });

  await t.step("(Instance).map", async (t) => {
    const tests: [
      Instance<number, string>,
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
  });

  await t.step("(Instance).unwrap", async (t) => {
    const tests = [
      [Result.ok(1), 1],
    ] as const;

    for (const [result, expected] of tests) {
      await t.step(`${result}.unwrap() => ${expected}`, () => {
        assertEquals(result.unwrap(), expected);
      });
    }
  });

  await t.step("(Instance).unwrap => throw", async (t) => {
    const tests = [
      [Result.err(new Error("error")), Error],
    ] as const;

    for (const [result, expected] of tests) {
      await t.step(`${result}.unwrap() => throw ${expected}`, () => {
        assertThrows(() => result.unwrap(), expected);
      });
    }
  });

  await t.step("(Instance).unwrapOr", async (t) => {
    const tests: [Instance<number, Error>, number, number][] = [
      [Result.ok(1), 0, 1],
      [Result.err(new Error("error")), 0, 0],
    ] as const;

    for (const [result, defaultValue, expected] of tests) {
      await t.step(`${result}.unwrapOr(${defaultValue}) => ${expected}`, () => {
        assertEquals(result.unwrapOr(defaultValue), expected);
      });
    }
  });

  await t.step("(Instance).unwrapOrElse", async (t) => {
    const tests: [Instance<number, Error>, (e: Error) => number, number][] = [
      [Result.ok(1), () => {
        assert(false);
      }, 1],
      [Result.err(new Error("error")), (e: Error) => {
        assertEquals(e, new Error("error"));
        return 0;
      }, 0],
    ] as const;

    for (const [result, fn, expected] of tests) {
      await t.step(`${result}.unwrapOrElse(${fn}) => ${expected}`, () => {
        assertEquals(result.unwrapOrElse(fn), expected);
      });
    }
  });
});

Deno.test("Result.ok", async (t) => {
  const tests = [
    ["value", { ok: true, value: "value" }],
    [1, { ok: true, value: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`Result.ok(${input}) => ${expected})`, () => {
      const actual = Result.ok(input);
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("Result.err", async (t) => {
  const tests = [
    ["error", { ok: false, error: "error" }],
    [1, { ok: false, error: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`Result.err(${input}) => ${expected})`, () => {
      const actual = Result.err(input);
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("Result.andThen", async (t) => {
  type Arg =
    | Promise<Result<unknown, unknown>>
    | Result<unknown, unknown>
    | (() => Promise<Result<unknown, unknown>>)
    | (() => Result<unknown, unknown>);

  const tests: [
    Arg[],
    Result<unknown, unknown>,
  ][] = [
    [[
      Result.ok(1),
      Promise.resolve(Result.ok(2)),
      () => Promise.resolve(Result.ok(3)),
      () => Result.ok(4),
    ], Result.ok([1, 2, 3, 4])],
    [[
      Result.ok(1),
      Promise.resolve(Result.ok(2)),
      () => Promise.resolve(Result.err("Error")),
      () => Result.ok(4),
    ], Result.err("Error")],
    [[
      Result.err("1"),
      Promise.resolve(Result.err("2")),
      () => Promise.resolve(Result.err("3")),
      () => Result.err("4"),
    ], Result.err("1")],
  ];

  for (const [args, expected] of tests) {
    await t.step(`Result.andThen(${args}) => ${expected}`, async () => {
      assertEquals(await Result.andThen(...args), expected);
    });
  }
});

Deno.test("Result.orElse", async (t) => {
  type Arg =
    | Promise<Result<unknown, unknown>>
    | Result<unknown, unknown>
    | (() => Promise<Result<unknown, unknown>>)
    | (() => Result<unknown, unknown>);

  const tests: [[Arg, ...Arg[]], Result<unknown, unknown>][] = [
    [[
      Result.err("Error"),
      Promise.resolve(Result.ok(1)),
      () => Result.ok(2),
      () => Result.ok(3),
    ], Result.ok(1)],
    [[
      () => Result.err("Error"),
      () => Result.ok(1),
      Result.ok(2),
      Promise.resolve(Result.ok(3)),
    ], Result.ok(1)],
    [[
      Result.err("1"),
      Promise.resolve(Result.err("2")),
      () => Result.err("3"),
      () => Promise.resolve(Result.err("4")),
    ], Result.err("4")],
  ];

  for (const [args, expected] of tests) {
    await t.step(`Result.orElse(${args}) => ${expected}`, async () => {
      assertEquals(await Result.orElse(...args), expected);
    });
  }
});

Deno.test("Result.lazy", async (t) => {
  type TestLazy = Lazy<number, Error, Result<number>>;

  const fn: Parameters<TestLazy["map"]>[0] = (n) => n.toFixed(2);

  const tests = [
    [Result.ok(1), Result.ok("1.00")],
    [() => Result.ok(2), Result.ok("2.00")],
    [Promise.resolve(Result.ok(3)), Result.ok("3.00")],
    [() => Promise.resolve(Result.ok(4)), Result.ok("4.00")],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(
      `Result.lazy(${input}).map(${fn}).eval() => ${expected}`,
      async () => {
        const lazy = Result.lazy(input) as TestLazy;
        assertEquals(await lazy.map(fn).eval(), expected);
      },
    );
  }
});

Deno.test("Instance.ok", async (t) => {
  const tests = [
    ["value", { ok: true, value: "value" }],
    [1, { ok: true, value: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`Instance.ok(${input}) => ${expected})`, () => {
      const actual = Instance.ok(input);
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("Instance.err", async (t) => {
  const tests = [
    ["error", { ok: false, error: "error" }],
    [1, { ok: false, error: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`Instance.err(${input}) => ${expected})`, () => {
      const actual = Instance.err(input);
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("Instance.andThen", async (t) => {
  type Arg =
    | Promise<Instance<unknown, unknown>>
    | Instance<unknown, unknown>
    | (() => Promise<Instance<unknown, unknown>>)
    | (() => Instance<unknown, unknown>);

  const tests: [
    Arg[],
    Instance<unknown, unknown>,
  ][] = [
    [[
      Instance.ok(1),
      Promise.resolve(Instance.ok(2)),
      () => Promise.resolve(Instance.ok(3)),
      () => Instance.ok(4),
    ], Instance.ok([1, 2, 3, 4])],
    [[
      Instance.ok(1),
      Promise.resolve(Instance.ok(2)),
      () => Promise.resolve(Instance.err("Error")),
      () => Instance.ok(4),
    ], Instance.err("Error")],
    [[
      Instance.err("1"),
      Promise.resolve(Instance.err("2")),
      () => Promise.resolve(Instance.err("3")),
      () => Instance.err("4"),
    ], Instance.err("1")],
  ];

  for (const [args, expected] of tests) {
    await t.step(`Instance.andThen(${args}) => ${expected}`, async () => {
      assertEquals(await Instance.andThen(...args), expected);
    });
  }
});

Deno.test("Instance.orElse", async (t) => {
  type Arg =
    | Promise<Instance<unknown, unknown>>
    | Instance<unknown, unknown>
    | (() => Promise<Instance<unknown, unknown>>)
    | (() => Instance<unknown, unknown>);

  const tests: [[Arg, ...Arg[]], Instance<unknown, unknown>][] = [
    [[
      Instance.err("Error"),
      Promise.resolve(Instance.ok(1)),
      () => Instance.ok(2),
      () => Instance.ok(3),
    ], Instance.ok(1)],
    [[
      () => Instance.err("Error"),
      () => Instance.ok(1),
      Instance.ok(2),
      Promise.resolve(Instance.ok(3)),
    ], Instance.ok(1)],
    [[
      Instance.err("1"),
      Promise.resolve(Instance.err("2")),
      () => Instance.err("3"),
      () => Promise.resolve(Instance.err("4")),
    ], Instance.err("4")],
  ];

  for (const [args, expected] of tests) {
    await t.step(`Instance.orElse(${args}) => ${expected}`, async () => {
      assertEquals(await Instance.orElse(...args), expected);
    });
  }
});

Deno.test("Instance.lazy", async (t) => {
  type TestLazy = Lazy<number, Error, Result<number>>;

  const fn: Parameters<TestLazy["map"]>[0] = (n) => n.toFixed(2);
  const tests = [
    [Instance.ok(1), Instance.ok("1.00")],
    [() => Instance.ok(2), Instance.ok("2.00")],
    [Promise.resolve(Instance.ok(3)), Instance.ok("3.00")],
    [() => Promise.resolve(Instance.ok(4)), Instance.ok("4.00")],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(
      `Instance.lazy(${input}).map(${fn}).eval() => ${expected}`,
      async () => {
        const lazy = Instance.lazy(input) as TestLazy;
        assertEquals(await lazy.map(fn).eval(), expected);
      },
    );
  }
});

Deno.test("Lazy", async (t) => {
  await t.step("(Lazy).andThen", async (t) => {
    const lazy = Result.lazy(Result.ok(1))
      .andThen((n) => Promise.resolve(Result.ok(n + 1)))
      .andThen((n) => Result.ok(n + 1));

    const expected = Result.ok(3) as Instance<number>;
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).and", async (t) => {
    const lazy = Result.lazy(Result.ok(1))
      .and(Promise.resolve(Result.ok(2)))
      .and(Result.ok(3));

    const expected = Result.ok(3) as Instance<number>;
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).orElse", async (t) => {
    const lazy = Result.lazy(Result.err("error"))
      .orElse((e) => Result.err(e + "!"))
      .orElse((e) => Result.err(e + "!"));

    const expected = Result.err("error!!");
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).or", async (t) => {
    const lazy = Result.lazy(Result.err("error"))
      .or(Promise.resolve(Result.err("error!")))
      .or(Result.err("error!!"));

    const expected = Result.err("error!!");
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).map", async (t) => {
    const lazy = Result.lazy(Result.ok(1))
      .map((n) => n + 1)
      .map((n) => n + 1);

    const expected = Result.ok(3) as Instance<number>;
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).toString", async (t) => {
    const tests = [
      [
        Result.lazy(Result.ok(1)),
        "Lazy<Ok(1)>",
      ],

      [
        Result.lazy(Result.ok(1))
          .map((n) => n + 1),
        "Lazy<Ok(1).map((n)=>n + 1)>",
      ],
      [
        Result.lazy(Result.ok(1))
          .map((n) => n + 1)
          .andThen((n) => Result.ok(n + 1)),
        "Lazy<Ok(1).map((n)=>n + 1).andThen((n)=>Result.ok(n + 1))>",
      ],
      [
        Result.lazy(Result.ok(1))
          .map((n) => n + 1)
          .andThen((n) => Result.ok(n + 1))
          .and(Result.err("error")),
        "Lazy<Ok(1).map((n)=>n + 1).andThen((n)=>Result.ok(n + 1)).and(Err(error))>",
      ],
      [
        Result.lazy(Result.ok(1))
          .map((n) => n + 1)
          .andThen((n) => Result.ok(n + 1))
          .and(Result.err("error"))
          .orElse((e) => Result.err(e)),
        "Lazy<Ok(1).map((n)=>n + 1).andThen((n)=>Result.ok(n + 1)).and(Err(error)).orElse((e)=>Result.err(e))>",
      ],
      [
        Result.lazy(Result.ok(1))
          .map((n) => n + 1)
          .andThen((n) => Result.ok(n + 1))
          .and(Result.err("error"))
          .orElse((e) => Result.err(e))
          .or(Result.ok(1)),
        "Lazy<Ok(1).map((n)=>n + 1).andThen((n)=>Result.ok(n + 1)).and(Err(error)).orElse((e)=>Result.err(e)).or(Ok(1))>",
      ],
    ] as const;
    for (const [lazy, expected] of tests) {
      await t.step(`(Lazy).toString() => ${expected}`, () => {
        assertEquals(`${lazy}`, expected);
      });
    }
  });
});
