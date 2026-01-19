/**
 * Brand type definition.
 *
 * @example type {@link Brand}
 * ```ts
 * import { Brand } from "@askua/core/brand";
 *
 * type ID1 = Brand<number, "ID 1">;
 * const ID1 = Brand<number, "ID 1">;
 *
 * type ID2 = Brand<number, "ID 2">;
 * const ID2 = Brand<number, "ID 2">;
 *
 * const id1: ID1 = ID1(1);
 * // const id2: ID2 = id1; // ERR
 * const id2: ID2 = ID2(1); // OK
 * ```
 *
 * @module
 */

import type { _brand } from "./internal/brand.ts";

/**
 * @example type {@link Brand}
 * ```ts
 * type MyID = Brand<number, "MyID">;
 * ```
 */
export type Brand<Type, ID extends string | symbol> =
  & Type
  & { [_brand]: { [Key in ID]: never } };

/**
 * @example type {@link Brand}
 * ```ts
 * type MyID = Brand<number, "MyID">;
 * const MyID = Brand<number, "MyID">;
 *
 * const id: MyID = MyID(1);
 * ```
 */
export function Brand<Type, ID extends string | symbol>(
  value: Type,
): Brand<Type, ID> {
  return value as Brand<Type, ID>;
}
