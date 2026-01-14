/**
 * Utility types T or Promise<T>
 */
export type OrPromise<T> = Promise<T> | T;

/**
 * Utility types T or () => T
 */
export type OrFunction<T> = (() => T) | T;
