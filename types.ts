/**
 * Utility types T or Promise<T>
 */
export type OrPromise<T> = T | Promise<T>;

/**
 * Utility types T or () => T
 */
export type OrFunction<T> = T | (() => T);
