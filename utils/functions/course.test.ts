import { describe, expect, it } from "vitest"

import { lessonXp, pickFeaturedCourses } from "./course"
import type { IApiCourse } from "@/utils/interfaces/catalog/api.interface"

const course = (title: string, lessonCount?: number, published = true): IApiCourse => ({
  id: title,
  programType: "k12",
  title,
  slug: title.toLowerCase(),
  published,
  lessonCount,
  createdAt: "",
  updatedAt: "",
})

describe("pickFeaturedCourses", () => {
  it("returns the courses with the most lessons, largest first", () => {
    const picked = pickFeaturedCourses([
      course("A", 5),
      course("B", 40),
      course("C", 12),
      course("D", 30),
    ])
    expect(picked.map((c) => c.title)).toEqual(["B", "D", "C"])
  })

  it("skips empty and unpublished courses", () => {
    const picked = pickFeaturedCourses([
      course("Empty", 0),
      course("Unknown"),
      course("Draft", 99, false),
      course("Real", 3),
    ])
    expect(picked.map((c) => c.title)).toEqual(["Real"])
  })

  it("breaks ties on title and respects the limit", () => {
    const picked = pickFeaturedCourses([course("Zeta", 10), course("Alpha", 10), course("Mid", 10)], 2)
    expect(picked.map((c) => c.title)).toEqual(["Alpha", "Mid"])
  })

  it("does not mutate the input", () => {
    const input = [course("A", 1), course("B", 2)]
    pickFeaturedCourses(input)
    expect(input.map((c) => c.title)).toEqual(["A", "B"])
  })
})

describe("lessonXp", () => {
  it("awards 10 XP per lesson", () => {
    expect(lessonXp({ lessonCount: 48 })).toBe(480)
    expect(lessonXp({})).toBe(0)
  })
})
