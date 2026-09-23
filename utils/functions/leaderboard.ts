/** Ranks that get a medal on the board. */
const MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
}

/**
 * The medal for a podium rank, or null for everyone else.
 * @example medalFor(1) → "🥇"
 * @example medalFor(4) → null
 */
export function medalFor(rank: number): string | null {
  return MEDALS[rank] ?? null
}

/** True for the top three ranks, which are styled differently. */
export function isPodium(rank: number): boolean {
  return rank >= 1 && rank <= 3
}

/**
 * Tailwind classes for a rank badge — gold/silver/bronze on the podium, a
 * neutral tile below it.
 */
export function rankTone(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
    case 2:
      return "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200"
    case 3:
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/**
 * Ordinal suffix for a rank, used in the "you're Nth of M" summary.
 * @example ordinal(1) → "1st"
 * @example ordinal(12) → "12th"
 */
export function ordinal(n: number): string {
  // 11–13 are irregular: 11th, 12th, 13th — not 11st/12nd/13rd.
  const teen = n % 100
  if (teen >= 11 && teen <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}
