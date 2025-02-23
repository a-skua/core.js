Deno.bench("typeof function", () => {
  typeof (() => {}) === "function";
});
