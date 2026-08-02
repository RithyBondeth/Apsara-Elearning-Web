"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Sparkles, ArrowRight, Play, Brain, Star, ChevronRight, GraduationCap,
  Flame, Trophy, BadgeCheck, ChevronDown, Calculator, Atom, FlaskConical,
  Languages, BookOpen, Check, Braces, Dna, Scale, Code2, Leaf, Microscope,
  Globe2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import gsap from "gsap"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { MokotMark } from "@/components/utils/brand-logo"
import { AuroraBackground } from "@/components/utils/animations/aurora-background"
import { TextReveal } from "@/components/utils/animations/text-reveal"
import { Magnetic } from "@/components/utils/animations/magnetic"
import { TiltCard } from "@/components/utils/animations/tilt-card"
import { TypographyH1 } from "@/components/utils/typography/typography-h1"
import { TypographyLead } from "@/components/utils/typography/typography-lead"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"

interface Glyph {
  /** Text symbol — preferred where the subject has a readable notation. */
  char?: string
  /** Icon, for subjects with no good Unicode (biology, law, coding). */
  icon?: React.ElementType
  /** Position + colour. */
  className: string
  /** Text size for `char`, box size for `icon`. */
  size: string
  /** Mouse-parallax strength; vary it so the field doesn't move as one sheet. */
  depth: number
}

/**
 * Floating subject symbols scattered around the hero, moved by mouse parallax.
 * These are the page's educational motif, so they're pitched to be read rather
 * than to sit at the edge of visibility, and they span the curriculum: maths,
 * coding, physics, chemistry, biology, law, languages, geography.
 *
 * Layout rule: the centered headline and lead sit in a max-w-4xl column, which
 * is roughly 19–81% of the viewport at desktop widths. Every glyph therefore
 * stays outside an 18–82% band, except the few pinned above the headline or
 * below the CTA where the column is empty anyway.
 *
 * Note: `violet-*` is remapped to neutral gray in globals.css, so accents here
 * use amber/rose/indigo rather than violet.
 */
const GLYPHS: Glyph[] = [
  /* ── Maths ── */
  { char: "π",     className: "top-[18%] left-[8%]   text-blue-500/60    dark:text-blue-400/50",    size: "text-4xl", depth: 30 },
  { char: "∑",     className: "top-[30%] right-[10%] text-amber-500/60   dark:text-amber-400/45",   size: "text-4xl", depth: 50 },
  { char: "√x",    className: "top-[55%] left-[5%]   text-cyan-500/55    dark:text-cyan-400/45",    size: "text-3xl", depth: 40 },
  { char: "∫",     className: "top-[74%] left-[14%]  text-blue-500/45    dark:text-blue-400/35",    size: "text-3xl", depth: 45 },
  { char: "Δ",     className: "top-[42%] left-[15%]  text-rose-500/45    dark:text-rose-400/35",    size: "text-2xl", depth: 35 },
  { char: "∞",     className: "top-[88%] right-[19%] text-cyan-500/40    dark:text-cyan-400/30",    size: "text-3xl", depth: 28 },

  /* ── Coding ── */
  { icon: Braces,  className: "top-[31%] left-[9%]   text-indigo-500/50  dark:text-indigo-400/40",  size: "size-8",   depth: 52 },
  { icon: Code2,   className: "top-[22%] right-[16%] text-indigo-500/45  dark:text-indigo-400/35",  size: "size-7",   depth: 55 },

  /* ── Physics ── */
  { icon: Atom,    className: "top-[44%] right-[5%]  text-sky-500/50     dark:text-sky-400/40",     size: "size-9",   depth: 42 },
  { char: "E=mc²", className: "top-[90%] left-[6%]   text-blue-500/40    dark:text-blue-400/32",    size: "text-xl",  depth: 30 },
  { char: "Ω",     className: "top-[64%] left-[11%]  text-amber-500/45   dark:text-amber-400/35",   size: "text-2xl", depth: 26 },

  /* ── Chemistry ── */
  { char: "H₂O",   className: "top-[10%] right-[17%] text-emerald-500/50 dark:text-emerald-400/40", size: "text-2xl", depth: 25 },
  { icon: FlaskConical, className: "top-[78%] right-[13%] text-teal-500/45 dark:text-teal-400/35",  size: "size-8",   depth: 36 },

  /* ── Biology ── */
  { icon: Dna,     className: "top-[86%] left-[4%]   text-emerald-500/45 dark:text-emerald-400/35", size: "size-8",   depth: 38 },
  { icon: Leaf,    className: "top-[70%] right-[4%]  text-green-500/45   dark:text-green-400/35",   size: "size-7",   depth: 27 },
  { icon: Microscope, className: "top-[8%] left-[16%] text-teal-500/40   dark:text-teal-400/32",    size: "size-7",   depth: 33 },

  /* ── Law ── */
  { icon: Scale,   className: "top-[9%]  left-[4%]   text-stone-500/45   dark:text-stone-400/35",   size: "size-7",   depth: 22 },
  { char: "§",     className: "top-[52%] right-[12%] text-stone-500/40   dark:text-stone-400/32",   size: "text-2xl", depth: 34 },

  /* ── Languages & geography ── */
  { char: "ក",     className: "top-[62%] right-[7%]  text-amber-500/50   dark:text-amber-400/40",   size: "text-3xl", depth: 60 },
  { icon: Globe2,  className: "top-[36%] left-[3%]   text-sky-500/40     dark:text-sky-400/32",     size: "size-7",   depth: 24 },
]

