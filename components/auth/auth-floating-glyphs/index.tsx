import {
  Atom,
  Braces,
  FlaskConical,
  Languages,
  Microscope,
} from "lucide-react"

const glyphs = [
  { content: "π", className: "left-[4%] top-[24%] text-3xl text-blue-500/45", delay: "-1s" },
  { content: "∑", className: "left-[7%] top-[65%] text-4xl text-amber-500/40", delay: "-4s" },
  { content: "ក", className: "right-[5%] top-[20%] text-3xl text-amber-500/45", delay: "-2s" },
  { content: "√x", className: "right-[6%] top-[69%] text-2xl text-cyan-500/40", delay: "-5s" },
]

const iconGlyphs = [
  { icon: Atom, className: "left-[3%] top-[44%] text-sky-500/40", delay: "-3s" },
  { icon: Braces, className: "left-[12%] top-[82%] text-indigo-500/35", delay: "-6s" },
  { icon: FlaskConical, className: "right-[3%] top-[46%] text-teal-500/40", delay: "-1.5s" },
  { icon: Languages, className: "right-[12%] top-[83%] text-blue-500/35", delay: "-4.5s" },
  { icon: Microscope, className: "right-[13%] top-[10%] text-emerald-500/30", delay: "-7s" },
]

export function AuthFloatingGlyphs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2] hidden overflow-hidden lg:block"
    >
      {glyphs.map((glyph) => (
        <span
          key={glyph.content}
          className={`auth-floating-glyph absolute select-none font-bold ${glyph.className}`}
          style={{ animationDelay: glyph.delay }}
        >
          {glyph.content}
        </span>
      ))}

      {iconGlyphs.map(({ icon: Icon, className, delay }) => (
        <Icon
          key={className}
          className={`auth-floating-glyph absolute size-7 ${className}`}
          style={{ animationDelay: delay }}
          strokeWidth={2.15}
        />
      ))}
    </div>
  )
}
