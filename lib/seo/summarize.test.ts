import { describe, expect, it } from "vitest"
import { summarize } from "./summarize"

describe("summarize", () => {
  it("keeps a short description as is, with whitespace collapsed", () => {
    expect(summarize("  Limits,\n  derivatives and   integrals. ")).toBe(
      "Limits, derivatives and integrals."
    )
  })

  it("cuts a long description at a word boundary within 160 characters", () => {
    const long = "word ".repeat(60).trim()
    const result = summarize(long)

    expect(result.length).toBeLessThanOrEqual(160)
    expect(result.endsWith("word…")).toBe(true)
  })

  it("cuts mid-text when there's no space to break on (e.g. Khmer)", () => {
    const khmer = "ក".repeat(300)
    const result = summarize(khmer)

    expect(result).toHaveLength(160)
    expect(result.endsWith("…")).toBe(true)
  })
})
