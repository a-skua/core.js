import type { Brand } from "./brand.ts";

// export type Sql<
//   Row extends Record<string, never>,
//   Query extends TemplateStringsArray,
// > = Query extends readonly [infer S, ...string[]]
//   ? S extends `SELECT ${infer _Select}` ? SelectItem<Row, _Select>
//   : unknown
//   : unknown;

export type Value = string | number | bigint | boolean;

export interface SQLInstance<Values extends readonly Value[]> {
  get prepare(): string;
  get values(): Values;
}

export type SQL<Values extends readonly Value[]> = Brand<
  string & SQLInstance<Values>,
  "SQL"
>;

// class _SQL<Values extends readonly Value[]> implements SQL<Values> {
//   constructor(
//     private readonly _q: TemplateStringsArray,
//     readonly values: Values,
//   ) {}
//
//   get prepare(): string {
//     let prepare = this._q[0];
//     for (const i of this.values.keys()) {
//       prepare += "?" + this._q[i + 1];
//     }
//     return prepare;
//   }
//
//   toString(): string {
//     let stmt = this._q[0];
//     for (const i of this.values.keys()) {
//       stmt += _escape(this.values[i]) + this._q[i + 1];
//     }
//     return stmt;
//   }
// }

export function sql<Q extends TemplateStringsArray, Values extends Value[]>(
  q: Q,
  ...values: Values
): SQL<Values> {
  let stmt = q[0];
  for (const i of values.keys()) {
    stmt += _escape(values[i]) + q[i + 1];
  }
  return Object.assign(stmt, {
    prepare: q.join("?"),
    values,
  }) as SQL<Values>;
}

function _escape(v: Value): string {
  switch (typeof v) {
    case "string":
      return `'${v.replaceAll("'", "''")}'`;
    default:
      return v.toString();
  }
}

type SelectItem<Row extends Record<string, never>, Select extends string> =
  Select extends `${infer _name}, ${infer _rest}`
    ? Row & { [K in _name]: never } & SelectItem<Row, _rest>
    : Select extends `${infer _name}` ? Row & { [K in _name]: never }
    : Row;

type Qeury<R extends Record<string, never>, STMT extends string> = STMT extends `SELECT ${infer _Select}`
  ? SelectItem<R, _Select>
  : unknown;
