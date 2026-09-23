import { describe, expect, it } from "vitest"

import { isPodium, medalFor, ordinal, rankTone } from "@/utils/functions/leaderboard"

describe("medalFor", () => {
  it("gives a medal to each podium rank", () => {
    expect(medalFor(1)).toBe("🥇")
    expect(medalFor(2)).toBe("🥈")
    expect(medalFor(3)).toBe("🥉")
  })

  it("gives nothing below the podium", () => {
    expect(medalFor(4)).toBeNull()
    expect(medalFor(99)).toBeNull()
  })
})

describe("isPodium", () => {
  it("covers ranks 1 to 3 only", () => {
    expect([1, 2, 3].map(isPodium)).toEqual([true, true, true])
    expect(isPodium(4)).toBe(false)
    // A rank is 1-based, so 0 is not a podium place.
    expect(isPodium(0)).toBe(false)
  })
})

describe("rankTone", () => {
  it("uses a distinct tone per podium place", () => {
    const tones = [rankTone(1), rankTone(2), rankTone(3)]
    expect(new Set(tones).size).toBe(3)
  })

  it("falls back to the neutral tone below the podium", () => {
    expect(rankTone(4)).toBe(rankTone(100))
    expect(rankTone(4)).toContain("muted")
  })
})

describe("ordinal", () => {
  it("uses st/nd/rd for 1, 2, 3", () => {
    expect(ordinal(1)).toBe("1st")
    expect(ordinal(2)).toBe("2nd")
    expect(ordinal(3)).toBe("3rd")
  })

  it("uses th for 4 through 10", () => {
    expect(ordinal(4)).toBe("4th")
    expect(ordinal(10)).toBe("10th")
  })

  it("treats 11-13 as irregular", () => {
    expect(ordinal(11)).toBe("11th")
    expect(ordinal(12)).toBe("12th")
    expect(ordinal(13)).toBe("13th")
  })

  it("resumes the pattern past the teens", () => {
    expect(ordinal(21)).toBe("21st")
    expect(ordinal(22)).toBe("22nd")
    expect(ordinal(23)).toBe("23rd")
    expect(ordinal(101)).toBe("101st")
    // 111-113 are irregular again, not 111st.
    expect(ordinal(111)).toBe("111th")
  })
})
