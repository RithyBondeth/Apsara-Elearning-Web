"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  Sparkles, Brain, ArrowLeft, ChevronRight, ChevronDown,
  Play, CheckCircle2, Circle, Lock, Send, Terminal,
  BookOpen, Trophy, Lightbulb, RotateCcw, Maximize2, Copy,
  X, Loader2, ThumbsUp, ThumbsDown, Code2, ChevronLeft,
  Calculator, Atom, Languages, Zap,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/utils/themes/theme-toggle"
import { LanguageSwitcher } from "@/components/utils/language-switcher"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { TheoryRenderer } from "@/components/utils/theory-renderer"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyH4 } from "@/components/utils/typography/typography-h4"
import { TypographyP } from "@/components/utils/typography/typography-p"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import type { TLearnTab } from "@/utils/types/learn"
import type { ILesson, IMessage } from "@/utils/interfaces/learn"
import { DEFAULT_AI_WELCOME } from "@/utils/constants/learn.constant"
import { COURSE_MODULES, courseLessons, defaultLessonId } from "@/utils/constants/course-content.constant"
import { COURSE_DETAILS } from "@/utils/constants/course-detail.constant"

/* ── helpers ─────────────────────────────────────────────────────────── */

function now() {
  return new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })
}

const DEFAULT_TAB: Record<ILesson["type"], TLearnTab> = {
  theory:    "theory",
  practice:  "practice",
  challenge: "challenge",
}

const COURSE_ICONS: Record<string, React.ElementType> = {
  Terminal, Code2, Brain, Calculator, Atom, Languages,
}

/** A lesson is playable once any authored content exists for it. */
function hasContent(lesson: ILesson) {
  return Boolean(lesson.theory || lesson.codeTemplate || lesson.challenge || lesson.task)
}

/* ── props ───────────────────────────────────────────────────────────── */

interface LearnPlayerProps {
  /** Course slug — must exist in COURSE_MODULES */
  slug: string
  /** Lesson to open on mount (defaults to the course's current lesson) */
  initialLessonId?: number
}

/* ── component ───────────────────────────────────────────────────────── */

