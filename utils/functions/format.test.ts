import { describe, expect, it } from "vitest"

import {
  formatNumber,
  levelFromXp,
  pluralize,
  singularize,
  toKhmerNumerals,
  truncate,
  xpForNextLevel,
  xpToLevel,
  zeroPad,
} from "@/utils/functions/format"

describe("formatNumber", () => {
  it("adds locale-aware thousands separators", () => {
    expect(formatNumber(12000)).toBe("12,000")
    expect(formatNumber(1234567)).toBe("1,234,567")
  })

  it("leaves small numbers untouched", () => {
    expect(formatNumber(0)).toBe("0")
    expect(formatNumber(999)).toBe("999")
  })
})

describe("toKhmerNumerals", () => {
  it("maps each digit to its Khmer numeral", () => {
    expect(toKhmerNumerals(12)).toBe("១២")
    expect(toKhmerNumerals(0)).toBe("០")
    expect(toKhmerNumerals(2450)).toBe("២៤៥០")
  })
})

describe("truncate", () => {
  it("appends an ellipsis when longer than max", () => {
    expect(truncate("Hello World", 5)).toBe("Hello…")
  })

  it("returns the string unchanged when within max", () => {
    expect(truncate("Hi", 5)).toBe("Hi")
    // Exactly max length is not truncated.
    expect(truncate("Hello", 5)).toBe("Hello")
  })
})

describe("XP level math", () => {
  it("levelFromXp starts at level 1 and advances every 300 XP", () => {
    expect(levelFromXp(0)).toBe(1)
    expect(levelFromXp(299)).toBe(1)
    expect(levelFromXp(300)).toBe(2)
    expect(levelFromXp(2450)).toBe(9)
  })

  it("xpForNextLevel returns the current level's XP ceiling", () => {
    expect(xpForNextLevel(2450)).toBe(2700)
    expect(xpForNextLevel(0)).toBe(300)
  })

  it("xpToLevel renders a human-readable label", () => {
    expect(xpToLevel(2450)).toBe("Level 9")
    expect(xpToLevel(0)).toBe("Level 1")
  })
})

describe("singularize", () => {
  it("handles the -ies shape", () => {
    expect(singularize("Faculties")).toBe("Faculty")
  })

  it("handles a plain trailing s (case-insensitive)", () => {
    expect(singularize("Grade levels")).toBe("Grade level")
    expect(singularize("Courses")).toBe("Course")
    expect(singularize("Subjects")).toBe("Subject")
  })
})

describe("pluralize", () => {
  it("keeps the singular for a count of one", () => {
    expect(pluralize(1, "module")).toBe("1 module")
  })

  it("defaults to a trailing s for other counts", () => {
    expect(pluralize(4, "lesson")).toBe("4 lessons")
    expect(pluralize(0, "lesson")).toBe("0 lessons")
  })

  it("uses an explicit irregular plural when given", () => {
    expect(pluralize(2, "Faculty", "Faculties")).toBe("2 Faculties")
  })
})

describe("zeroPad", () => {
  it("pads to the default width of two", () => {
    expect(zeroPad(7)).toBe("07")
    expect(zeroPad(5)).toBe("05")
  })

  it("respects an explicit width and never truncates", () => {
    expect(zeroPad(7, 3)).toBe("007")
    expect(zeroPad(100, 2)).toBe("100")
  })
})
