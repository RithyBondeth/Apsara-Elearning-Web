"use client"

import ReactMarkdown, { type Components } from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

/**
 * Renders a short string with inline LaTeX math ($…$) typeset by KaTeX — for
 * quiz questions, option labels, and explanations, where the text is a single
 * run rather than a full markdown document. Block wrappers collapse to inline
 * spans so it drops into a <button>, <p>, or table cell without breaking layout.
 *
 * Use LessonContent (not this) for multi-paragraph lesson bodies with display
 * equations, callout boxes, and tables.
 */

const INLINE_COMPONENTS: Components = {
  // ReactMarkdown wraps top-level text in <p>; keep it inline here.
  p: ({ children }) => <>{children}</>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
}

export function MathText({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={INLINE_COMPONENTS}>
      {children}
    </ReactMarkdown>
  )
}
