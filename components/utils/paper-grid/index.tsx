/**
 * Full-bleed graph-paper backdrop for the marketing and auth surfaces.
 *
 * Masked to fade out down the page so the texture frames the top of a hero
 * without running through body copy. Not used inside the app shell — study
 * screens get a flat surface instead (see .study-surface).
 */
export function PaperGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[110vh] overflow-hidden opacity-65 dark:opacity-45"
    >
      <div className="grid-pattern grid-mask-top absolute inset-0" />
    </div>
  )
}
