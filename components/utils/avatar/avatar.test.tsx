import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Avatar } from "@/components/utils/avatar"

describe("Avatar", () => {
  it("renders an icon glyph", () => {
    const { container } = render(<Avatar preset="rocket" />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("applies the gradient for a known preset", () => {
    const { container } = render(<Avatar preset="star" />)
    // star -> amber/orange gradient
    expect(container.firstChild).toHaveClass("from-amber-400")
  })

  it("falls back to the default (rocket) for an unknown preset", () => {
    const { container } = render(<Avatar preset="not-a-preset" />)
    expect(container.firstChild).toHaveClass("from-blue-500")
  })

  it("falls back to the default for a null preset", () => {
    const { container } = render(<Avatar preset={null} />)
    expect(container.firstChild).toHaveClass("from-blue-500")
  })

  it("applies the size tile classes", () => {
    const { container } = render(<Avatar preset="rocket" size="lg" />)
    expect(container.firstChild).toHaveClass("size-16", "rounded-2xl")
  })

  it("merges a custom className", () => {
    const { container } = render(<Avatar preset="rocket" className="ring-2" />)
    expect(container.firstChild).toHaveClass("ring-2")
  })
})
