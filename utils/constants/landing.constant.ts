import {
  Brain, Globe, BookOpen, Trophy, School, GraduationCap, PencilLine,
} from "lucide-react"

/* ── Color map ───────────────────────────────────────────────────────── */

export const COLOR = {
  violet: {
    bg:     "bg-violet-50 dark:bg-violet-500/15",
    icon:   "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-500/20",
    badge:  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  },
  cyan: {
    bg:     "bg-cyan-50 dark:bg-cyan-500/15",
    icon:   "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-500/20",
    badge:  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  },
  emerald: {
    bg:     "bg-emerald-50 dark:bg-emerald-500/15",
    icon:   "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/20",
    badge:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  amber: {
    bg:     "bg-amber-50 dark:bg-amber-500/15",
    icon:   "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/20",
    badge:  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
  indigo: {
    bg:     "bg-indigo-50 dark:bg-indigo-500/15",
    icon:   "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-500/20",
    badge:  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  },
} as const

export type TColorKey = keyof typeof COLOR

/* ── Features ────────────────────────────────────────────────────────── */

export const FEATURES = [
  { icon: Brain,         color: "violet"  as TColorKey, key: "aiMentor"   },
  { icon: School,        color: "cyan"    as TColorKey, key: "k12"        },
  { icon: GraduationCap, color: "amber"   as TColorKey, key: "university" },
  { icon: Globe,         color: "emerald" as TColorKey, key: "khmerFirst" },
]

/* ── Courses ─────────────────────────────────────────────────────────── */

/** `category` mirrors `programming_categories.slug` in the API. */
export const COURSES = [
  { level: "Beginner",     lessons: 24, xp: 2400, color: "violet" as TColorKey, icon: "Terminal", key: "python",     category: "programming-fundamentals" },
  { level: "Intermediate", lessons: 32, xp: 3200, color: "cyan"   as TColorKey, icon: "Code2",    key: "react",      category: "web-development"          },
  { level: "Advanced",     lessons: 40, xp: 4000, color: "amber"  as TColorKey, icon: "Brain",    key: "algorithms", category: "computer-science"         },
]

/* ── Featured subjects (landing showcase) ────────────────────────────── */

export const FEATURED_SUBJECTS = [
  {
    key: "math",
    icon: "Calculator",
    color: "violet" as TColorKey,
    level: "Grade 12",
    levelBadge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    lessons: 48,
    xp: 4800,
  },
  {
    key: "physics",
    icon: "Atom",
    color: "cyan" as TColorKey,
    level: "Grade 11",
    levelBadge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400",
    lessons: 36,
    xp: 3600,
  },
  {
    key: "english",
    icon: "Languages",
    color: "amber" as TColorKey,
    level: "All Levels",
    levelBadge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    lessons: 40,
    xp: 4000,
  },
]

/* ── Stats ───────────────────────────────────────────────────────────── */

export const STATS = [
  { count: 12000, prefix: "",  suffix: "+", locale: true,  key: "students"  },
  { count: 60,    prefix: "",  suffix: "+", locale: false, key: "courses"   },
  { count: 94,    prefix: "",  suffix: "%", locale: false, key: "completion"},
  { count: 1,     prefix: "#", suffix: "",  locale: false, key: "inCambodia"},
]

/* ── Testimonials ────────────────────────────────────────────────────── */

export const TESTIMONIALS = [
  { avatar: "SP", stars: 5, key: "sokha" },
  { avatar: "DC", stars: 5, key: "dara"  },
  { avatar: "BM", stars: 5, key: "bopha" },
]

/* ── How it works steps ──────────────────────────────────────────────── */

export const HOW_IT_WORKS = [
  { step: "01", icon: BookOpen,   color: "violet" as TColorKey, key: "choosePath"    },
  { step: "02", icon: PencilLine, color: "cyan"   as TColorKey, key: "learnPractice" },
  { step: "03", icon: Trophy,     color: "amber"  as TColorKey, key: "earnGrow"      },
]

/* ── Nav links ──────────────────────────────────────────────────────────── */

export const NAV_LINKS = [
  { key: "courses",      href: "/#courses"      },
  { key: "features",     href: "/#features"     },
  { key: "howItWorks",   href: "/#how-it-works" },
  { key: "testimonials", href: "/#testimonials"  },
  { key: "pricing",      href: "/#pricing"      },
] as const

export const NAV_LINK_KEYS = NAV_LINKS.map((l) => l.key)
