import { afterEach, describe, expect, it, vi } from "vitest"
import { generateMetadata } from "./layout"

/** What search results and link previews show for a course page. */
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function apiReturns(course: unknown, ok = true) {
  vi.stubEnv("API_URL", "https://api.example.test/api/v1/internal")
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok, json: () => Promise.resolve(course) })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

const params = (slug: string) => ({ params: Promise.resolve({ slug }) })

describe("course page metadata", () => {
  it("uses the course's own title, description and canonical URL", async () => {
    const fetchMock = apiReturns({
      slug: "chemistry",
      title: "Grade 12 Chemistry",
      description: "Organic chemistry, equilibria and electrochemistry.",
    })

    const meta = await generateMetadata(params("chemistry"))

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/internal/course/slug/chemistry",
      expect.anything()
    )
    expect(meta.title).toBe("Grade 12 Chemistry — Apsara Elearning")
    expect(meta.description).toBe(
      "Organic chemistry, equilibria and electrochemistry."
    )
    expect(meta.alternates?.canonical).toBe("/courses/chemistry")
    expect(meta.openGraph).toMatchObject({
      title: "Grade 12 Chemistry — Apsara Elearning",
      url: "/courses/chemistry",
    })
  })

  it("falls back to the Khmer description when there's no English one", async () => {
    apiReturns({ slug: "math", title: "គណិតវិទ្យា", descriptionKm: "លីមីត" })

    expect((await generateMetadata(params("math"))).description).toBe("លីមីត")
  })

  it("keeps an unknown or unpublished course out of the index", async () => {
    apiReturns({ statusCode: 404 }, false)

    expect(await generateMetadata(params("draft-course"))).toEqual({
      robots: { index: false },
    })
  })

  it("doesn't break the page when the API is unreachable", async () => {
    vi.stubEnv("API_URL", "https://api.example.test/api/v1/internal")
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")))

    expect(await generateMetadata(params("math"))).toEqual({
      robots: { index: false },
    })
  })
})
