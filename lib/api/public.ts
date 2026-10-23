/**
 * Anonymous, cacheable reads from the gateway for crawler-facing output
 * (sitemap, page metadata). No session is attached on purpose — these must
 * only ever show what anyone can see — and failures resolve to null so a
 * missing API degrades the output instead of breaking the page.
 */
export async function fetchPublic<T>(
  path: string,
  revalidateSeconds: number
): Promise<T | null> {
  const gateway = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL
  if (!gateway) return null
  try {
    const res = await fetch(`${gateway}${path}`, {
      next: { revalidate: revalidateSeconds },
    })
    return res.ok ? ((await res.json()) as T) : null
  } catch {
    return null
  }
}
