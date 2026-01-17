/**
 * Utility types T or Promise<T>
 */
export type OrPromise<T> = Promise<T> | T;

/**
 * Utility types T or () => T
 */
export type OrFunction<T> = (() => T) | T;

/**
 * Utility type to infer the return type of a function type or return the type itself if not a function
 */
export type InferReturnType<OrFn extends OrFunction<unknown>> = OrFn extends
  () => infer R ? R : OrFn;
