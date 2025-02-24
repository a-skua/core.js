const promise = new Promise(() => {});
const obj = { key: "value" };

Deno.bench("typeof function", () => {
  typeof (() => {}) === "function";
});

Deno.bench("instanceof Promise", () => {
  promise instanceof Promise === true;
});

Deno.bench("key in", () => {
  "key" in obj;
});

Deno.bench("foo === bar", () => {
  obj.key === "value";
});
