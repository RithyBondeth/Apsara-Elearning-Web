import { describe, expect, it } from "vitest"
import { fromDraft, toDraft, validateDraft } from "./answer-spec"

describe("toDraft", () => {
  it("reads every stored shape into editable strings", () => {
    expect(toDraft({ value: 42, tolerance: 0.5 })).toMatchObject({
      value: "42",
      tolerance: "0.5",
    })
    expect(toDraft({ accepted: ["const", 3], caseSensitive: true })).toEqual({
      accepted: ["const"],
      caseSensitive: true,
    })
    expect(toDraft({ pairs: [{ left: "2+2", right: 4 }] }).pairs).toEqual([
      { left: "2+2", right: "4" },
    ])
  })

  it("accepts true/false stored as booleans or strings, like the grader", () => {
    expect(toDraft({ value: true }).truth).toBe(true)
    expect(toDraft({ value: "false" }).truth).toBe(false)
  })

  it("treats a missing or malformed spec as empty", () => {
    expect(toDraft(undefined)).toEqual({})
    expect(toDraft(null)).toEqual({})
    expect(toDraft([1, 2])).toEqual({})
  })
})

describe("validateDraft", () => {
  it("needs a choice for true/false", () => {
    expect(validateDraft("true_false", {})).toMatch(/True or False/)
    expect(validateDraft("true_false", { truth: false })).toBeNull()
  })

  it("needs a finite number and a non-negative tolerance", () => {
    expect(validateDraft("numeric", { value: " " })).toMatch(/correct number/)
    expect(validateDraft("numeric", { value: "abc" })).toMatch(/must be a number/)
    expect(validateDraft("numeric", { value: "3", tolerance: "-1" })).toMatch(/Tolerance/)
    expect(validateDraft("numeric", { value: "3", tolerance: "x" })).toMatch(/Tolerance/)
    expect(validateDraft("numeric", { value: "-2.5", tolerance: "" })).toBeNull()
  })

  it("needs an accepted answer for fill-blank, but not for short answer", () => {
    expect(validateDraft("fill_blank", { accepted: ["", "  "] })).toMatch(/accepted answer/)
    /* An empty list sends every answer to manual grading — a valid choice. */
    expect(validateDraft("short_answer", { accepted: [] })).toBeNull()
  })

  it("needs two complete, distinct pairs for matching", () => {
    expect(
      validateDraft("matching", { pairs: [{ left: "a", right: "" }, { left: "b", right: "2" }] })
    ).toMatch(/both a left and a right/)
    expect(validateDraft("matching", { pairs: [{ left: "a", right: "1" }] })).toMatch(/two pairs/)
    /* The grader folds case and spaces before keying by the left side. */
    expect(
      validateDraft("matching", {
        pairs: [
          { left: "H2O", right: "water" },
          { left: " h2o ", right: "ice" },
        ],
      })
    ).toMatch(/left side must be different/)
    expect(
      validateDraft("matching", {
        pairs: [
          { left: "H2O", right: "water" },
          { left: "NaCl", right: "salt" },
          { left: "", right: "" },
        ],
      })
    ).toBeNull()
  })

  it("never blocks multiple choice", () => {
    expect(validateDraft("multiple_choice", {})).toBeNull()
  })
})

describe("fromDraft", () => {
  it("builds the shapes the grader reads", () => {
    expect(fromDraft("true_false", { truth: false })).toEqual({ value: false })
    expect(fromDraft("numeric", { value: "42", tolerance: "0.5" })).toEqual({
      value: 42,
      tolerance: 0.5,
    })
    expect(fromDraft("numeric", { value: "7", tolerance: " " })).toEqual({ value: 7 })
    expect(
      fromDraft("fill_blank", { accepted: [" const ", "", "let"], caseSensitive: true })
    ).toEqual({ accepted: ["const", "let"], caseSensitive: true })
    expect(fromDraft("short_answer", {})).toEqual({ accepted: [], caseSensitive: false })
    expect(
      fromDraft("matching", {
        pairs: [
          { left: " a ", right: "1" },
          { left: "", right: "" },
        ],
      })
    ).toEqual({ pairs: [{ left: "a", right: "1" }] })
  })

  it("sends nothing for multiple choice", () => {
    expect(fromDraft("multiple_choice", { truth: true })).toBeNull()
  })

  it("round-trips a stored spec unchanged", () => {
    const stored = { accepted: ["photosynthesis"], caseSensitive: false }
    expect(fromDraft("short_answer", toDraft(stored))).toEqual(stored)
  })
})
