const DESCRIPTION_LIMIT = 160

/** Search engines show about 160 characters; cut at a word boundary. */
export function summarize(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim()
  if (flat.length <= DESCRIPTION_LIMIT) return flat
  const cut = flat.slice(0, DESCRIPTION_LIMIT - 1)
  const space = cut.lastIndexOf(" ")
  return `${space > 80 ? cut.slice(0, space) : cut}…`
}
