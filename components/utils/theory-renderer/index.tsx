"use client"

import { Lightbulb, AlertTriangle, Copy } from "lucide-react"
import { Card } from "@/components/ui/card"
import { TypographyH4 } from "@/components/utils/typography/typography-h4"
import { TypographyP } from "@/components/utils/typography/typography-p"
import type { TTheoryBlock } from "@/utils/interfaces/learn"

interface Props {
  blocks: TTheoryBlock[]
}

export function TheoryRenderer({ blocks }: Props) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === "intro") {
          return (
            <Card key={i} className="rounded-2xl p-5">
              <TypographyP className="text-sm leading-relaxed text-muted-foreground">
                {block.body}
              </TypographyP>
            </Card>
          )
        }

        if (block.type === "code") {
          return (
            <Card key={i} className="rounded-2xl p-5">
              <TypographyH4 className="mb-3 text-foreground">{block.title}</TypographyH4>
              <div className="rounded-xl border border-white/10 bg-[#0d0d1a] overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
                  <span className="font-mono text-[10px] text-white/30">
                    {block.language ?? "python"}
                  </span>
                  <Copy className="size-3 cursor-pointer text-white/30 hover:text-white/60 transition-colors" />
                </div>
                <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-white/85 whitespace-pre">
                  {block.code}
                </pre>
              </div>
            </Card>
          )
        }

        if (block.type === "tip") {
          return (
            <Card
              key={i}
              className="rounded-2xl border-amber-200 bg-amber-50/50 p-5 dark:border-amber-500/25 dark:bg-amber-500/5"
            >
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="size-4 text-amber-500" />
                <TypographyH4 className="text-amber-700 dark:text-amber-300">
                  {block.title}
                </TypographyH4>
              </div>
              <TypographyP className="text-sm leading-relaxed text-muted-foreground">
                {block.body}
              </TypographyP>
            </Card>
          )
        }

        if (block.type === "warning") {
          return (
            <Card
              key={i}
              className="rounded-2xl border-red-200 bg-red-50/50 p-5 dark:border-red-500/25 dark:bg-red-500/5"
            >
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-500" />
                <TypographyH4 className="text-red-700 dark:text-red-300">
                  {block.title}
                </TypographyH4>
              </div>
              <TypographyP className="text-sm leading-relaxed text-muted-foreground">
                {block.body}
              </TypographyP>
            </Card>
          )
        }

        if (block.type === "terms") {
          return (
            <Card key={i} className="rounded-2xl p-5">
              <TypographyH4 className="mb-4 text-foreground">Key Terms</TypographyH4>
              <div className="space-y-3">
                {block.items.map((item) => (
                  <div key={item.term} className="flex items-start gap-3">
                    <code className="mt-0.5 shrink-0 rounded bg-cyan-50 px-2 py-0.5 font-mono text-xs text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                      {item.term}
                    </code>
                    <div>
                      <span className="text-xs text-muted-foreground">{item.desc} </span>
                      <span className="text-[10px] text-muted-foreground/50">/ {item.termKh}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        }

        if (block.type === "comparison") {
          return (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[block.left, block.right].map((side, j) => (
                <Card key={j} className="rounded-2xl p-4">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">{side.label}</p>
                  <div className="rounded-xl border border-white/10 bg-[#0d0d1a] overflow-hidden">
                    <pre className="overflow-x-auto px-3 py-2.5 font-mono text-xs leading-relaxed text-white/80 whitespace-pre">
                      {side.code}
                    </pre>
                  </div>
                </Card>
              ))}
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
