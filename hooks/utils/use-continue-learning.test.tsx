import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useContinueLearning } from "@/hooks/utils/use-continue-learning"
import type { IApiContinueLearning } from "@/utils/interfaces/continue-learning/api.interface"

const getContinueLearning = vi.hoisted(() => vi.fn())
vi.mock("@/lib/api/enrollment", () => ({ getContinueLearning }))

const card = (over: Partial<IApiContinueLearning> = {}): IApiContinueLearning => ({
  courseId: "c1",
  courseSlug: "intro-js",
  courseTitle: "Intro to JavaScript",
  courseTitleKm: null,
  thumbnail: null,
  progressPercent: 40,
  totalLessons: 5,
  completedLessons: 2,
  nextLesson: { id: "l3", slug: "lesson-3", title: "Loops", moduleTitle: "Basics" },
  lastActivityAt: "2026-09-20T10:00:00.000Z",
  ...over,
})

beforeEach(() => vi.clearAllMocks())

describe("useContinueLearning", () => {
  it("starts as null so the caller can show a skeleton", () => {
    getContinueLearning.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useContinueLearning())
    expect(result.current).toBeNull()
  })

  it("resolves to the cards the API returns", async () => {
    getContinueLearning.mockResolvedValue([card()])
    const { result } = renderHook(() => useContinueLearning())

    await waitFor(() => expect(result.current).not.toBeNull())
    expect(result.current).toHaveLength(1)
    expect(result.current?.[0].nextLesson?.slug).toBe("lesson-3")
  })

  it("falls back to an empty list when the request fails", async () => {
    // A guest hits a 401 here — that must read as "nothing to resume",
    // not as a permanent loading state.
    getContinueLearning.mockRejectedValue(new Error("401"))
    const { result } = renderHook(() => useContinueLearning())

    await waitFor(() => expect(result.current).toEqual([]))
  })

  it("passes the limit through to the API", async () => {
    getContinueLearning.mockResolvedValue([])
    renderHook(() => useContinueLearning(1))
    await waitFor(() => expect(getContinueLearning).toHaveBeenCalledWith(1))
  })
})
