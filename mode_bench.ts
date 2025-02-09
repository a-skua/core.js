import { Result } from "./mod.ts";

Deno.bench("Result.ok", () => {
  Result.ok("value");
});

Deno.bench("Result.err", () => {
  Result.err("error");
});
