import type { OrFunction, OrPromise } from "../types.ts";
import type {
  ErrInstance,
  OkInstance,
  Result,
  ResultLazyContext,
} from "../result.ts";

/** @internal */
export class Ok<T, E> implements OkInstance<T, E> {
  readonly ok = true;
  constructor(readonly value: T) {
  }

  and<U>(andThen: (value: T) => U) {
    return andThen(this.value) as never;
  }

  or() {
    return this as never;
  }

  map<U, V>(fn: (v: T) => U): V {
    return new Ok(fn(this.value)) as V;
  }

  filter(
    isOk: (v: T) => boolean,
    onErr = (v: T) => v,
  ) {
    if (isOk(this.value)) return this;
    return new Err(onErr(this.value)) as never;
  }

  tee(callback: (value: T) => void) {
    callback(this.value);
    return this as never;
  }

  unwrap(): T {
    return this.value;
  }

  lazy() {
    return new Lazy(this) as never;
  }

  toString(): string {
    return `Ok(${this.value})`;
  }
}

/** @internal */
export class Err<T, E> implements ErrInstance<T, E> {
  readonly ok = false;
  constructor(readonly error: E) {}

  and() {
    return this as never;
  }

  map() {
    return this as never;
  }

  filter() {
    return this;
  }

  tee() {
    return this;
  }

  or<U>(orElse: (error: E) => U) {
    return orElse(this.error) as never;
  }

  unwrap<U>(orElse: (error: E) => U): T | U;
  unwrap(): T;
  unwrap<U>(orElse?: (error: E) => U): T | U {
    if (orElse) return orElse(this.error);

    if (this.error instanceof Error) throw this.error;

    throw new Error(`${this.error}`);
  }

  lazy() {
    return new Lazy(this) as never;
  }

  toString(): string {
    return `Err(${this.error})`;
  }
}

/** @internal */
type Op<T, E> =
  | { and: <U = never, D = never>(value: T) => OrPromise<Result<U, D>> }
  | { or: <U = never, D = never>(error: E) => OrPromise<Result<U, D>> }
  | { map: <U = never>(value: T) => OrPromise<U> }
  | {
    filter: (value: T) => OrPromise<boolean>;
    onErr: <D = never>(value: T) => D;
  }
  | { tee: (value: T) => OrPromise<void> };

/** @internal */
export class Lazy<T, E, Eval extends Result<T, E>>
  implements ResultLazyContext<T, E, Eval> {
  readonly op: Op<T, E>[] = [];

  constructor(
    readonly first: OrFunction<OrPromise<Eval>>,
  ) {
  }

  and(and: unknown) {
    this.op.push({ and } as typeof this.op[number]);
    return this as never;
  }

  or(or: unknown) {
    this.op.push({ or } as typeof this.op[number]);
    return this as never;
  }

  map(map: unknown) {
    this.op.push({ map } as typeof this.op[number]);
    return this as never;
  }

  filter(filter: unknown, onErr = (v: T) => v) {
    this.op.push({ filter, onErr } as typeof this.op[number]);
    return this as never;
  }

  tee(tee: unknown) {
    this.op.push({ tee } as typeof this.op[number]);
    return this as never;
  }

  async eval(): Promise<Eval> {
    const p = typeof this.first === "function" ? this.first() : this.first;
    let result: Result<T, E> = p instanceof Promise ? await p : p;
    if (result.ok && result.value instanceof Promise) {
      result = new Ok(await result.value);
    }

    for (let i = 0; i < this.op.length; i++) {
      const op = this.op[i];

      if ("and" in op && result.ok) {
        const p = op.and(result.value);
        result = p instanceof Promise ? await p : p;
        continue;
      }

      if ("or" in op && !result.ok) {
        const p = op.or(result.error);
        result = p instanceof Promise ? await p : p;
        continue;
      }

      if ("map" in op && result.ok) {
        const p = op.map(result.value);
        result = new Ok(p instanceof Promise ? await p : p);
        continue;
      }

      if ("filter" in op && result.ok) {
        const p = op.filter(result.value);
        const isOk = p instanceof Promise ? await p : p;
        if (!isOk) {
          const e = op.onErr(result.value);
          result = new Err(e);
        }
        continue;
      }

      if ("tee" in op && result.ok) {
        const p = op.tee(result.value);
        if (p instanceof Promise) await p;
        continue;
      }
    }
    return result as Eval;
  }

  toString(): string {
    if (this.op.length === 0) return `Lazy<${this.first}>`;

    const op = this.op.map((op) =>
      Object.entries(op).map(([fn, arg]) => `${fn}(${arg})`)
    ).flat().join(".");

    return `Lazy<${this.first}.${op}>`;
  }
}
