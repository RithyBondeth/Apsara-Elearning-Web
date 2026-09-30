"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Megaphone, Send, Users } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import {
  listAnnouncements,
  listCourses,
  previewAnnouncement,
  sendAnnouncement,
} from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import type {
  IAdminAnnouncement,
  IAdminAnnouncementAudience,
  IAdminCourse,
} from "@/utils/interfaces/admin/api.interface"

/** Mirror ANNOUNCEMENT_TITLE_MAX / ANNOUNCEMENT_BODY_MAX in the API. */
const TITLE_MAX = 120
const BODY_MAX = 1000
/** Wait for the audience to settle before counting it. */
const PREVIEW_DELAY_MS = 300

const CONTROL =
  "w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

function audienceLabel(a: IAdminAnnouncement) {
  const who =
    a.audience === "course"
      ? `Enrolled in ${a.courseTitle ?? "a deleted course"}`
      : "All learners"
  return a.subscribersOnly ? `${who} · subscribers only` : who
}

export default function AnnouncementsPage() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [audience, setAudience] = useState<"all" | "course">("all")
  const [courseId, setCourseId] = useState<string>("")
  const [subscribersOnly, setSubscribersOnly] = useState(false)

  const [courses, setCourses] = useState<IAdminCourse[]>([])
  const [history, setHistory] = useState<IAdminAnnouncement[] | null>(null)
  /* Keyed by the audience it counted, so a count never outlives its audience:
     after a change the old number isn't shown (or sendable) while the new one
     loads. */
  const [counted, setCounted] = useState<{ key: string; n: number } | null>(
    null
  )
  const [sending, setSending] = useState(false)

  useEffect(() => {
    listCourses().then(setCourses, () => setCourses([]))
    listAnnouncements().then(setHistory, () => {
      toast.error("Could not load past announcements")
      setHistory([])
    })
  }, [])

  const target = useMemo<IAdminAnnouncementAudience | null>(() => {
    if (audience === "course" && !courseId) return null
    return {
      audience,
      ...(audience === "course" ? { courseId } : {}),
      subscribersOnly,
    }
  }, [audience, courseId, subscribersOnly])

  /* Count the audience whenever it changes, so the admin sees the reach
     before sending — never after. */
  const targetKey = target ? JSON.stringify(target) : null

  useEffect(() => {
    if (!target || !targetKey) return
    let cancelled = false
    const timer = setTimeout(() => {
      previewAnnouncement(target).then(
        (res) =>
          !cancelled && setCounted({ key: targetKey, n: res.recipients }),
        () => !cancelled && setCounted(null)
      )
    }, PREVIEW_DELAY_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [target, targetKey])

  const reach = counted && counted.key === targetKey ? counted.n : null
  const ready =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    target !== null &&
    (reach ?? 0) > 0 &&
    !sending

  async function send() {
    if (!target) return
    setSending(true)
    try {
      const sent = await sendAnnouncement({ ...target, title, body })
      toast.success(`Sent to ${sent.recipientCount} learner(s)`)
      setHistory((list) => [sent, ...(list ?? [])])
      setTitle("")
      setBody("")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not send")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Announcements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Send a message to learners’ notification bells — a new course,
          maintenance, a policy change. Admins, suspended accounts, accounts
          pending deletion and unverified emails never receive one. Sent
          announcements can’t be recalled.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border p-5">
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="announcement-title"
              className="text-sm font-medium text-foreground"
            >
              Title
            </label>
            <span className="text-xs text-muted-foreground">
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          <Input
            id="announcement-title"
            value={title}
            maxLength={TITLE_MAX}
            placeholder="New course: Grade 12 Physics"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="announcement-body"
              className="text-sm font-medium text-foreground"
            >
              Message
            </label>
            <span className="text-xs text-muted-foreground">
              {body.length}/{BODY_MAX}
            </span>
          </div>
          <textarea
            id="announcement-body"
            rows={4}
            value={body}
            maxLength={BODY_MAX}
            placeholder="Lessons 1–5 are live now. Start from your dashboard."
            onChange={(e) => setBody(e.target.value)}
            className={CONTROL}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="announcement-audience"
              className="text-sm font-medium text-foreground"
            >
              Audience
            </label>
            <Select
              value={audience}
              onValueChange={(v) => setAudience(v as "all" | "course")}
            >
              <SelectTrigger id="announcement-audience" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All learners</SelectItem>
                <SelectItem value="course">
                  Learners enrolled in a course
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {audience === "course" && (
            <div className="space-y-1.5">
              <label
                htmlFor="announcement-course"
                className="text-sm font-medium text-foreground"
              >
                Course
              </label>
              <Select value={courseId || undefined} onValueChange={setCourseId}>
                <SelectTrigger id="announcement-course" className="w-full">
                  <SelectValue placeholder="Choose a course…" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={subscribersOnly}
            onCheckedChange={(v) => setSubscribersOnly(v === true)}
          />
          Only learners with an active subscription
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p
            className="flex items-center gap-2 text-sm text-muted-foreground"
            aria-live="polite"
          >
            <Users className="size-4" />
            {!target
              ? "Choose a course to see who this reaches."
              : reach === null
                ? "Counting learners…"
                : reach === 0
                  ? "No learners match this audience."
                  : `Reaches ${reach} learner${reach === 1 ? "" : "s"}.`}
          </p>
          <ConfirmDialog
            title={`Send to ${reach ?? 0} learner${reach === 1 ? "" : "s"}?`}
            description="It appears in each learner's notification bell straight away and can't be recalled."
            confirmLabel="Send"
            icon={<Megaphone className="size-4.5" />}
            onConfirm={send}
          >
            <Button disabled={!ready}>
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send announcement
            </Button>
          </ConfirmDialog>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Sent</h2>
        {history === null ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No announcements sent yet.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {history.map((a) => (
              <li key={a.id} className="space-y-1.5 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{a.title}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {a.recipientCount} learner
                    {a.recipientCount === 1 ? "" : "s"}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {a.body}
                </p>
                <p className="text-xs text-muted-foreground">
                  {audienceLabel(a)} · {a.sentByName ?? "a deleted admin"} ·{" "}
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
