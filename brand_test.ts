import { assertEquals } from "@std/assert";
import { Brand } from "./brand.ts";

type Example = Brand<"Test" | "Example", string>;
const Example = Brand<"Test" | "Example", string>;

Deno.test("Brand(value)", () => {
  const example: Example = Example("Example value");
  assertEquals(example, "Example value");
});
