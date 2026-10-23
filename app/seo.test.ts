import { afterEach, describe, expect, it, vi } from "vitest"
import robots from "./robots"
import sitemap from "./sitemap"

/**
 * What search engines are told: production lists the public pages and every
 * published course; previews are closed to crawlers; signed-in areas and
 * token-carrying links are never crawlable.
 */
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function production() {
  vi.stubEnv("VERCEL_ENV", "production")
  vi.stubEnv("APP_ORIGIN", "https://elearning.apsara.social/")
  vi.stubEnv("API_URL", "https://api.example.test/api/v1/internal")
}

describe("robots", () => {
  it("lets crawlers read the public site and points at the sitemap", () => {
    production()
    const result = robots()

    expect(result.sitemap).toBe("https://elearning.apsara.social/sitemap.xml")
    expect(result.rules).toMatchObject({ userAgent: "*", allow: "/" })
    const disallow = (result.rules as { disallow: string[] }).disallow
    for (const path of ["/admin", "/api/", "/dashboard", "/reset-password"]) {
      expect(disallow).toContain(path)
    }
  })

  it("closes preview deployments entirely", () => {
    vi.stubEnv("VERCEL_ENV", "preview")

    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } })
  })
})

describe("sitemap", () => {
  it("lists the public pages plus each published course", async () => {
    production()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            { slug: "math", updatedAt: "2026-10-01T00:00:00Z" },
            { slug: "biology", updatedAt: "2026-10-02T00:00:00Z" },
          ]),
      })
    )

    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls).toContain("https://elearning.apsara.social")
    expect(urls).toContain("https://elearning.apsara.social/courses")
    expect(urls).toContain("https://elearning.apsara.social/courses/math")
    expect(urls).toContain("https://elearning.apsara.social/courses/biology")
    expect(urls.some((url) => url.includes("/dashboard"))).toBe(false)
  })

  it("still serves the static pages when the API is down", async () => {
    production()
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")))

    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls).toContain("https://elearning.apsara.social/pricing")
    expect(urls.some((url) => url.includes("/courses/"))).toBe(false)
  })
})