export function LearnPlayer({ slug, initialLessonId }: LearnPlayerProps) {
  const t  = useTranslations("learn")
  const tc = useTranslations("courses")

  const modules = COURSE_MODULES[slug]
  const lessons = useMemo(() => courseLessons(slug), [slug])

  const courseMeta  = COURSE_DETAILS[slug]
  const CourseIcon  = COURSE_ICONS[courseMeta?.icon ?? "BookOpen"] ?? BookOpen
  const courseTitle = tc(`${slug}.title`)

  const [currentLesson, setCurrentLesson] = useState<ILesson>(() => {
    const wanted = initialLessonId ?? defaultLessonId(slug)
    return lessons.find((l) => l.id === wanted) ?? lessons[0]
  })

  const [activeTab,    setActiveTab]    = useState<TLearnTab>(DEFAULT_TAB[currentLesson.type])
  const [code,         setCode]         = useState(currentLesson.codeTemplate ?? "# Start coding here\n")
  const [running,      setRunning]      = useState(false)
  const [outputLines,  setOutputLines]  = useState<string[]>([])
  const [showOutput,   setShowOutput]   = useState(false)
  const [messages,     setMessages]     = useState<IMessage[]>([
    { ...(currentLesson.aiWelcome
        ? { role: "ai", content: currentLesson.aiWelcome, time: "Just now" }
        : DEFAULT_AI_WELCOME) },
  ])
  const [input,        setInput]        = useState("")
  const [aiTyping,     setAiTyping]     = useState(false)
  const [openSections, setOpenSections] = useState<number[]>(() => modules.map((_, i) => i))
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /* scroll AI chat to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* switch lesson — keeps the URL deep-linkable without a full navigation */
  const switchLesson = useCallback((lesson: ILesson) => {
    if (lesson.locked) return
    setCurrentLesson(lesson)
    setActiveTab(DEFAULT_TAB[lesson.type])
    setCode(lesson.codeTemplate ?? "# Start coding here\n")
    setOutputLines([])
    setShowOutput(false)
    setMessages([{
      role: "ai",
      content: lesson.aiWelcome ?? DEFAULT_AI_WELCOME.content,
      time: "Just now",
    }])
    setSidebarOpen(false)
    window.history.replaceState(null, "", `/learn/${slug}/${lesson.id}`)
  }, [slug])

  /* navigate prev/next */
  const currentIdx = lessons.findIndex((l) => l.id === currentLesson.id)
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null
  const nextLesson = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null

  /* run code simulation */
  const runCode = () => {
    const lines = currentLesson.outputLines ?? ["# No output defined for this lesson"]
    setRunning(true)
    setShowOutput(true)
    setOutputLines([])
    let i = 0
    const iv = setInterval(() => {
      if (i < lines.length) {
        setOutputLines((prev) => [...prev, lines[i]])
        i++
      } else {
        clearInterval(iv)
        setRunning(false)
      }
    }, 280)
  }

  /* reset code to template */
  const resetCode = () => {
    setCode(currentLesson.codeTemplate ?? "# Start coding here\n")
    setOutputLines([])
    setShowOutput(false)
  }

  /* AI chat */
  const sendMessage = (text: string) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { role: "user", content: text, time: now() }])
    setInput("")
    setAiTyping(true)
    setTimeout(() => {
      const response =
        currentLesson.aiResponses?.[text] ??
        "That's a great question!\n\nTry experimenting with the code editor — hands-on practice is the best teacher!\n\nAsk me in Khmer if you prefer: ខ្ញុំចូលចិត្តការពន្យល់ជាភាសាខ្មែរ!"
      setMessages((prev) => [...prev, { role: "ai", content: response, time: now() }])
      setAiTyping(false)
    }, 1600)
  }

  const toggleSection = (i: number) =>
    setOpenSections((prev) =>
      prev.includes(i) ? prev.filter((s) => s !== i) : [...prev, i]
    )

  /* render AI message content (markdown-lite) */
  const renderMessage = (content: string) =>
    content.split("```").map((part, i) => {
      if (i % 2 === 1) {
        const lines = part.split("\n")
        const lang  = lines[0]
        const code  = lines.slice(1).join("\n")
        return (
          <div key={i} className="my-2 overflow-hidden rounded-lg border border-white/10 bg-[#0d0d1a]">
            <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
              <span className="font-mono text-[10px] text-white/30">{lang || "code"}</span>
              <Copy className="size-3 cursor-pointer text-white/30 hover:text-white/60" />
            </div>
            <pre className="overflow-x-auto px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-emerald-300">
              {code}
            </pre>
          </div>
        )
      }
      return (
        <span key={i} className="whitespace-pre-wrap">
          {part.split("**").map((chunk, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold">{chunk}</strong>
            ) : (
              <span key={j}>
                {chunk.split(/`([^`]+)`/).map((s, k) =>
                  k % 2 === 1 ? (
                    <code key={k} className="rounded bg-cyan-50 px-1 font-mono text-[10px] text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                      {s}
                    </code>
                  ) : s
                )}
              </span>
            )
          )}
        </span>
      )
    })

  const totalLessons = lessons.length
  const doneCount    = lessons.filter((l) => l.done).length
  const progressPct  = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0
  const lessonReady  = hasContent(currentLesson)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">

      {/* ── COURSE SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-300 xl:relative xl:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <Link href={`/courses/${slug}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3.5" />
            {t("backToCourse")}
          </Link>
          <div className="mx-0.5 h-4 w-px bg-border" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CourseIcon className="size-3.5 shrink-0 text-violet-500" />
              {courseTitle}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {t("lessonsOf", { done: doneCount, total: totalLessons })}
            </div>
          </div>
          <button className="p-1 text-muted-foreground hover:text-foreground xl:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="size-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="shrink-0 border-b border-border px-4 py-3">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted-foreground">{t("courseProgress")}</span>
            <span className="font-semibold text-violet-600 dark:text-violet-400">{progressPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="gradient-bg-primary h-full rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{t("doneCount", { count: doneCount })}</span>
            <span>{t("totalCount", { count: totalLessons })}</span>
          </div>
        </div>

        {/* Lesson outline */}
        <div className="flex-1 overflow-y-auto py-2">
          {modules.map((mod, si) => (
            <div key={si} className="mb-1">
              <button
                onClick={() => toggleSection(si)}
                className="group flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/60 transition-colors"
              >
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {mod.section}
                </span>
                <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${openSections.includes(si) ? "rotate-180" : ""}`} />
              </button>

              {openSections.includes(si) && (
                <div className="px-2 pb-1">
                  {mod.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLesson.id
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => switchLesson(lesson)}
                        disabled={lesson.locked}
                        className={`w-full flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all text-left ${
                          isActive
                            ? "border border-violet-200 bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/15"
                            : lesson.locked
                              ? "cursor-not-allowed opacity-40"
                              : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="shrink-0">
                          {lesson.done ? (
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                          ) : lesson.locked ? (
                            <Lock className="size-4 text-muted-foreground" />
                          ) : isActive ? (
                            <div className="flex size-4 items-center justify-center rounded-full border-2 border-violet-500 dark:border-violet-400">
                              <div className="size-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
                            </div>
                          ) : (
                            <Circle className="size-4 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`truncate text-xs font-medium ${
                            isActive ? "text-violet-700 dark:text-violet-300"
                            : lesson.done ? "text-muted-foreground"
                            : "text-foreground/70"
                          }`}>
                            {lesson.title}
                          </div>
                          <div className="truncate text-[10px] text-muted-foreground">{lesson.titleKh}</div>
                        </div>
                        <div className="shrink-0 text-[10px] text-muted-foreground">{lesson.duration}</div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* XP badge */}
        <div className="shrink-0 border-t border-border px-4 py-3">
          <Card className="flex-row items-center justify-between rounded-xl border-violet-200 p-3 dark:border-violet-500/20">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-violet-600 dark:text-violet-400" />
              <span className="text-xs font-medium text-foreground">{t("thisLesson")}</span>
            </div>
            <span className="gradient-text text-sm font-bold">+{currentLesson.xpReward} XP</span>
          </Card>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Lesson header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl">
          <button
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground xl:hidden transition-all"
            onClick={() => setSidebarOpen(true)}
          >
            <BookOpen className="size-4" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-violet-200 bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/20">
              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400">
                {currentLesson.id}
              </span>
            </div>
            <TypographyH4 className="truncate text-sm font-semibold text-foreground">
              {currentLesson.title}
            </TypographyH4>
            <span className="hidden text-xs text-muted-foreground sm:block">
              / {currentLesson.titleKh}
            </span>
          </div>

          {/* Tab switcher — only meaningful once the lesson has content */}
          {lessonReady && (
            <div className="flex items-center rounded-xl border border-border bg-muted p-0.5">
              {(["theory", "practice", "challenge"] as const).map((tab) => (
                <Button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  variant={activeTab === tab ? "default" : "ghost"}
                  size="sm"
                  className="h-auto rounded-lg px-3 py-1.5 capitalize"
                >
                  {tab === "theory"    && <BookOpen className="size-3" />}
                  {tab === "practice"  && <Code2 className="size-3" />}
                  {tab === "challenge" && <Trophy className="size-3" />}
                  {t(tab)}
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle size="sm" />
            {/* Prev / Next */}
            {prevLesson && (
              <Button
                onClick={() => switchLesson(prevLesson)}
                variant="secondary"
                size="sm"
                className="hidden h-auto rounded-xl px-2.5 py-1.5 sm:flex"
                title={prevLesson.title}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
            )}
            {nextLesson && (
              <Button
                onClick={() => switchLesson(nextLesson)}
                disabled={nextLesson.locked}
                variant="secondary"
                size="sm"
                className="hidden h-auto rounded-xl px-3 py-1.5 sm:flex"
              >
                {t("lesson")} <ChevronRight className="size-3.5" />
              </Button>
            )}
          </div>
        </header>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col">

            {/* ── NOT-YET-AUTHORED LESSON ── */}
            {!lessonReady && (
              <div className="flex flex-1 items-center justify-center bg-muted/10 p-6">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <Sparkles className="size-6 text-muted-foreground" />
                  </div>
                  <TypographyH3 className="mb-1.5 text-base font-bold text-foreground">
                    {t("notReadyTitle")}
                  </TypographyH3>
                  <TypographyMuted className="text-sm leading-relaxed">
                    {t("notReadyDesc")}
                  </TypographyMuted>
                  <div className="mt-5 flex items-center justify-center gap-2">
                    <Button asChild variant="secondary" size="sm" className="h-auto px-4 py-2">
                      <Link href={`/courses/${slug}`}>{t("backToCourse")}</Link>
                    </Button>
                    <Button asChild size="sm" className="h-auto px-4 py-2">
                      <Link href="/learn/python">{t("tryPython")}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── THEORY TAB ── */}
            {lessonReady && activeTab === "theory" && (
              <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
                <div className="mx-auto max-w-2xl">
                  <AnimateIn animation="blur-up" delay={0.05}>
                    <TypographyH2 className="mb-1 border-0 pb-0 text-2xl font-bold text-foreground">
                      {currentLesson.title}
                    </TypographyH2>
                    <TypographyMuted className="mb-8 text-sm text-violet-600 dark:text-violet-400">
                      {currentLesson.titleKh}
                    </TypographyMuted>
                  </AnimateIn>

                  {currentLesson.theory ? (
                    <TheoryRenderer blocks={currentLesson.theory} />
                  ) : currentLesson.task ? (
                    <AnimateIn animation="fade-up" delay={0.1}>
                      <Card className="rounded-2xl p-5">
                        <TypographyH4 className="mb-3 text-foreground flex items-center gap-2">
                          <Code2 className="size-4 text-violet-500" /> {t("task")}
                        </TypographyH4>
                        <TypographyP className="text-sm leading-relaxed text-muted-foreground">
                          {currentLesson.task}
                        </TypographyP>
                        <button
                          onClick={() => setActiveTab("practice")}
                          className="mt-4 flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
                        >
                          {t("openEditor")} <ChevronRight className="size-3" />
                        </button>
                      </Card>
                    </AnimateIn>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                      {t("noTheory")}
                    </div>
                  )}

                  {/* Next lesson shortcut */}
                  {nextLesson && !nextLesson.locked && (
                    <AnimateIn animation="fade-up" delay={0.4}>
                      <div className="mt-8">
                        <button
                          onClick={() => switchLesson(nextLesson)}
                          className="w-full flex items-center justify-between rounded-2xl card-surface border border-border p-4 hover:border-violet-300 dark:hover:border-violet-500/40 transition-all group"
                        >
                          <div className="text-left">
                            <div className="text-[10px] text-muted-foreground mb-0.5">{t("nextLesson")}</div>
                            <div className="text-sm font-semibold text-foreground">{nextLesson.title}</div>
                            <div className="text-xs text-muted-foreground">{nextLesson.titleKh}</div>
                          </div>
                          <ChevronRight className="size-5 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </div>
                    </AnimateIn>
                  )}
                </div>
              </div>
            )}

            {/* ── PRACTICE TAB ── */}
            {lessonReady && activeTab === "practice" && (
              <>
                {currentLesson.codeTemplate ? (
                  <>
                    {/* Dark editor */}
                    <div className="flex min-h-0 flex-1 flex-col bg-[#0d0d1a]">
                      {/* Toolbar */}
                      <div className="flex shrink-0 items-center gap-2 border-b border-white/5 bg-[#0a0a14] px-4 py-2.5">
                        <div className="flex gap-1.5">
                          <div className="size-3 rounded-full bg-red-500/50" />
                          <div className="size-3 rounded-full bg-yellow-500/50" />
                          <div className="size-3 rounded-full bg-emerald-500/50" />
                        </div>
                        <span className="ml-1 font-mono text-xs text-white/40">main.py</span>
                        <span className="rounded-full border border-violet-500/25 bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-300">
                          Python 3.11
                        </span>
                        {currentLesson.task && (
                          <span className="hidden sm:block text-xs text-white/30 ml-2 truncate max-w-xs">
                            {currentLesson.task}
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          <button onClick={resetCode} className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/60 transition-all" title={t("reset")}>
                            <RotateCcw className="size-3.5" />
                          </button>
                          <button className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/60 transition-all">
                            <Copy className="size-3.5" />
                          </button>
                          <button className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/60 transition-all">
                            <Maximize2 className="size-3.5" />
                          </button>
                          <Button
                            onClick={runCode}
                            disabled={running}
                            size="sm"
                            className="h-auto rounded-lg px-3 py-1.5"
                          >
                            {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5 fill-white" />}
                            {t("runCode")}
                          </Button>
                        </div>
                      </div>

                      {/* Code area */}
                      <div className="relative flex-1 overflow-hidden">
                        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 flex w-10 flex-col border-r border-white/5 bg-[#0a0a14] pt-3">
                          {code.split("\n").map((_, i) => (
                            <div key={i} className="pr-2.5 text-right font-mono text-[11px] leading-[1.6rem] text-white/20 select-none">
                              {i + 1}
                            </div>
                          ))}
                        </div>
                        <textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="absolute inset-0 h-full w-full resize-none bg-transparent py-3 pr-4 pl-12 font-mono text-xs leading-[1.6rem] text-white/85 outline-none"
                          spellCheck={false}
                        />
                      </div>
                    </div>

                    {/* Output console */}
                    {showOutput && (
                      <div className="flex h-44 shrink-0 flex-col border-t border-white/5 bg-[#08080f]">
                        <div className="flex shrink-0 items-center gap-2 border-b border-white/5 px-4 py-2">
                          <Terminal className="size-3.5 text-white/40" />
                          <span className="font-mono text-xs text-white/40">{t("output")}</span>
                          {running ? (
                            <div className="ml-2 flex items-center gap-1.5">
                              <Loader2 className="size-3 animate-spin text-emerald-400" />
                              <span className="text-[10px] text-emerald-400">{t("running")}</span>
                            </div>
                          ) : outputLines.length > 0 && (
                            <div className="ml-2 flex items-center gap-1.5">
                              <div className="size-1.5 rounded-full bg-emerald-400" />
                              <span className="text-[10px] text-emerald-400">{t("completed")}</span>
                            </div>
                          )}
                          <button className="ml-auto p-1 text-white/30 hover:text-white/60 transition-colors" onClick={() => setShowOutput(false)}>
                            <X className="size-3.5" />
                          </button>
                        </div>
                        <div className="flex-1 space-y-0.5 overflow-y-auto px-4 py-3 font-mono text-xs">
                          {outputLines.map((line, i) => (
                            <div key={i} className="leading-relaxed text-emerald-400">{line}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center bg-muted/10">
                    <div className="text-center">
                      <Code2 className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">{t("noPractice")}</p>
                      <button onClick={() => setActiveTab("theory")} className="mt-3 text-xs text-violet-600 dark:text-violet-400 hover:underline">
                        {t("readTheory")}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── CHALLENGE TAB ── */}
            {lessonReady && activeTab === "challenge" && (
              <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
                <div className="mx-auto max-w-2xl">
                  {currentLesson.challenge ? (
                    <>
                      <AnimateIn animation="bounce-in" delay={0.05}>
                        <Card className="mb-6 rounded-2xl border-amber-200 bg-amber-50/40 p-6 dark:border-amber-500/25 dark:bg-amber-500/5">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/20">
                              <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <TypographyH3 className="text-base font-bold text-foreground">
                                {currentLesson.challenge.title}
                              </TypographyH3>
                              <div className="mt-0.5 flex items-center gap-2">
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                  {currentLesson.challenge.difficulty}
                                </Badge>
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                  +{currentLesson.challenge.xp} XP
                                </span>
                              </div>
                            </div>
                          </div>
                          <TypographyP className="mb-4 text-sm leading-relaxed text-muted-foreground">
                            {currentLesson.challenge.description}
                          </TypographyP>

                          {/* Expected output preview */}
                          <div className="rounded-xl border border-white/10 bg-[#0d0d1a] p-4 font-mono text-xs">
                            <div className="mb-2 text-white/30">{t("expectedOutput")}</div>
                            {currentLesson.challenge.expectedOutput.map((line) => (
                              <div key={line} className="text-emerald-400/70">{line}</div>
                            ))}
                          </div>
                        </Card>
                      </AnimateIn>

                      {/* Requirements checklist */}
                      <div className="mb-6 space-y-3">
                        {currentLesson.challenge.requirements.map((req, i) => (
                          <AnimateIn key={req} animation="fade-right" delay={0.15 + i * 0.07}>
                            <Card className="flex-row items-center gap-3 rounded-xl px-4 py-3">
                              <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                              <span className="text-sm text-muted-foreground">{req}</span>
                            </Card>
                          </AnimateIn>
                        ))}
                      </div>

                      <AnimateIn animation="fade-up" delay={0.45}>
                        <Button
                          onClick={() => setActiveTab("practice")}
                          className="w-full py-3"
                        >
                          {t("startChallenge")}
                        </Button>
                      </AnimateIn>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center justify-center h-48">
                      <div className="text-center">
                        <Lightbulb className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">{t("noChallenge")}</p>
                        <button onClick={() => setActiveTab("theory")} className="mt-3 text-xs text-violet-600 dark:text-violet-400 hover:underline">
                          {t("readTheory")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── AI PANEL ── */}
          <div className="hidden w-80 shrink-0 flex-col border-l border-border bg-card lg:flex">
            {/* AI header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3.5">
              <div className="relative shrink-0">
                <div className="gradient-bg-primary flex size-8 items-center justify-center rounded-xl">
                  <Brain className="size-4 text-white" />
                </div>
                <div className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">Apsara Elearning AI</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">{t("online")} · Khmer + English</div>
              </div>
              <Sparkles className="size-3.5 text-violet-500 dark:text-violet-400" />
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "ai" && (
                    <div className="gradient-bg-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg">
                      <Brain className="size-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] ${msg.role === "user" ? "ml-auto" : ""}`}>
                    <div className={`rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
                      msg.role === "ai"
                        ? "rounded-tl-none border border-border bg-muted text-foreground"
                        : "gradient-bg-primary rounded-tr-none text-white"
                    }`}>
                      {renderMessage(msg.content)}
                    </div>
                    <div className={`mt-1 flex items-center gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                      <span className="text-[10px] text-muted-foreground/60">{msg.time}</span>
                      {msg.role === "ai" && (
                        <div className="flex items-center gap-1">
                          <button className="p-0.5 text-muted-foreground/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"><ThumbsUp className="size-2.5" /></button>
                          <button className="p-0.5 text-muted-foreground/40 hover:text-red-500 dark:hover:text-red-400 transition-colors"><ThumbsDown className="size-2.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {aiTyping && (
                <div className="flex gap-2.5">
                  <div className="gradient-bg-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg">
                    <Brain className="size-3 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none border border-border bg-muted px-3 py-3">
                    <div className="flex h-4 items-center gap-1">
                      {[0, 150, 300].map((delay) => (
                        <div key={delay} className="size-1.5 animate-bounce rounded-full bg-violet-500 dark:bg-violet-400" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {currentLesson.aiSuggestions && (
              <div className="shrink-0 px-3 pb-2">
                <div className="mb-2 text-[10px] text-muted-foreground">{t("quickQuestions")}</div>
                <div className="flex flex-wrap gap-1.5">
                  {currentLesson.aiSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="rounded-lg border border-border bg-muted/60 px-2 py-1 text-left text-[10px] leading-tight text-muted-foreground hover:border-violet-300 hover:bg-violet-50 hover:text-foreground dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 border-t border-border p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1 rounded-xl border border-border bg-muted px-3 py-2.5 focus-within:border-violet-400 dark:focus-within:border-violet-500/50 transition-all">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage(input)
                      }
                    }}
                    placeholder={t("askAI")}
                    className="w-full resize-none bg-transparent text-xs leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || aiTyping}
                  size="icon"
                  className="size-9 shrink-0 rounded-xl"
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
              <div className="mt-1.5 text-center text-[9px] text-muted-foreground">
                {t("inputHint")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
