/**
 * Brand type
 */
export type Brand<ID extends string | symbol, Type> =
  & Type
  & { [Key in ID]: never };

/**
 * Value as Brand type
 *
 * ### Example
 *
 * ```ts
 * type ID = Brand<"MyID", number>;
 * const ID = Brand<"MyID", number>;
 *
 * const id: ID = ID(1);
 * ```
 */
export function Brand<ID extends string | symbol, Type>(
  v: Type,
): Brand<ID, Type> {
  return v as Brand<ID, Type>;
}
