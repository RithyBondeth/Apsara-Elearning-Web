import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black gradient-text mb-4 select-none">404</div>
        <div className="inline-flex size-14 rounded-2xl gradient-bg-primary items-center justify-center mb-6">
          <Sparkles className="size-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Page not found</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
