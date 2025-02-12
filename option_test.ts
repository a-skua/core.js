import { assertEquals, assertObjectMatch } from "@std/assert";
import { Option } from "./option.ts";
import { Result } from "./result.ts";

Deno.test("Option", async (t) => {
  {
    const tests = [
      ["value", { some: true, value: "value" }],
      [1, { some: true, value: 1 }],
    ] as const;

    for (const [input, expected] of tests) {
      await t.step(`Option.some(${input}) => ${expected})`, () => {
        assertObjectMatch(Option.some(input), expected);
      });
    }
  }

  {
    const tests = [
      [{ some: false }],
    ] as const;

    for (const [expected] of tests) {
      await t.step(`Option.none() => ${expected})`, () => {
        assertObjectMatch(Option.none(), expected);
      });
    }
  }

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
    const tests = [
      [Option.some("value"), Result.ok("value")],
      [Option.none(), Result.err(new Error("None"))],
    ] as const;

    for (const [option, expected] of tests) {
      await t.step(`${option}.toResult() => ${expected}`, () => {
        assertEquals(option.toResult(), expected);
      });
    }
  }

  {
    const tests = [
      [
        Option.some("value"),
        "is none",
        Result.ok("value") as Result<string, string>,
      ],
      [Option.none(), "is none", Result.err("is none")],
    ] as const;

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
});
