import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { StarRating } from "@/components/course/course-ratings/star-rating"

/** Stars whose icon carries the amber fill class. */
const filledCount = (container: HTMLElement) =>
  container.querySelectorAll("svg.fill-amber-400").length

describe("StarRating (read-only)", () => {
  it("fills a star per whole point", () => {
    const { container } = render(<StarRating value={3} />)
    expect(filledCount(container)).toBe(3)
  })

  it("rounds to nearest rather than flooring", () => {
    // 4.6 should read as 5 filled, not 4 — flooring makes 4.9 look like 4.
    const { container } = render(<StarRating value={4.6} />)
    expect(filledCount(container)).toBe(5)
  })

  it("rounds a low fraction down", () => {
    const { container } = render(<StarRating value={4.2} />)
    expect(filledCount(container)).toBe(4)
  })

  it("fills nothing at zero", () => {
    const { container } = render(<StarRating value={0} />)
    expect(filledCount(container)).toBe(0)
  })

  it("exposes the value to assistive tech", () => {
    const { getByLabelText } = render(<StarRating value={4} />)
    expect(getByLabelText("4 out of 5")).toBeInTheDocument()
  })

  it("renders no buttons when read-only", () => {
    const { queryAllByRole } = render(<StarRating value={4} />)
    expect(queryAllByRole("radio")).toHaveLength(0)
  })
})

describe("StarRating (interactive)", () => {
  it("renders a pickable star per point", () => {
    const { getAllByRole } = render(<StarRating value={0} onChange={vi.fn()} />)
    expect(getAllByRole("radio")).toHaveLength(5)
  })

  it("reports the star that was picked", async () => {
    const onChange = vi.fn()
    const { getByLabelText } = render(
      <StarRating value={0} onChange={onChange} />
    )
    await userEvent.click(getByLabelText("4 stars"))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it("labels a single star in the singular", () => {
    const { getByLabelText } = render(
      <StarRating value={0} onChange={vi.fn()} />
    )
    expect(getByLabelText("1 star")).toBeInTheDocument()
  })

  it("marks the current value as checked", () => {
    const { getByLabelText } = render(
      <StarRating value={3} onChange={vi.fn()} />
    )
    expect(getByLabelText("3 stars")).toHaveAttribute("aria-checked", "true")
    expect(getByLabelText("2 stars")).toHaveAttribute("aria-checked", "false")
  })
})
