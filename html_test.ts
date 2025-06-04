import { assertEquals } from "@std/assert";
import { html } from "./html.ts";

Deno.test("html", async (t) => {
  const tests = [
    [
      html`
        <h1>Hello, ${"<b>World</b>"}</h1>
      `,
      `
        <h1>Hello, &lt;b&gt;World&lt;/b&gt;</h1>
      `,
    ],
    [
      html`
        <span>Count: ${1}</span>
      `,
      `
        <span>Count: 1</span>
      `,
    ],
    [
      html`
        <div>${html`
          <span>Nested ${"<tag>"}</span>
        `}</div>
      `,
      `
        <div>
          <span>Nested &lt;tag&gt;</span>
        </div>
      `,
    ],
  ];

  for (const [actual, expected] of tests) {
    await t.step(expected, () => {
      assertEquals(`${actual}`, expected);
    });
  }
});
