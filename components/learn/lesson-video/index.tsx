"use client"

import { useMemo } from "react"

/**
 * Turns a lesson's `videoUrl` into something embeddable.
 *
 * YouTube and Vimeo share links are what course authors actually paste, and
 * neither works in an iframe as-is — YouTube's `watch?v=` and `youtu.be` forms
 * both need `/embed/`. Anything else is treated as a direct media file, which
 * covers self-hosted MP4s.
 */
function resolveEmbed(url: string): { kind: "iframe" | "file"; src: string } | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, "")

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1)
    return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname.startsWith("/embed/")) {
      return { kind: "iframe", src: parsed.toString() }
    }
    const id = parsed.searchParams.get("v")
    return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null
  }

  if (host === "vimeo.com") {
    const id = parsed.pathname.split("/").filter(Boolean)[0]
    return id ? { kind: "iframe", src: `https://player.vimeo.com/video/${id}` } : null
  }

  if (host === "player.vimeo.com") {
    return { kind: "iframe", src: parsed.toString() }
  }

  return { kind: "file", src: parsed.toString() }
}

/**
 * A lesson's video.
 *
 * `lessons.type = 'video'` and `videoUrl` have been in the schema and the DTOs
 * since the beginning, and nothing rendered them — a video lesson showed an
 * empty body. Returns null for an unusable URL so the reader can fall back to
 * the lesson text rather than showing a broken frame.
 */
export function LessonVideo({ url, title }: { url: string; title: string }) {
  const embed = useMemo(() => resolveEmbed(url), [url])
  if (!embed) return null

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-black">
      {embed.kind === "iframe" ? (
        <iframe
          src={embed.src}
          title={title}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        /* Captions ride with the file when the author supplies them; there is
           no separate track to attach here. */
        <video src={embed.src} controls preload="metadata" className="aspect-video w-full">
          {title}
        </video>
      )}
    </div>
  )
}
