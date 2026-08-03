"use client"

import { useEffect } from "react"
import { RefreshCw } from "lucide-react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="km">
      <body className="font-sans" style={{ margin: 0, background: "#06040f", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "400px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "#f0f0f0", marginBottom: "0.75rem", fontSize: "1.5rem" }}>Critical error</h2>
          <p style={{ color: "#888", marginBottom: "2rem", lineHeight: "1.6" }}>
            Something went seriously wrong. Please refresh the page to continue.
          </p>
          <button
            onClick={reset}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1.5rem", borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)",
              color: "white", border: "none", cursor: "pointer",
              fontSize: "0.875rem", fontWeight: 600,
            }}
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
