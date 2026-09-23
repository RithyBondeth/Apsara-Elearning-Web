import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LeaderboardRow } from "@/components/leaderboard/leaderboard-row"
import type { IApiLeaderboardEntry } from "@/utils/interfaces/leaderboard/api.interface"

function entry(over: Partial<IApiLeaderboardEntry> = {}): IApiLeaderboardEntry {
  return {
    rank: 4,
    userId: "u1",
    displayName: "Sok D.",
    avatar: "rocket",
    xp: 2450,
    streak: 7,
    isViewer: false,
    ...over,
  }
}

describe("LeaderboardRow", () => {
  it("shows the display name, level and formatted XP", () => {
    const { getByText } = render(<LeaderboardRow entry={entry()} />)
    expect(getByText("Sok D.")).toBeInTheDocument()
    expect(getByText("Level 9")).toBeInTheDocument()
    expect(getByText("2,450 XP")).toBeInTheDocument()
  })

  it("shows a medal instead of the number on the podium", () => {
    const { getByText, queryByText } = render(
      <LeaderboardRow entry={entry({ rank: 1 })} />
    )
    expect(getByText("🥇")).toBeInTheDocument()
    expect(queryByText("1")).toBeNull()
  })

  it("shows the plain rank number below the podium", () => {
    const { getByText } = render(<LeaderboardRow entry={entry({ rank: 12 })} />)
    expect(getByText("12")).toBeInTheDocument()
  })

  it("highlights the viewer's own row", () => {
    const { getByTestId } = render(
      <LeaderboardRow entry={entry({ isViewer: true })} />
    )
    expect(getByTestId("leaderboard-row").className).toContain("violet")
  })

  it("does not highlight another learner's row", () => {
    const { getByTestId } = render(
      <LeaderboardRow entry={entry({ isViewer: false })} />
    )
    expect(getByTestId("leaderboard-row").className).not.toContain("violet")
  })

  it("shows the streak only when there is one", () => {
    const { queryByTitle, rerender } = render(
      <LeaderboardRow entry={entry({ streak: 7 })} />
    )
    expect(queryByTitle("7-day streak")).toBeInTheDocument()

    rerender(<LeaderboardRow entry={entry({ streak: 0 })} />)
    expect(queryByTitle("0-day streak")).toBeNull()
  })

  it("renders a learner with no avatar preset", () => {
    // The API sends null for an account that never picked one.
    const { getByText } = render(
      <LeaderboardRow entry={entry({ avatar: null })} />
    )
    expect(getByText("Sok D.")).toBeInTheDocument()
  })
})
