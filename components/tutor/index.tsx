"use client"

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
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import {
  listConversations,
  createConversation,
  deleteConversation,
  listMessages,
  sendMessage,
} from "@/lib/api/ai"
import type {
  IApiConversation,
  IApiAiMessage,
} from "@/utils/interfaces/ai/api.interface"

/** Two-pane AI tutor: conversation list + message thread with a composer. */
export function Tutor() {
  const t = useTranslations("tutor")
  const [conversations, setConversations] = useState<
    IApiConversation[] | null
  >(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<IApiAiMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingThread, setLoadingThread] = useState(false)
  const [isMock, setIsMock] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initial load: conversations (API returns oldest→newest, so reverse) and
  // the most recent thread.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
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
        const created = await createConversation({ title: content.slice(0, 60) })
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
    } catch {
      setError(t("errorSend"))
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 gap-4">
      {/* Conversation list */}
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col rounded-2xl border border-border bg-card/50">
        <div className="p-3">
          <Button onClick={startNewChat} className="w-full gap-2">
            <Plus className="size-4" />
            {t("newChat")}
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 space-y-1">
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
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
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
      <section className="flex-1 flex flex-col min-w-0 rounded-2xl border border-border bg-card/50">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-lg gradient-bg-primary text-white">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">{t("title")}</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {t("subtitle")}
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

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4">
          {loadingThread ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center gap-2 px-6">
              <div className="flex size-12 items-center justify-center rounded-2xl gradient-bg-primary text-white">
                <Sparkles className="size-6" />
              </div>
              <p className="text-sm font-medium">{t("emptyTitle")}</p>
              <p className="text-xs text-muted-foreground max-w-xs">
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
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${
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
              className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 max-h-32"
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
