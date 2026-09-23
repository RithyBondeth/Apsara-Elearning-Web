const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Compact relative time for feed rows — "now", "5m", "3h", "2d".
 *
 * Deliberately unit-suffixed rather than worded ("5 minutes ago"): the strings
 * sit in a narrow popover, and compact forms need no translation, which keeps
 * the notification feed working in both locales without a second copy deck.
 *
 * Anything older than a week falls back to a short absolute date, because "9d"
 * stops being useful once a learner is scanning history.
 *
 * @example timeAgo("2026-09-23T09:59:00Z", new Date("2026-09-23T10:00:00Z")) → "1m"
 */
export function timeAgo(iso: string | Date, now: Date = new Date()): string {
  const then = iso instanceof Date ? iso : new Date(iso)
  const ms = now.getTime() - then.getTime()

  // A clock skew between server and browser can make a row look future-dated;
  // show it as "now" rather than a negative age.
  if (Number.isNaN(ms) || ms < MINUTE) return "now"
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)}m`
  if (ms < DAY) return `${Math.floor(ms / HOUR)}h`
  if (ms < 7 * DAY) return `${Math.floor(ms / DAY)}d`

  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
