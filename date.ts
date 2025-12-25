/**
 * A type representing the months of the year as zero-based indices.
 */
export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/**
 * A type representing the days of the week as zero-based indices.
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * The month index for January.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { JAN } from "@askua/core/date";
 *
 * const a = new Date(2026, JAN, 1);
 * const b = new Date(2026, 0, 1);
 * assertEquals(a, b);
 * ```
 */
export const JAN = 0;

/**
 * The month index for February.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { FEB } from "@askua/core/date";
 *
 * const a = new Date(2026, FEB, 1);
 * const b = new Date(2026, 1, 1);
 * assertEquals(a, b);
 * ```
 */
export const FEB = 1;

/**
 * The month index for March.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { MAR } from "@askua/core/date";
 *
 * const a = new Date(2026, MAR, 1);
 * const b = new Date(2026, 2, 1);
 * assertEquals(a, b);
 * ```
 */
export const MAR = 2;

/**
 * The month index for April.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { APR } from "@askua/core/date";
 *
 * const a = new Date(2026, APR, 1);
 * const b = new Date(2026, 3, 1);
 * assertEquals(a, b);
 * ```
 */
export const APR = 3;

/**
 * The month index for May.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { MAY } from "@askua/core/date";
 *
 * const a = new Date(2026, MAY, 1);
 * const b = new Date(2026, 4, 1);
 * assertEquals(a, b);
 * ```
 */
export const MAY = 4;

/**
 * The month index for June.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { JUN } from "@askua/core/date";
 *
 * const a = new Date(2026, JUN, 1);
 * const b = new Date(2026, 5, 1);
 * assertEquals(a, b);
 * ```
 */
export const JUN = 5;

/**
 * The month index for July.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { JUL } from "@askua/core/date";
 *
 * const a = new Date(2026, JUL, 1);
 * const b = new Date(2026, 6, 1);
 * assertEquals(a, b);
 * ```
 */
export const JUL = 6;

/**
 * The month index for August.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { AUG } from "@askua/core/date";
 *
 * const a = new Date(2026, AUG, 1);
 * const b = new Date(2026, 7, 1);
 * assertEquals(a, b);
 * ```
 */
export const AUG = 7;

/**
 * The month index for September.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { SEP } from "@askua/core/date";
 *
 * const a = new Date(2026, SEP, 1);
 * const b = new Date(2026, 8, 1);
 * assertEquals(a, b);
 * ```
 */
export const SEP = 8;

/**
 * The month index for October.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { OCT } from "@askua/core/date";
 *
 * const a = new Date(2026, OCT, 1);
 * const b = new Date(2026, 9, 1);
 * assertEquals(a, b);
 * ```
 */
export const OCT = 9;

/**
 * The month index for November.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { NOV } from "@askua/core/date";
 *
 * const a = new Date(2026, NOV, 1);
 * const b = new Date(2026, 10, 1);
 * assertEquals(a, b);
 * ```
 */
export const NOV = 10;

/**
 * The month index for December.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { DEC } from "@askua/core/date";
 *
 * const a = new Date(2026, DEC, 1);
 * const b = new Date(2026, 11, 1);
 * assertEquals(a, b);
 * ```
 */
export const DEC = 11;

/**
 * The day of week index for Sunday.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { JAN, SUN } from "@askua/core/date";
 *
 * const d = new Date(2026, JAN, 4);
 * assertEquals(d.getDay(), SUN);
 * ```
 */
export const SUN = 0;

/**
 * The day of week index for Monday.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { JAN, MON } from "@askua/core/date";
 *
 * const d = new Date(2026, JAN, 5);
 * assertEquals(d.getDay(), MON);
 * ```
 */
export const MON = 1;

/**
 * The day of week index for Tuesday.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { JAN, TUE } from "@askua/core/date";
 *
 * const d = new Date(2026, JAN, 6);
 * assertEquals(d.getDay(), TUE);
 * ```
 */
export const TUE = 2;

/**
 * The day of week index for Wednesday.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { JAN, WED } from "@askua/core/date";
 *
 * const d = new Date(2026, JAN, 7);
 * assertEquals(d.getDay(), WED);
 * ```
 */
export const WED = 3;

/**
 * The day of week index for Thursday.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { JAN, THU } from "@askua/core/date";
 *
 * const d = new Date(2026, JAN, 8);
 * assertEquals(d.getDay(), THU);
 * ```
 */
export const THU = 4;

/**
 * The day of week index for Friday.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { FRI } from "@askua/core/date";
 *
 * const d = new Date(2026, JAN, 9);
 * assertEquals(d.getDay(), FRI);
 * ```
 */
export const FRI = 5;

/**
 * The day of week index for Saturday.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { JAN, SAT } from "@askua/core/date";
 *
 * const d = new Date(2026, JAN, 10);
 * assertEquals(d.getDay(), SAT);
 * ```
 */
export const SAT = 6;
