"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Search, Loader2, BookOpen } from "lucide-react"
import { searchCourses } from "@/lib/api/catalog"
import type { IApiCourse } from "@/utils/interfaces/catalog/api.interface"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Course search: a header trigger styled like the old placeholder, opening a
 * ⌘K command dialog that keyword-searches published courses (debounced) and
 * links straight to each course's detail page.
 */
export function CourseSearch({ label }: { label: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<IApiCourse[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ⌘K / Ctrl+K toggles the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  function handleQueryChange(value: string) {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)

    const q = value.trim()
    if (!q) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    timerRef.current = setTimeout(() => {
      searchCourses(q)
        .then((res) => setResults(res))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 250)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setQuery("")
      setResults([])
      setLoading(false)
    }
  }

  const showEmpty = query.trim() !== "" && !loading && results.length === 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 max-w-sm text-left"
        aria-label={label}
      >
        <div className="flex w-full items-center gap-2 px-3 py-2 rounded-xl bg-muted/60 border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Search className="size-4 shrink-0" />
          <span>{label}</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-background border border-border text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={label}
              className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            {loading && (
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {showEmpty && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No courses found.
              </p>
            )}
            {results.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                onClick={() => handleOpenChange(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors"
              >
                <div className="size-9 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                  <BookOpen className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{course.title}</p>
                  {course.titleKm && (
                    <p className="truncate text-xs text-muted-foreground">
                      {course.titleKm}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
