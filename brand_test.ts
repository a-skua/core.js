import { assertEquals } from "@std/assert";
import { Brand } from "./brand.ts";

type Example = Brand<string, "Test" | "Example">;
const Example = Brand<string, "Test" | "Example">;

Deno.test("Brand(value)", () => {
  const example: Example = Example("Example value");
  assertEquals(example, "Example value");
});
