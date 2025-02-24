/**
 * type Brand
 *
 * ### Example
 *
 * ```ts
 * type MyID = Brand<number, "MyID">;
 * ```
 */
export type Brand<Type, ID extends string | symbol> =
  & Type
  & { [Key in ID]: never };

/**
 * value as Brand
 *
 * ### Example
 *
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
