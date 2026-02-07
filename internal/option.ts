import type { OrFunction, OrPromise } from "../types.ts";
import type {
  NoneInstance,
  Option,
  OptionLazyContext,
  SomeInstance,
} from "../option.ts";

/** @internal */
export class Some<T> implements SomeInstance<T> {
  readonly some = true;
  constructor(readonly value: T) {}

  and<U>(andThen: (value: T) => U) {
    return andThen(this.value) as never;
  }

  or() {
    return this as never;
  }

  map<U, V>(fn: (v: T) => U): V {
    return new Some(fn(this.value)) as V;
  }

  filter(fn: (v: T) => boolean) {
    if (fn(this.value)) return this;
    return new None() as never;
  }

  tee(fn: (value: T) => void) {
    fn(this.value);
    return this as never;
  }

  unwrap(): T {
    return this.value;
  }

  lazy() {
    return new Lazy(this) as never;
  }

  toString(): string {
    return `Some(${this.value})`;
  }

  [Symbol.iterator](): Iterator<T> {
    let count = 0;
    const value = this.value;
    return Object.assign(this, {
      next(): IteratorResult<T> {
        return { done: 0 < count++, value };
      },
    });
  }
}

/** @internal */
export class None<T = never> implements NoneInstance<T> {
  readonly some = false;
  constructor() {}

  and() {
    return this as never;
  }

  or<U>(orElse: () => U) {
    return orElse() as never;
  }

  map<U>(): U {
    return this as never;
  }

  filter() {
    return this as never;
  }

  tee() {
    return this;
  }

  unwrap<U>(orElse?: () => U) {
    if (orElse) return orElse() as never;
    throw new Error("None");
  }

  lazy() {
    return new Lazy(this) as never;
  }

  toString(): string {
    return "None";
  }

  [Symbol.iterator](): Iterator<T> {
    return Object.assign(this, {
      next(): IteratorResult<T> {
        return { done: true, value: undefined };
      },
    });
  }
}

/** @internal */
type Op<T, U> =
  | { and: (value: T) => OrPromise<Option<U>> }
  | { or: () => OrPromise<Option<U>> }
  | { map: (value: T) => OrPromise<U> }
  | { filter: (value: T) => OrPromise<boolean> }
  | { tee: (value: T) => OrPromise<void> };

/** @internal */
export class Lazy<T, Eval extends Option<T>>
  implements OptionLazyContext<T, Eval> {
  readonly op: Op<T, never>[] = [];

  constructor(
    private readonly first: OrFunction<OrPromise<Eval>>,
  ) {}

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

  filter(filter: unknown) {
    this.op.push({ filter } as typeof this.op[number]);
    return this as never;
  }

  tee(tee: unknown) {
    this.op.push({ tee } as typeof this.op[number]);
    return this as never;
  }

  async eval(): Promise<Eval> {
    const p = typeof this.first === "function" ? this.first() : this.first;
    let option: Option<T> = p instanceof Promise ? await p : p;
    if (option.some && option.value instanceof Promise) {
      option = new Some(await option.value);
    }

    for (let i = 0; i < this.op.length; i++) {
      const op = this.op[i];

      if ("and" in op && option.some) {
        const p = op.and(option.value);
        option = p instanceof Promise ? await p : p;
        continue;
      }

      if ("or" in op && !option.some) {
        const p = op.or();
        option = p instanceof Promise ? await p : p;
        continue;
      }

      if ("map" in op && option.some) {
        const p = op.map(option.value);
        option = new Some(p instanceof Promise ? await p : p);
        continue;
      }

      if ("filter" in op && option.some) {
        const p = op.filter(option.value);
        const result = p instanceof Promise ? await p : p;
        if (!result) option = new None();
        continue;
      }

      if ("tee" in op && option.some) {
        const p = op.tee(option.value);
        if (p instanceof Promise) await p;
        continue;
      }
    }
    return option as Eval;
  }

  toString(): string {
    if (this.op.length === 0) {
      return `Lazy<${this.first}>`;
    }

    const op = this.op.map((op) =>
      Object.entries(op).map(([fn, arg]) => `${fn}(${arg})`)
    ).flat().join(".");
    return `Lazy<${this.first}.${op}>`;
  }
}
