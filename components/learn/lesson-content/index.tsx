"use client"

import { useMemo } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { AlertTriangle, BookMarked, FunctionSquare, Lightbulb, ListChecks } from "lucide-react"
import { GraphPlot } from "@/components/learn/graph-plot"
import "katex/dist/katex.min.css"

/**
 * Renders a lesson's markdown with the pedagogically-important sections lifted
 * into themed callout boxes — Definition, Example, and Key-points — so a student
 * scanning a math lesson can find the concept, the worked example, and the
 * takeaways at a glance. Everything else renders as normal prose, and the
 * `.lesson-prose` styling (formula cards, Khmer-safe leading) applies inside
 * boxes too.
 *
 * Section detection keys off the Khmer heading vocabulary the seed content uses
 * consistently (see scripts/content). Headings that don't match stay as plain
 * sub-headings, so this degrades gracefully for any lesson or course.
 */

type TCallout = "definition" | "formula" | "example" | "pitfall" | "remember"

const CALLOUTS: Record<TCallout, {
  icon: typeof BookMarked
  box: string
  chip: string
  iconColor: string
}> = {
  definition: {
    icon: BookMarked,
    box: "border-violet-200 bg-violet-50/50 dark:border-violet-500/25 dark:bg-violet-500/10",
    chip: "bg-violet-100 dark:bg-violet-500/20",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  formula: {
    icon: FunctionSquare,
    box: "border-cyan-200 bg-cyan-50/50 dark:border-cyan-500/25 dark:bg-cyan-500/10",
    chip: "bg-cyan-100 dark:bg-cyan-500/20",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  example: {
    icon: Lightbulb,
    box: "border-amber-200 bg-amber-50/50 dark:border-amber-500/25 dark:bg-amber-500/10",
    chip: "bg-amber-100 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  pitfall: {
    icon: AlertTriangle,
    box: "border-rose-200 bg-rose-50/50 dark:border-rose-500/25 dark:bg-rose-500/10",
    chip: "bg-rose-100 dark:bg-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  remember: {
    icon: ListChecks,
    box: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/10",
    chip: "bg-emerald-100 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
}

/**
 * Maps a heading to a callout type by its leading Khmer keyword, else null.
 * Order matters: an "ឧទាហរណ៍… ក្បួន…" heading is an example, not a formula.
 */
function calloutFor(heading: string): TCallout | null {
  if (heading.startsWith("និយមន័យ")) return "definition"
  if (heading.startsWith("ឧទាហរណ៍")) return "example"
  if (heading.startsWith("កំហុស")) return "pitfall"
  if (heading.startsWith("ចំណុចសំខាន់")) return "remember"
  if (
    heading.startsWith("រូបមន្ត") ||
    heading.startsWith("ក្បួន") ||
    heading.startsWith("លក្ខណៈ")
  ) {
    return "formula"
  }
  return null
}

interface Section {
  /** Heading text without the `#` markers, or null for the pre-heading intro. */
  heading: string | null
  /** Full heading line (`### …`), kept so normal sections re-render as-is. */
  headingLine: string | null
  callout: TCallout | null
  body: string
}

/** Splits markdown at each `##`/`###` heading into renderable sections. */
function splitSections(md: string): Section[] {
  const sections: Section[] = []
  let heading: string | null = null
  let headingLine: string | null = null
  let lines: string[] = []

  const flush = () => {
    if (heading === null && lines.join("").trim() === "") return
    sections.push({
      heading,
      headingLine,
      callout: heading ? calloutFor(heading) : null,
      body: lines.join("\n").trim(),
    })
  }

  for (const line of md.split("\n")) {
    const m = line.match(/^(#{2,3})\s+(.*)$/)
    if (m) {
      flush()
      heading = m[2].trim()
      headingLine = line
      lines = []
    } else {
      lines.push(line)
    }
  }
  flush()
  return sections
}

/**
 * Pulls the raw text and language class out of a `<pre>`'s child `<code>` hast
 * node, so a ```graph fence can be routed to <GraphPlot> instead of a code box.
 */
function readCodeBlock(node: unknown): { lang: string | null; value: string } {
  const el = node as
    | { children?: Array<{ tagName?: string; properties?: { className?: unknown }; children?: Array<{ value?: string }> }> }
    | undefined
  const code = el?.children?.find((c) => c.tagName === "code")
  const className = code?.properties?.className
  const lang = Array.isArray(className)
    ? (className.find((c) => typeof c === "string" && c.startsWith("language-")) as string | undefined)?.slice("language-".length) ?? null
    : null
  const value = code?.children?.map((c) => c.value ?? "").join("") ?? ""
  return { lang, value }
}

/* Shared markdown renderers — 15px body, Khmer-safe headings, violet markers.
   Formula/code blocks are styled via `.lesson-prose` in globals.css. */
const MARKDOWN_COMPONENTS: Components = {
  pre: ({ children, node }) => {
    const { lang, value } = readCodeBlock(node)
    if (lang === "graph") return <GraphPlot spec={value} />
    return <pre>{children}</pre>
  },
  img: ({ src, alt }) => (
    <span className="my-5 block overflow-hidden rounded-2xl border bg-[#fbfaf5] shadow-sm">
      {/* Lesson images are trusted curriculum assets served from /public. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={typeof src === "string" ? src : ""}
        alt={alt ?? ""}
        className="h-auto w-full object-contain"
        loading="lazy"
      />
    </span>
  ),
  h1: ({ children }) => <h2 className="mt-8 mb-2 text-xl font-bold text-foreground leading-khmer">{children}</h2>,
  h2: ({ children }) => <h3 className="mt-7 mb-2 text-lg font-bold text-foreground leading-khmer">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-5 mb-1.5 text-base font-semibold text-foreground leading-khmer">{children}</h4>,
  p:  ({ children }) => <p className="text-[15px] leading-7 text-muted-foreground">{children}</p>,
  ul: ({ children }) => <ul className="list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground marker:text-violet-400">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground marker:text-violet-400">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-violet-300 pl-4 text-[15px] leading-7 text-muted-foreground dark:border-violet-500/40">
      {children}
    </blockquote>
  ),
}

function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={MARKDOWN_COMPONENTS}
    >
      {children}
    </ReactMarkdown>
  )
}

function CalloutBox({ type, title, body }: { type: TCallout; title: string; body: string }) {
  const c = CALLOUTS[type]
  const Icon = c.icon
  return (
    <div className={`rounded-2xl border p-5 ${c.box}`}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${c.chip}`}>
          <Icon className={`size-4 ${c.iconColor}`} />
        </span>
        <span className="text-sm font-bold text-foreground leading-khmer">{title}</span>
      </div>
      <div className="space-y-4">
        <Markdown>{body}</Markdown>
      </div>
    </div>
  )
}

export function LessonContent({ content }: { content: string }) {
  const sections = useMemo(() => splitSections(content), [content])

  return (
    <div className="lesson-prose space-y-5 text-[15px] leading-7 text-foreground">
      {sections.map((section, i) =>
        section.callout && section.heading ? (
          <CalloutBox
            key={i}
            type={section.callout}
            title={section.heading}
            body={section.body}
          />
        ) : (
          <div key={i} className="space-y-4">
            <Markdown>
              {[section.headingLine, section.body].filter(Boolean).join("\n\n")}
            </Markdown>
          </div>
        )
      )}
    </div>
  )
}
