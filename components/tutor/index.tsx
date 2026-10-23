"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Sparkles,
  Plus,
  Send,
  Trash2,
  Loader2,
  MessageSquare,
  Bot,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/client"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import {
  listConversations,
  createConversation,
  deleteConversation,
  listMessages,
  sendMessage,
  getAiCredits,
} from "@/lib/api/ai"
import type {
  IApiAiCredits,
  IApiConversation,
  IApiAiMessage,
} from "@/utils/interfaces/ai/api.interface"

/** Two-pane AI tutor: conversation list + message thread with a composer. */
export function Tutor() {
  const t = useTranslations("tutor")
  const locale = useLocale()

  /** The 429 explanation for whichever allowance ran out. */
  function allowanceMessage(latest: IApiAiCredits | null): string {
    if (latest?.exhausted !== "replies") return t("errorAllowance")
    if (!latest.periodEndsAt) {
      return t("errorRepliesNoDate", { limit: latest.repliesLimit ?? 0 })
    }
    return t("errorReplies", {
      limit: latest.repliesLimit ?? 0,
      date: new Date(latest.periodEndsAt).toLocaleDateString(
        locale === "km" ? "km-KH" : "en-GB",
        { day: "numeric", month: "long" }
      ),
    })
  }
  const [conversations, setConversations] = useState<IApiConversation[] | null>(
    null
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<IApiAiMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingThread, setLoadingThread] = useState(false)
  const [isMock, setIsMock] = useState(false)
  const [credits, setCredits] = useState<IApiAiCredits | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initial load: conversations (API returns oldest→newest, so reverse) and
  // the most recent thread.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        // The allowance is informational — a failure here must not stop the
        // conversation list from loading.
        void getAiCredits()
          .then((value) => !cancelled && setCredits(value))
          .catch(() => undefined)

        const convos = await listConversations()
        const ordered = [...convos].reverse()
        if (cancelled) return
        setConversations(ordered)
        if (ordered.length > 0) {
          setActiveId(ordered[0].id)
          const msgs = await listMessages(ordered[0].id)
          if (!cancelled) setMessages(msgs)
        }
      } catch {
        if (!cancelled) setConversations([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Keep the thread pinned to the latest message.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, sending])

  async function openConversation(id: string) {
    if (id === activeId) return
    setActiveId(id)
    setError(null)
    setLoadingThread(true)
    try {
      setMessages(await listMessages(id))
    } catch {
      setMessages([])
    } finally {
      setLoadingThread(false)
    }
  }

  function startNewChat() {
    setActiveId(null)
    setMessages([])
    setError(null)
    setInput("")
  }

  async function handleDelete(id: string) {
    try {
      await deleteConversation(id)
    } catch {
      return
    }
    setConversations((prev) => (prev ?? []).filter((c) => c.id !== id))
    if (id === activeId) {
      setActiveId(null)
      setMessages([])
    }
  }

  async function handleSend() {
    const content = input.trim()
    if (!content || sending) return
    setError(null)
    setInput("")

    // Create a conversation on the first message if needed.
    let convId = activeId
    if (!convId) {
      try {
        const created = await createConversation({
          title: content.slice(0, 60),
        })
        convId = created.id
        setActiveId(convId)
        setConversations((prev) => [created, ...(prev ?? [])])
      } catch {
        setError(t("errorSend"))
        setInput(content)
        return
      }
    }

    const optimistic: IApiAiMessage = {
      id: `tmp-${Date.now()}`,
      conversationId: convId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setSending(true)
    try {
      const res = await sendMessage(convId, content)
      setMessages((prev) => [...prev, res.message])
      setIsMock(res.mock)
      // The reply is what spent the allowance, so re-read it after.
      void getAiCredits()
        .then(setCredits)
        .catch(() => undefined)
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0
      if (status === 429) {
        /* Ask which allowance ran out: the plan's replies (reset at renewal)
           or the 30-day token cap — the message and the date differ. */
        const latest = await getAiCredits().catch(() => null)
        if (latest) setCredits(latest)
        setError(allowanceMessage(latest))
      } else {
        setError(status === 504 ? t("errorTimeout") : t("errorSend"))
      }
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 gap-4">
      {/* Conversation list */}
      <aside className="hidden shrink-0 flex-col rounded-2xl border border-border bg-card/50 md:flex md:w-64">
        <div className="p-3">
          <Button onClick={startNewChat} className="w-full gap-2">
            <Plus className="size-4" />
            {t("newChat")}
          </Button>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
          {conversations === null ? (
            <div className="flex justify-center py-6 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              {t("noConversations")}
            </p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={`group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  c.id === activeId
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
                onClick={() => void openConversation(c.id)}
              >
                <MessageSquare className="size-4 shrink-0" />
                <span className="flex-1 truncate">{c.title}</span>
                <ConfirmDialog
                  title={t("deleteTitle")}
                  description={t("deleteDesc")}
                  variant="danger"
                  onConfirm={() => void handleDelete(c.id)}
                >
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    aria-label={t("deleteTitle")}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </ConfirmDialog>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Thread + composer */}
      <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-border bg-card/50">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="gradient-bg-primary flex size-8 items-center justify-center rounded-lg text-white">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm leading-tight font-semibold">{t("title")}</p>
            <p className="text-xs leading-tight text-muted-foreground">
              {credits ? (
                <>
                  {credits.repliesRemaining !== null
                    ? t("repliesRemaining", {
                        remaining: credits.repliesRemaining,
                      })
                    : t("creditsRemaining", {
                        remaining: Math.round(credits.remaining / 1000),
                      })}
                  {" · "}
                  <Link
                    href="/tutor/usage"
                    className="underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {t("viewUsage")}
                  </Link>
                </>
              ) : (
                t("subtitle")
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={startNewChat}
            className="ml-auto gap-1.5 md:hidden"
          >
            <Plus className="size-4" />
            {t("newChat")}
          </Button>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4">
          {loadingThread ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <div className="gradient-bg-primary flex size-12 items-center justify-center rounded-2xl text-white">
                <Sparkles className="size-6" />
              </div>
              <p className="text-sm font-medium">{t("emptyTitle")}</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                {t("emptyDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${
                    m.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {m.role !== "user" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Bot className="size-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm break-words whitespace-pre-wrap ${
                      m.role === "user"
                        ? "gradient-bg-primary text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Bot className="size-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    {t("thinking")}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          {error && (
            <p className="mb-2 px-1 text-xs text-destructive">{error}</p>
          )}
          {isMock && messages.length > 0 && (
            <p className="mb-2 px-1 text-[11px] text-muted-foreground">
              {t("demoReply")}
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void handleSend()
                }
              }}
              rows={1}
              placeholder={t("placeholder")}
              className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            <Button
              onClick={() => void handleSend()}
              disabled={sending || input.trim() === ""}
              size="icon"
              className="size-10 shrink-0 rounded-xl"
              aria-label={t("title")}
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
