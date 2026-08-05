"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Award,
  BookOpen,
  CreditCard,
  Library,
  Loader2,
  Users,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  listBadges,
  listCourses,
  listPlans,
  listSubjects,
  listUsers,
} from "@/lib/api/admin"

/**
 * Landing screen for the console.
 *
 * Counts come from the list endpoints the other screens already use, rather
 * than a stats endpoint — the admin gateway has none, and adding one for five
 * numbers would be premature. Each tile fails independently so one broken
 * service doesn't blank the page.
 */
const TILES = [
  {
    key: "courses",
    label: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
    load: listCourses,
  },
  {
    key: "users",
    label: "Users",
    href: "/admin/users",
    icon: Users,
    load: listUsers,
  },
  {
    key: "subjects",
    label: "Subjects",
    href: "/admin/taxonomy",
    icon: Library,
    load: listSubjects,
  },
  {
    key: "badges",
    label: "Badges",
    href: "/admin/badges",
    icon: Award,
    load: listBadges,
  },
  {
    key: "plans",
    label: "Plans",
    href: "/admin/plans",
    icon: CreditCard,
    load: listPlans,
  },
] as const

export default function AdminOverviewPage() {
  const [counts, setCounts] = useState<Record<string, number | null>>({})

  useEffect(() => {
    let cancelled = false

    TILES.forEach((tile) => {
      tile
        .load()
        .then((rows) => {
          if (!cancelled)
            setCounts((c) => ({ ...c, [tile.key]: rows.length }))
        })
        .catch(() => {
          if (!cancelled) setCounts((c) => ({ ...c, [tile.key]: -1 }))
        })
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Content and accounts across the platform.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => {
          const count = counts[tile.key]
          return (
            <Link key={tile.key} href={tile.href}>
              <Card className="p-5 transition-colors hover:border-violet-300 dark:hover:border-violet-500/40">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    <tile.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl font-semibold text-foreground">
                      {count === undefined ? (
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                      ) : count === -1 ? (
                        <span className="text-base text-muted-foreground">
                          unavailable
                        </span>
                      ) : (
                        count
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tile.label}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-medium text-foreground">
          Building a course
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Set up the placement first under{" "}
            <Link href="/admin/taxonomy" className="underline">
              Taxonomy
            </Link>{" "}
            — a K–12 course needs a subject and a grade, a university one needs a
            faculty and major.
          </li>
          <li>
            Create the course under{" "}
            <Link href="/admin/courses" className="underline">
              Courses
            </Link>
            , then open it to add modules and lessons.
          </li>
          <li>
            Attach quizzes or coding challenges from a lesson&apos;s assessments
            screen.
          </li>
          <li>
            Publish the course when it is ready — until then it is hidden from
            the catalog and returns 404 to students.
          </li>
        </ol>
      </Card>
    </div>
  )
}
