import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { MatchingInput, isMatchingComplete, type IMatchPair } from "./matching-input"

/** Translation stub: key plus any values, so assertions can see both. */
const t = ((key: string, values?: Record<string, unknown>) =>
  values ? `${key}:${JSON.stringify(values)}` : key) as never

const lefts = ["H2O", "NaCl", "CO2"]
/* Shuffled, as the attempt-start payload sends them. */
const rights = ["Carbon dioxide", "Water", "Salt"]

/** Holds the answer like the quiz runner does, and exposes every change. */
function Harness({ onPairs }: { onPairs: (pairs: IMatchPair[]) => void }) {
  const [data, setData] = useState<Record<string, unknown> | undefined>()
  return (
    <MatchingInput
      lefts={lefts}
      rights={rights}
      value={data}
      disabled={false}
      onChange={(next) => {
        setData(next)
        onPairs(next.pairs)
      }}
      t={t}
    />
  )
}

const selectFor = (left: string) =>
  screen.getByRole("combobox", { name: `matchFor:${JSON.stringify({ item: left })}` })

describe("MatchingInput", () => {
  it("offers every right item, in the order the server shuffled them", () => {
    render(<Harness onPairs={() => {}} />)

    for (const left of lefts) expect(screen.getByText(left)).toBeInTheDocument()
    const options = Array.from(selectFor("H2O").querySelectorAll("option")).map((o) => o.textContent)
    expect(options).toEqual(["matchPlaceholder", ...rights])
  })

  it("submits the pairs in the shape the grader reads", async () => {
    const user = userEvent.setup()
    let last: IMatchPair[] = []
    render(<Harness onPairs={(p) => (last = p)} />)

    await user.selectOptions(selectFor("CO2"), "Carbon dioxide")
    await user.selectOptions(selectFor("H2O"), "Water")
    expect(last).toEqual([
      { left: "H2O", right: "Water" },
      { left: "CO2", right: "Carbon dioxide" },
    ])
    expect(isMatchingComplete(lefts, { pairs: last })).toBe(false)

    await user.selectOptions(selectFor("NaCl"), "Salt")
    expect(isMatchingComplete(lefts, { pairs: last })).toBe(true)
    expect(selectFor("NaCl")).toHaveDisplayValue("Salt")

    /* Clearing a pick drops the pair, so the question is unanswered again. */
    await user.selectOptions(selectFor("NaCl"), "matchPlaceholder")
    expect(last).toHaveLength(2)
    expect(isMatchingComplete(lefts, { pairs: last })).toBe(false)
  })
})

describe("isMatchingComplete", () => {
  it("needs a right for every left", () => {
    expect(isMatchingComplete(["a", "b"], undefined)).toBe(false)
    expect(isMatchingComplete(["a", "b"], { pairs: [{ left: "a", right: "1" }] })).toBe(false)
    expect(
      isMatchingComplete(["a", "b"], {
        pairs: [
          { left: "a", right: "1" },
          { left: "b", right: "2" },
        ],
      })
    ).toBe(true)
  })

  it("is never complete without left items", () => {
    expect(isMatchingComplete([], { pairs: [] })).toBe(false)
  })
})
