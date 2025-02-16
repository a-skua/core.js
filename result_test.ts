import { assertEquals, assertObjectMatch, assertThrows } from "@std/assert";
import { Result } from "./result.ts";
import type { ResultInstance } from "./result.ts";
import { Option } from "./option.ts";

Deno.test("Result", async (t) => {
  {
    const tests = [
      ["value", { ok: true, value: "value" }],
      [1, { ok: true, value: 1 }],
    ] as const;

    for (const [input, expected] of tests) {
      await t.step(`Result.ok(${input}) => ${expected})`, () => {
        assertObjectMatch(Result.ok(input), expected);
      });
    }
  }

  {
    const tests = [
      ["error", { ok: false, error: "error" }],
      [1, { ok: false, error: 1 }],
    ] as const;

    for (const [input, expected] of tests) {
      await t.step(`Result.err(${input}) => ${expected})`, () => {
        assertObjectMatch(Result.err(input), expected);
      });
    }
  }

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
    const tests = [
      [Result.ok("value"), Option.some("value")],
      [Result.err("error"), Option.none()],
    ] as const;

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
    const tests = [
      [Result.ok(1), (n: number) => Result.ok(n + 1), Result.ok(2)],
      [Result.ok(1), (_: number) => Result.err("error"), Result.err("error")],
      [
        Result.err<number, string>("error"),
        (n: number) => Result.ok(n + 1),
        Result.err("error"),
      ],
    ] as const;

    for (const [result, fn, expected] of tests) {
      type Fn = (
        n: number,
      ) => Result<number, string> & ResultInstance<number>;

      await t.step(`${result}.bind(${fn}) => ${expected}`, () => {
        assertEquals(result.bind(fn as Fn), expected);
      });
    }
  }

  {
    const tests = [
      [Result.ok(1), (n: number) => n + 1, Result.ok(2)],
      [
        Result.err("error"),
        (n: number) => n + 1,
        Result.err<number, string>("error"),
      ],
    ] as const;

    for (const [result, fn, expected] of tests) {
      type Fn = (n: number) => number;

      await t.step(`${result}.map(${fn}) => ${expected}`, () => {
        assertEquals(result.map<number, string>(fn as Fn), expected);
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
    const tests = [
      [Result.ok(1), 0, 1],
      [Result.err<number>(new Error("error")), 0, 0],
    ] as const;

    for (const [result, defaultValue, expected] of tests) {
      await t.step(`${result}.unwrapOr(${defaultValue}) => ${expected}`, () => {
        assertEquals(result.unwrapOr(defaultValue), expected);
      });
    }
  }
});
