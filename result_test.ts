import {
  assert,
  assertEquals,
  assertObjectMatch,
  assertThrows,
} from "@std/assert";
import {
  type Err,
  err,
  isErr,
  isOk,
  type Ok,
  ok,
  Result,
  type ResultInstance,
  type ResultLazyContext,
} from "./result.ts";
import { none, some } from "./option.ts";

Deno.test("ResultInstance", async (t) => {
  await t.step("(ResultInstance).toString", async (t) => {
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

  await t.step("(ResultInstance).toString", async (t) => {
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

  await t.step("(ResultInstance).and", async (t) => {
    {
      const tests: [
        ResultInstance<number, string>,
        (n: number) => Result<number, string>,
        Result<number, string>,
      ][] = [
        [ok(1), (n) => ok(n + 1), ok(2)],
        [ok(1), () => err("error"), err("error")],
        [err("error"), (n) => ok(n + 1), err("error")],
      ];

      for (const [result, fn, expected] of tests) {
        await t.step(`${result}.and(${fn}) => ${expected}`, () => {
          assertEquals(result.and(fn), expected);
        });
      }
    }

    {
      const tests: [
        ResultInstance<number, string>,
        () => Result<number, string>,
        ResultInstance<number, string>,
      ][] = [
        [ok(1), () => ok(2), ok(2)],
        [ok(1), () => err("error"), err("error")],
        [err("error"), () => ok(2), err("error")],
      ];

      for (const [result, andThen, expected] of tests) {
        await t.step(`${result}.and(${andThen}) => ${expected}`, () => {
          assertEquals(result.and(andThen), expected);
        });
      }
    }
  });

  await t.step("(ResultInstance).or", async (t) => {
    {
      const tests: [
        ResultInstance<number, string>,
        (e: string) => ResultInstance<string>,
        ResultInstance<number | string, Error>,
      ][] = [
        [ok(1), (e: string) => ok(e + "!!"), ok(1)],
        [err("error"), (e: string) => ok(e + "!!"), ok("error!!")],
      ];

      for (const [result, orElse, expected] of tests) {
        await t.step(`${result}.or(${orElse}) => ${expected}`, () => {
          assertEquals(result.or(orElse), expected);
        });
      }
    }

    {
      const tests: [
        ResultInstance<number, string>,
        () => ResultInstance<number>,
        ResultInstance<number, string | Error>,
      ][] = [
        [ok(1), () => ok(-1), ok(1)],
        [err("error"), () => ok(-1), ok(-1)],
      ];

      for (const [result, orElse, expected] of tests) {
        await t.step(`${result}.or(${orElse}) => ${expected}`, () => {
          assertEquals(result.or(orElse), expected);
        });
      }
    }
  });

  await t.step("(ResultInstance).map", async (t) => {
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
          expected,
        );
      });
    }
  });

  await t.step("(ResultInstance).filter", async (t) => {
    {
      const tests: [
        ResultInstance<number, number | string | Error>,
        (n: number) => boolean,
        Result<number, number | string | Error>,
      ][] = [
        [ok(1), (n) => n > 0, ok(1)],
        [ok(0), (n) => n > 0, err(0)],
        [err("error"), (n) => n > 0, err("error")],
      ];

      for (const [result, fn, expected] of tests) {
        await t.step(`${result}.filter(${fn}) => ${expected}`, () => {
          assertEquals(result.filter(fn), expected);
        });
      }
    }

    {
      const tests: [
        ResultInstance<number, number | string | Error>,
        (n: number) => boolean,
        (n: number) => Error,
        Result<number, number | string | Error>,
      ][] = [
        [ok(1), (n) => n > 0, () => new Error("Result Error"), ok(1)],
        [
          ok(0),
          (n) => n > 0,
          () => new Error("Result Error"),
          err(new Error("Result Error")),
        ],
        [
          ok(0),
          (n) => n > 0,
          (n) => new Error(`Result Error: ${n}`),
          err(new Error("Result Error: 0")),
        ],
        [
          err("error"),
          (n) => n > 0,
          () => new Error("Result Error"),
          err("error"),
        ],
      ];

      for (const [result, fn, onErr, expected] of tests) {
        await t.step(`${result}.filter(${fn}, ${onErr}) => ${expected}`, () => {
          assertEquals(result.filter(fn, onErr), expected);
        });
      }
    }
  });

  await t.step("(ResultInstance).unwrap", async (t) => {
    const tests = [
      [Result.ok(1), 1],
    ] as const;

    for (const [result, expected] of tests) {
      await t.step(`${result}.unwrap() => ${expected}`, () => {
        assertEquals(result.unwrap(), expected);
      });
    }
  });

  await t.step("(ResultInstance).unwrap => throw", async (t) => {
    const tests = [
      [() => err(new Error("error")).unwrap(), Error],
      [() => err("error").unwrap(), Error],
    ] as const;

    for (const [doing, expected] of tests) {
      await t.step(`${doing} => throw ${expected}`, () => {
        assertThrows(doing, expected);
      });
    }
  });

  await t.step("(ResultInstance).unwrap(orElse) => throw", async (t) => {
    const tests: [ResultInstance<number>, () => number, number][] = [
      [err(new Error("test")), () => 1, 1],
      [ok(0), () => 1, 0],
    ] as const;

    for (const [result, orElse, expected] of tests) {
      await t.step(`${result}.unwrap(${orElse}) => ${expected}`, () => {
        assertEquals(result.unwrap(orElse), expected);
      });
    }
  });

  await t.step("(ResultInstance).unwrap", async (t) => {
    const tests: [ResultInstance<number, Error>, number, number][] = [
      [Result.ok(1), 0, 1],
      [Result.err(new Error("error")), 0, 0],
    ] as const;

    for (const [result, defaultValue, expected] of tests) {
      await t.step(`${result}.unwrap(${defaultValue}) => ${expected}`, () => {
        assertEquals(result.unwrap(() => defaultValue), expected);
      });
    }
  });

  await t.step("(ResultInstance).unwrap", async (t) => {
    const tests: [
      ResultInstance<number, Error>,
      (e: Error) => number,
      number,
    ][] = [
      [Result.ok(1), () => {
        assert(false);
      }, 1],
      [Result.err(new Error("error")), (e: Error) => {
        assertEquals(e, new Error("error"));
        return 0;
      }, 0],
    ] as const;

    for (const [result, fn, expected] of tests) {
      await t.step(`${result}.unwrap(${fn}) => ${expected}`, () => {
        assertEquals(result.unwrap(fn), expected);
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

Deno.test("Result.and", async (t) => {
  {
    type Arg =
      | Promise<Result<unknown, unknown>>
      | Result<unknown, unknown>
      | (() => Promise<Result<unknown, unknown>>)
      | (() => Result<unknown, unknown>);

    const tests: [
      [Arg, ...Arg[]],
      Result<unknown, unknown>,
    ][] = [
      [
        [
          ok(1),
          Promise.resolve(ok(2)),
          () => Promise.resolve(ok(3)),
          () => ok(4),
        ],
        ok([1, 2, 3, 4]),
      ],
      [
        [
          ok(1),
          Promise.resolve(ok(2)),
          () => Promise.resolve(err("Error")),
          () => ok(4),
        ],
        err("Error"),
      ],
      [
        [
          err("1"),
          Promise.resolve(err("2")),
          () => Promise.resolve(err("3")),
          () => err("4"),
        ],
        err("1"),
      ],
    ];

    for (const [args, expected] of tests) {
      await t.step(`await Result.andThen(${args}) => ${expected}`, async () => {
        assertEquals(await Result.and(...args), expected);
      });
    }
  }

  {
    type Arg =
      | Result<unknown, unknown>
      | (() => Result<unknown, unknown>);

    const tests: [
      [Arg, ...Arg[]],
      Result<unknown, unknown>,
    ][] = [
      [
        [
          ok(1),
          ok(2),
          () => ok(3),
          () => ok(4),
        ],
        ok([1, 2, 3, 4]),
      ],
      [
        [
          ok(1),
          ok(2),
          () => err("Error"),
          () => ok(4),
        ],
        err("Error"),
      ],
      [
        [
          err("1"),
          err("2"),
          () => err("3"),
          () => err("4"),
        ],
        err("1"),
      ],
    ];

    for (const [args, expected] of tests) {
      await t.step(`Result.andThen(${args}) => ${expected}`, () => {
        assertEquals(Result.and(...args), expected);
      });
    }
  }
});

Deno.test("Result.or", async (t) => {
  {
    type Arg =
      | Promise<Result<unknown, unknown>>
      | Result<unknown, unknown>
      | (() => Promise<Result<unknown, unknown>>)
      | (() => Result<unknown, unknown>);

    const tests: [[Arg, ...Arg[]], Result<unknown, unknown>][] = [
      [
        [
          err("Error"),
          Promise.resolve(ok(1)),
          () => ok(2),
          () => ok(3),
        ],
        ok(1),
      ],
      [
        [
          () => err("Error"),
          () => ok(1),
          ok(2),
          Promise.resolve(ok(3)),
        ],
        ok(1),
      ],
      [
        [
          err("1"),
          Promise.resolve(err("2")),
          () => err("3"),
          () => Promise.resolve(err("4")),
        ],
        err("4"),
      ],
    ];

    for (const [args, expected] of tests) {
      await t.step(`await Result.orElse(${args}) => ${expected}`, async () => {
        assertEquals(await Result.or(...args), expected);
      });
    }
  }

  {
    type Arg =
      | Result<unknown, unknown>
      | (() => Result<unknown, unknown>);

    const tests: [[Arg, ...Arg[]], Result<unknown, unknown>][] = [
      [
        [
          err("Error"),
          ok(1),
          () => ok(2),
          () => ok(3),
        ],
        ok(1),
      ],
      [
        [
          () => err("Error"),
          () => ok(1),
          ok(2),
          ok(3),
        ],
        ok(1),
      ],
      [
        [
          err("1"),
          err("2"),
          () => err("3"),
          () => err("4"),
        ],
        err("4"),
      ],
    ];

    for (const [args, expected] of tests) {
      await t.step(`Result.orElse(${args}) => ${expected}`, () => {
        assertEquals(Result.or(...args), expected);
      });
    }
  }
});

Deno.test("Result.lazy", async (t) => {
  const fn = (n: number) => n.toFixed(2);

  const tests = [
    [ok(1), ok("1.00")],
    [() => ok(2), ok("2.00")],
    [Promise.resolve(ok(3)), ok("3.00")],
    [() => Promise.resolve(ok(4)), ok("4.00")],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(
      `Result.lazy(${input}).map(${fn}).eval() => ${expected}`,
      async () => {
        const lazy = Result.lazy(input);
        assertEquals(await lazy.map(fn).eval(), expected);
      },
    );
  }
});

Deno.test("Result.fromOption", async (t) => {
  const tests = [
    [some(1), ok(1)],
    [none<number>(), err<number, null>(null)],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(
      `Result.fromOption(${input}) => ${expected}`,
      () => assertEquals(Result.fromOption(input), expected),
    );
  }
});

Deno.test("Result.try", async (t) => {
  {
    const tests: [() => number, ResultInstance<number>][] = [
      [() => 1, ok(1)],
      [() => {
        throw new Error("test");
      }, err(new Error("test"))],
    ];

    for (const [input, expected] of tests) {
      await t.step(`Result.try(${input}) => ${expected}`, () => {
        assertEquals(Result.try(input), expected);
      });
    }
  }

  {
    const tests: [() => Promise<number>, ResultInstance<number>][] = [
      [() => Promise.resolve(1), ok(1)],
      [() =>
        new Promise(() => {
          throw new Error("test");
        }), err(new Error("test"))],
    ];

    for (const [input, expected] of tests) {
      await t.step(`Result.try(${input}) => ${expected}`, async () => {
        assertEquals(await Result.try(input), expected);
      });
    }
  }
});

Deno.test("ok", async (t) => {
  const tests = [
    ["value", { ok: true, value: "value" }],
    [1, { ok: true, value: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`ok(${input}) => ${expected})`, () => {
      const actual = ok(input);
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("err", async (t) => {
  const tests = [
    ["error", { ok: false, error: "error" }],
    [1, { ok: false, error: 1 }],
  ] as const;

  for (const [input, expected] of tests) {
    await t.step(`err(${input}) => ${expected})`, () => {
      const actual = err(input);
      assertObjectMatch(actual, expected);
      assertEquals(Object.keys(actual).length, Object.keys(expected).length);
    });
  }
});

Deno.test("Lazy", async (t) => {
  await t.step("(Lazy).and", async (t) => {
    {
      const lazy = Result.lazy(ok(1))
        .and((n) => Promise.resolve(ok(n + 1)))
        .and((n) => ok(n + 1));

      const expected = ok(3);
      await t.step(`${lazy}.eval() => ${expected}`, async () => {
        assertEquals(await lazy.eval(), expected);
      });
    }

    {
      const lazy = Result.lazy(ok(1))
        .and(() => Promise.resolve(ok(2)))
        .and(() => ok(3));

      const expected = Result.ok(3);
      await t.step(`${lazy}.eval() => ${expected}`, async () => {
        assertEquals(await lazy.eval(), expected);
      });
    }
  });

  await t.step("(Lazy).or", async (t) => {
    {
      const lazy = Result.lazy(err("error"))
        .or((e) => err(e + "!"))
        .or((e) => err(e + "!"));

      const expected = err<never, string>("error!!");
      await t.step(`${lazy}.eval() => ${expected}`, async () => {
        assertEquals(await lazy.eval(), expected);
      });
    }

    {
      const lazy = Result.lazy(err("error"))
        .or(() => Promise.resolve(err("error!")))
        .or(() => err("error!!"));

      const expected = Result.err<never, string>("error!!");
      await t.step(`${lazy}.eval() => ${expected}`, async () => {
        assertEquals(await lazy.eval(), expected);
      });
    }
  });

  await t.step("(Lazy).map", async (t) => {
    const lazy = Result.lazy(Result.ok(1))
      .map((n) => n + 1)
      .map((n) => n + 1);

    const expected = Result.ok(3) as ResultInstance<number>;
    await t.step(`${lazy}.eval() => ${expected}`, async () => {
      assertEquals(await lazy.eval(), expected);
    });
  });

  await t.step("(Lazy).filter", async (t) => {
    const tests: [
      ResultLazyContext<number, number | string>,
      ResultInstance<number, number | string>,
    ][] = [
      [ok(1).lazy().filter((n) => n > 0), ok(1)],
      [ok(1).lazy().filter((n) => n > 0, () => "ERR!"), ok(1)],
      [ok(0).lazy().filter((n) => n > 0), err(0)],
      [ok(0).lazy().filter((n) => n > 0, () => "ERR!"), err("ERR!")],
      [ok(0).lazy().filter((n) => n > 0, (n) => `Err(${n})!`), err("Err(0)!")],
      [
        err<number, number>(-1).lazy().filter((n) => n > 0),
        err(-1),
      ],
      [
        err<number, number>(-1).lazy().filter((n) => n > 0, () => "ERR!"),
        err(-1),
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
          .and((n) => Result.ok(n + 1)),
        "Lazy<Ok(1).map((n)=>n + 1).and((n)=>Result.ok(n + 1))>",
      ],
      [
        Result.lazy(Result.ok(1))
          .map((n) => n + 1)
          .and((n) => ok(n + 1))
          .and(() => err("error")),
        'Lazy<Ok(1).map((n)=>n + 1).and((n)=>ok(n + 1)).and(()=>err("error"))>',
      ],
      [
        Result.lazy(Result.ok(1))
          .map((n) => n + 1)
          .and((n) => ok(n + 1))
          .and(() => err("error"))
          .or((e) => err(e)),
        'Lazy<Ok(1).map((n)=>n + 1).and((n)=>ok(n + 1)).and(()=>err("error")).or((e)=>err(e))>',
      ],
      [
        Result.lazy(Result.ok(1))
          .map((n) => n + 1)
          .and((n) => ok(n + 1))
          .and(() => err("error"))
          .or((e) => err(e))
          .or(() => ok(1)),
        'Lazy<Ok(1).map((n)=>n + 1).and((n)=>ok(n + 1)).and(()=>err("error")).or((e)=>err(e)).or(()=>ok(1))>',
      ],
    ] as const;
    for (const [lazy, expected] of tests) {
      await t.step(`(Lazy).toString() => ${expected}`, () => {
        assertEquals(`${lazy}`, expected);
      });
    }
  });
});

Deno.test("isOk", async (t) => {
  await t.step("true", () => {
    const a = ok(1) as Result<number, string>;
    assert(isOk(a));

    const b: Ok<number> = a;
    assertEquals(a, b);
  });

  await t.step("false", () => {
    const a = err("error") as Result<number, string>;
    assert(!isOk(a));

    const b: Err<string> = a;
    assertEquals(a, b);
  });
});

Deno.test("isErr", async (t) => {
  await t.step("true", () => {
    const a = err("error") as Result<number, string>;
    assert(isErr(a));

    const b: Err<string> = a;
    assertEquals(a, b);
  });

  await t.step("false", () => {
    const a = ok(1) as Result<number, string>;
    assert(!isErr(a));

    const b: Ok<number> = a;
    assertEquals(a, b);
  });
});