/**
 * Subjects shown in the demo sidebar. `correct`/`decoy` index into the
 * translated options; the animated "student" hovers the decoy first,
 * then picks the correct answer.
 */
const SUBJECTS = [
  { key: "math", icon: Calculator, correct: 0, decoy: 1, url: "apsaraelearning.com/learn/math-grade-12" },
  { key: "physics", icon: Atom, correct: 1, decoy: 3, url: "apsaraelearning.com/learn/physics-grade-12" },
  { key: "chemistry", icon: FlaskConical, correct: 2, decoy: 1, url: "apsaraelearning.com/learn/chemistry-grade-12" },
  { key: "english", icon: Languages, correct: 0, decoy: 2, url: "apsaraelearning.com/learn/english-grade-12" },
] as const

type Subject = (typeof SUBJECTS)[number]

/**
 * Animated quiz demo: the "student" considers two options, picks the
 * correct one, earns XP, then the loop restarts.
 * Phases: 0 idle · 1 hover decoy · 2 hover correct · 3 answered (+10 XP)
 */
function QuizDemo({ active, subject }: { active: boolean; subject: Subject }) {
  const t = useTranslations("hero.demo")
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!active) return
    const DELAYS = [1400, 1000, 900, 3200]
    const timer = setTimeout(() => setPhase((p) => (p + 1) % 4), DELAYS[phase])
    return () => clearTimeout(timer)
  }, [active, phase])

  const options = t.raw(`subjects.${subject.key}.options`) as string[]
  const answered = phase === 3
  const hovered = phase === 1 ? subject.decoy : phase === 2 ? subject.correct : -1

  return (
    <div className="flex h-full flex-col p-4 text-left">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          {t(`subjects.${subject.key}.lesson`)}
        </span>
        <span
          className={`flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600 transition-all duration-300 dark:bg-emerald-500/20 dark:text-emerald-400 ${
            answered ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          <Sparkles className="size-2.5" /> +10 XP
        </span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-foreground">
        {t.rich(`subjects.${subject.key}.question`, {
          b: (chunks) => <span className="font-semibold">{chunks}</span>,
        })}
      </p>
      <div className="space-y-1.5">
        {options.map((opt, i) => {
          const isCorrect = answered && i === subject.correct
          const isHovered = hovered === i
          return (
            <div
              key={opt}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all duration-300 ${
                isCorrect
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : isHovered
                    ? "border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10"
                    : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              <span
                className={`flex size-4 items-center justify-center rounded-full border text-[9px] font-bold ${
                  isCorrect
                    ? "border-emerald-400 bg-emerald-400 text-white"
                    : "border-border"
                }`}
              >
                {isCorrect ? <Check className="size-2.5" /> : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </div>
          )
        })}
      </div>
      <div
        className={`mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground transition-opacity duration-500 ${
          answered ? "opacity-100" : "opacity-0"
        }`}
      >
        {t(`subjects.${subject.key}.explanation`)}
      </div>
    </div>
  )
}

export function LandingHero() {
  const t = useTranslations("hero")
  const [quizActive, setQuizActive] = useState(true)
  const [subjectIndex, setSubjectIndex] = useState(0)
  const subject = SUBJECTS[subjectIndex]
  const quizRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const glyphsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = quizRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setQuizActive(entry.isIntersecting)
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* Mouse parallax — glyph layers drift opposite the cursor by depth */
  useEffect(() => {
    const section = sectionRef.current
    const layer = glyphsRef.current
    if (!section || !layer) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(hover: none)").matches) return

    const movers = Array.from(layer.children).map((child) => ({
      depth: Number((child as HTMLElement).dataset.depth ?? 30),
      xTo: gsap.quickTo(child, "x", { duration: 1.2, ease: "power3.out" }),
      yTo: gsap.quickTo(child, "y", { duration: 1.2, ease: "power3.out" }),
    }))

    const onMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const nx = e.clientX / innerWidth - 0.5
      const ny = e.clientY / innerHeight - 0.5
      movers.forEach(({ depth, xTo, yTo }) => {
        xTo(-nx * depth)
        yTo(-ny * depth)
      })
    }
    section.addEventListener("mousemove", onMove)
    return () => section.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center px-6 pt-36 pb-24 text-center min-h-screen overflow-hidden"
    >
      {/* Grid off: the page-level <PaperGrid /> already covers this section, and
          stacking the two would double the ruling. */}
      <AuroraBackground grid={false} />

      {/* Floating subject symbols */}
      <div ref={glyphsRef} aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {GLYPHS.map((g, i) => {
          const Icon = g.icon
          return (
            <span
              key={i}
              data-depth={g.depth}
              className={`absolute font-bold select-none animate-bob ${g.className} ${Icon ? "" : g.size}`}
              style={{ animationDelay: `${(i % 7) * 0.7}s` }}
            >
              {Icon ? <Icon className={g.size} strokeWidth={2.25} /> : g.char}
            </span>
          )
        })}
      </div>

      <AnimateIn animation="fade-down" delay={0.05} className="relative mb-8">
        <div className="btn-shine inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-violet-300/40 dark:border-violet-500/30 text-xs font-medium text-violet-700 dark:text-violet-300 shadow-sm">
          <Sparkles className="size-3.5 text-violet-500 dark:text-violet-400 animate-spin-slow" />
          {t("badge")}
          <ChevronRight className="size-3.5 opacity-60" />
        </div>
      </AnimateIn>

      <TypographyH1 className="relative text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-6">
        <span className="block mb-1">
          <TextReveal text={t("titleKh")} wordClassName="gradient-text-animated" delay={0.15} />
        </span>
        <span className="block text-foreground">
          <TextReveal text={t("titleWith")} delay={0.35} />{" "}
          <span className="relative inline-block">
            <TextReveal text="AI Mentor" wordClassName="gradient-text" delay={0.45} stagger={0.12} />
            <span className="absolute -top-3 -right-8 text-2xl select-none">
              <Sparkles className="size-6 text-blue-400 animate-breathe" />
            </span>
          </span>
        </span>
      </TypographyH1>

      <AnimateIn animation="blur-up" delay={0.65} className="relative">
        <TypographyLead className="max-w-xl mb-10 leading-relaxed">
          {t.rich("subtitle", {
            mentor: (chunks) => (
              <span className="text-violet-600 dark:text-violet-400 font-medium">{chunks}</span>
            ),
          })}
        </TypographyLead>
      </AnimateIn>

      <AnimateIn animation="fade-up" delay={0.8} className="relative">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Magnetic>
            <Link href="/dashboard">
              <button className="btn-shine group flex items-center gap-2.5 px-8 py-4 text-base font-semibold rounded-2xl gradient-bg-primary transition-all text-white shadow-xl hover:shadow-[0_0_40px_-8px_rgba(35,131,226,0.7)]">
                <GraduationCap className="size-5" />
                {t("startLearning")}
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </Magnetic>
          <Magnetic strength={0.25}>
            <Link href="/learn">
              <button className="group flex items-center gap-2.5 px-8 py-4 text-base font-medium rounded-2xl glass border border-border hover:border-violet-300 dark:hover:border-violet-500/30 transition-all text-foreground/80 hover:text-foreground">
                <span className="relative flex items-center justify-center">
                  <span className="absolute size-6 rounded-full bg-violet-400/20 animate-ping group-hover:bg-violet-400/30" />
                  <Play className="size-4 fill-current opacity-60 relative" />
                </span>
                {t("watchDemo")}
              </button>
            </Link>
          </Magnetic>
        </div>
      </AnimateIn>

      <AnimateIn animation="fade" delay={1} className="relative">
        <div className="flex items-center gap-3 mb-20">
          <div className="flex -space-x-2">
            {["SP","DC","BM","RK","VL"].map((initials, i) => (
              <div
                key={i}
                className="size-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white transition-transform duration-300 hover:-translate-y-1 hover:z-10"
                style={{ background: `hsl(${260 + i * 22}, 60%, 55%)` }}
              >
                {initials}
              </div>
            ))}
          </div>
          <TypographyMuted className="text-sm">
            {t("studentsCount")}
          </TypographyMuted>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />)}
          </div>
        </div>
      </AnimateIn>

      {/* App mockup with 3-D tilt + floating gamification cards */}
      <AnimateIn animation="flip-up" delay={0.3} className="relative w-full max-w-5xl">
        <div className="relative">
          {/* Floating cards around the mockup */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
            <div
              className="animate-bob absolute -left-16 top-10 glass rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2.5"
              style={{ "--bob-rotate": "-4deg" } as React.CSSProperties}
            >
              <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <Flame className="size-4 text-amber-500" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">{t("demo.streakTitle")}</div>
                <div className="text-[10px] text-muted-foreground">{t("demo.streakSub")}</div>
              </div>
            </div>
            <div
              className="animate-bob absolute -right-14 top-28 glass rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2.5"
              style={{ "--bob-rotate": "3deg", animationDelay: "1.2s" } as React.CSSProperties}
            >
              <div className="size-8 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                <Trophy className="size-4 text-violet-500" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">{t("demo.trophyTitle")}</div>
                <div className="text-[10px] text-muted-foreground">{t("demo.trophySub")}</div>
              </div>
            </div>
            <div
              className="animate-bob absolute -left-10 bottom-16 glass rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2.5"
              style={{ "--bob-rotate": "2deg", animationDelay: "2s" } as React.CSSProperties}
            >
              <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <BadgeCheck className="size-4 text-emerald-500" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">{t("demo.certTitle")}</div>
                <div className="text-[10px] text-muted-foreground">{t("demo.certSub")}</div>
              </div>
            </div>
          </div>

          <div className="absolute -inset-3 rounded-3xl gradient-bg-primary opacity-10 dark:opacity-20 blur-2xl animate-pulse-glow" />
          <TiltCard maxTilt={5}>
            <div className="relative card-surface rounded-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-400/70" />
                  <div className="size-3 rounded-full bg-yellow-400/70" />
                  <div className="size-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="mx-auto max-w-xs h-5 rounded-md bg-muted flex items-center px-3 text-[10px] text-muted-foreground">
                    {subject.url}
                  </div>
                </div>
              </div>
              <div className="flex h-80 md:h-96 bg-card">
                {/* Sidebar */}
                <div className="w-52 border-r border-border bg-muted/20 p-3 hidden sm:block">
                  <div className="flex items-center gap-2 mb-1 px-2">
                    <MokotMark className="size-4" />
                    <span className="text-xs font-semibold text-foreground">Apsara Elearning</span>
                  </div>
                  <div className="mb-3 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {t("demo.grade")}
                  </div>
                  {SUBJECTS.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSubjectIndex(i)}
                      className={`flex w-full cursor-pointer items-center gap-2 px-2.5 py-2 rounded-xl mb-1 text-xs text-left transition-colors ${
                        i === subjectIndex
                          ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-medium"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <s.icon className={`size-3.5 ${i === subjectIndex ? "text-violet-500 dark:text-violet-400" : "opacity-60"}`} />
                      {t(`demo.subjects.${s.key}.name`)}
                    </button>
                  ))}
                  <div className="mt-4 pt-4 border-t border-border px-2">
                    <div className="flex justify-between text-[10px] mb-1.5">
                      <span className="text-muted-foreground">{t("demo.level")}</span>
                      <span className="text-violet-600 dark:text-violet-400 font-semibold">{t("demo.xp")}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-3/5 rounded-full gradient-bg-primary shimmer" />
                    </div>
                  </div>
                </div>
                {/* Lesson / quiz panel */}
                <div ref={quizRef} className="flex-1 flex flex-col bg-background/60">
                  <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
                    <BookOpen className="size-3.5 text-violet-500 dark:text-violet-400" />
                    <span className="text-xs font-medium text-foreground">{t(`demo.subjects.${subject.key}.breadcrumb`)}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-500 dark:text-emerald-400">{t("demo.practiceMode")}</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <QuizDemo key={subject.key} active={quizActive} subject={subject} />
                  </div>
                </div>
                {/* AI Tutor panel */}
                <div className="w-56 border-l border-border bg-muted/20 p-3 hidden lg:flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-6 rounded-lg gradient-bg-primary flex items-center justify-center shrink-0">
                      <Brain className="size-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{t("demo.aiTutor")}</span>
                    <div className="ml-auto size-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="bg-violet-100 dark:bg-violet-500/20 rounded-xl rounded-tr-none ml-4 p-2.5 text-[10px] text-violet-700 dark:text-violet-200 leading-relaxed">
                      {t(`demo.subjects.${subject.key}.tutorQ`)}
                    </div>
                    <div className="bg-muted dark:bg-white/5 rounded-xl rounded-tl-none p-2.5 text-[10px] text-muted-foreground leading-relaxed border border-border">
                      {t.rich(`demo.subjects.${subject.key}.tutorA`, {
                        m: (chunks) => <span className="text-cyan-600 dark:text-cyan-400">{chunks}</span>,
                      })}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <div className="flex-1 h-7 rounded-lg bg-muted border border-border" />
                    <div className="size-7 rounded-lg gradient-bg-primary flex items-center justify-center">
                      <ArrowRight className="size-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </AnimateIn>

      {/* Scroll indicator */}
      <div aria-hidden className="relative mt-14 flex flex-col items-center gap-1 text-muted-foreground">
        <div className="h-9 w-5 rounded-full border border-border flex justify-center pt-1.5">
          <div className="size-1 rounded-full bg-muted-foreground animate-scroll-hint" />
        </div>
        <ChevronDown className="size-3.5 opacity-50" />
      </div>
    </section>
  )
}
