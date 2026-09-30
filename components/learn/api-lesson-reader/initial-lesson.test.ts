import { describe, expect, it } from "vitest"
import { initialLessonOf } from "."

const lessons = [
  { id: "id-1", slug: "gymnosperms" },
  { id: "id-2", slug: "dna" },
]

describe("initialLessonOf", () => {
  it("opens the lesson named by slug", () => {
    expect(initialLessonOf(lessons, "dna")).toBe("id-2")
  })

  it("opens the lesson named by id (activity and review links)", () => {
    expect(initialLessonOf(lessons, "id-2")).toBe("id-2")
  })

  it("falls back to the first lesson for an unknown or missing key", () => {
    expect(initialLessonOf(lessons, "nope")).toBe("id-1")
    expect(initialLessonOf(lessons)).toBe("id-1")
  })

  it("returns null for a course without lessons", () => {
    expect(initialLessonOf([], "dna")).toBeNull()
  })
})
