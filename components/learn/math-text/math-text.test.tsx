import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MathText } from "@/components/learn/math-text"

describe("MathText", () => {
  it("renders plain text", () => {
    const { getByText } = render(<MathText>{"Hello world"}</MathText>)
    expect(getByText("Hello world")).toBeInTheDocument()
  })

  it("typesets inline LaTeX with KaTeX", () => {
    const { container } = render(<MathText>{"Area is $x^2$ units"}</MathText>)
    // rehype-katex emits a .katex element for the math run.
    expect(container.querySelector(".katex")).toBeInTheDocument()
  })

  it("keeps the run inline (no block <p> wrapper)", () => {
    // INLINE_COMPONENTS collapses the top-level <p> so it can sit in a button/cell.
    const { container } = render(<MathText>{"just text"}</MathText>)
    expect(container.querySelector("p")).toBeNull()
  })

  it("renders markdown emphasis", () => {
    const { container } = render(<MathText>{"a **bold** word"}</MathText>)
    const strong = container.querySelector("strong")
    expect(strong).toBeInTheDocument()
    expect(strong).toHaveTextContent("bold")
  })
})
