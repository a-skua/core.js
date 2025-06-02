import { assertEquals } from "@std/assert";
import { type SQL, sql, type Value } from "./sql.ts";

Deno.test("sql.toString()", async (t) => {
  const tests = [
    [sql`SELECT * FROM users;`, "SELECT * FROM users;"],
    [
      sql`SELECT * FROM users WHERE id = ${1};`,
      "SELECT * FROM users WHERE id = 1;",
    ],
    [
      sql`SELECT * FROM users WHERE id = ${1n};`,
      "SELECT * FROM users WHERE id = 1;",
    ],
    [
      sql`SELECT * FROM users WHERE is_active = ${true};`,
      "SELECT * FROM users WHERE is_active = true;",
    ],
    [
      sql`SELECT * FROM users WHERE name = ${"Alice"};`,
      "SELECT * FROM users WHERE name = 'Alice';",
    ],
    [
      sql`SELECT * FROM users WHERE id = ${1} OR name = ${"Alice"};`,
      "SELECT * FROM users WHERE id = 1 OR name = 'Alice';",
    ],
    [
      sql`SELECT * FROM users WHERE name = ${"' OR true -- "};`,
      "SELECT * FROM users WHERE name = ''' OR true -- ';",
    ],
    [
      sql`SELECT * FROM users WHERE name = ${"'' OR true -- "};`,
      "SELECT * FROM users WHERE name = ''''' OR true -- ';",
    ],
  ];

  for (const [result, expected] of tests) {
    await t.step(`${expected}`, () => {
      assertEquals(result.toString(), expected);
    });
  }
});

Deno.test("sql.prepare", async (t) => {
  const tests = [
    [sql`SELECT * FROM users;`, "SELECT * FROM users;"],
    [
      sql`SELECT * FROM users WHERE id = ${1};`,
      "SELECT * FROM users WHERE id = ?;",
    ],
    [
      sql`SELECT * FROM users WHERE id = ${1n};`,
      "SELECT * FROM users WHERE id = ?;",
    ],
    [
      sql`SELECT * FROM users WHERE is_active = ${true};`,
      "SELECT * FROM users WHERE is_active = ?;",
    ],
    [
      sql`SELECT * FROM users WHERE name = ${"Alice"};`,
      "SELECT * FROM users WHERE name = ?;",
    ],
    [
      sql`SELECT * FROM users WHERE id = ${1} OR name = ${"Alice"};`,
      "SELECT * FROM users WHERE id = ? OR name = ?;",
    ],
    [
      sql`SELECT * FROM users WHERE name = ${"' OR true -- "};`,
      "SELECT * FROM users WHERE name = ?;",
    ],
    [
      sql`SELECT * FROM users WHERE name = ${"'' OR true -- "};`,
      "SELECT * FROM users WHERE name = ?;",
    ],
  ] as const;

  for (const [result, expected] of tests) {
    await t.step(`${expected}`, () => {
      assertEquals(result.prepare, expected);
    });
  }
});

Deno.test("sql.values", async (t) => {
  const tests: [SQL<Value[]>, Value[]][] = [
    [sql`SELECT * FROM users;`, []],
    [
      sql`SELECT * FROM users WHERE id = ${1};`,
      [1],
    ],
    [
      sql`SELECT * FROM users WHERE id = ${1n};`,
      [1n],
    ],
    [
      sql`SELECT * FROM users WHERE is_active = ${true};`,
      [true],
    ],
    [
      sql`SELECT * FROM users WHERE name = ${"Alice"};`,
      ["Alice"],
    ],
    [
      sql`SELECT * FROM users WHERE id = ${1} OR name = ${"Alice"};`,
      [1, "Alice"],
    ],
    [
      sql`SELECT * FROM users WHERE name = ${"' OR true -- "};`,
      ["' OR true -- "],
    ],
    [
      sql`SELECT * FROM users WHERE name = ${"'' OR true -- "};`,
      ["'' OR true -- "],
    ],
  ];

  for (const [result, expected] of tests) {
    await t.step(`${expected}`, () => {
      assertEquals(result.values, expected);
    });
  }
});
