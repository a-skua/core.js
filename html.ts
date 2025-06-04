import type { Brand } from "./brand.ts";
import { escape } from "@std/html";

export type HTML = Brand<
  string & {
    [_HTML]: never;
  },
  typeof _HTML
>;
const _HTML = Symbol("HTML");

export type Value =
  | HTML
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;

export function html(tmp: TemplateStringsArray, ...values: Value[]): HTML {
  let html = tmp[0];
  for (const i of values.keys()) {
    // deno-lint-ignore no-explicit-any
    const v = values[i] as any;
    html += v[_HTML] ? v : escape(String(v));
    html += tmp[i + 1];
  }
  return Object.assign(html, {
    [_HTML]: true,
  }) as HTML;
}
