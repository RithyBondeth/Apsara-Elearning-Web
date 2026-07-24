"use client"

import { useMemo } from "react"
import { compile } from "./evaluate"

/**
 * Renders a math graph from a compact JSON spec carried in a ```graph fenced
 * code block, so lesson content stays pure seedable text — no image assets.
 *
 * Axes, grid and tick labels use `currentColor`, so the plot re-themes for
 * light/dark automatically; curves and points use a small fixed palette keyed
 * by name. Functions are sampled and drawn as broken polylines, so asymptotes
 * and discontinuities (tan, 1/x, ln near 0) leave a gap instead of a spike.
 *
 * Spec shape (all fields optional except the ranges):
 * {
 *   "xRange": [-4, 4], "yRange": [-2, 8],
 *   "xLabel": "x", "yLabel": "y", "grid": true, "caption": "…",
 *   "functions":   [{ "fn": "exp(x)", "color": "violet", "label": "y=e^x", "dashed": false }],
 *   "points":      [{ "x": 0, "y": 1, "label": "(0,1)", "color": "rose", "open": false }],
 *   "segments":    [{ "from": [0,0], "to": [3,3], "color": "cyan", "arrow": true, "label": "v" }],
 *   "vAsymptotes": [{ "x": 2, "label": "x=2" }],
 *   "hAsymptotes": [{ "y": 0, "label": "y=0" }]
 * }
 */

const PALETTE: Record<string, string> = {
  violet: "#8b5cf6",
  purple: "#8b5cf6",
  primary: "#8b5cf6",
  cyan: "#06b6d4",
  rose: "#f43f5e",
  red: "#f43f5e",
  amber: "#f59e0b",
  orange: "#f59e0b",
  emerald: "#10b981",
  green: "#10b981",
  blue: "#3b82f6",
  slate: "#64748b",
}
const color = (name?: string) => (name && PALETTE[name]) || PALETTE.violet

interface FnSpec { fn: string; color?: string; label?: string; dashed?: boolean }
interface AreaSpec { fn: string; from: number; to: number; color?: string; label?: string }
interface PointSpec { x: number; y: number; label?: string; color?: string; open?: boolean }
interface SegSpec { from: [number, number]; to: [number, number]; color?: string; dashed?: boolean; arrow?: boolean; label?: string }
interface VAsym { x: number; label?: string }
interface HAsym { y: number; label?: string }
interface GraphSpec {
  xRange: [number, number]
  yRange: [number, number]
  xLabel?: string
  yLabel?: string
  grid?: boolean
  caption?: string
  functions?: FnSpec[]
  areas?: AreaSpec[]
  points?: PointSpec[]
  segments?: SegSpec[]
  vAsymptotes?: VAsym[]
  hAsymptotes?: HAsym[]
}

/* SVG canvas — fixed viewBox, scaled to 100% width by the container. */
const W = 640
const H = 400
const PAD = { left: 44, right: 20, top: 20, bottom: 34 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

/** A "nice" grid step (1/2/5 × 10ⁿ) giving roughly `target` divisions. */
function niceStep(span: number, target: number): number {
  const raw = span / target
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10
  return step * mag
}

function ticks(min: number, max: number, step: number): number[] {
  const out: number[] = []
  const start = Math.ceil(min / step - 1e-9) * step
  for (let v = start; v <= max + 1e-9; v += step) {
    // snap near-zero to exactly 0 to avoid "-0" / float dust in labels
    out.push(Math.abs(v) < step / 1e6 ? 0 : v)
  }
  return out
}

const fmt = (n: number) =>
  Number.parseFloat(n.toFixed(4)).toString().replace("-", "−")

export function GraphPlot({ spec: raw }: { spec: string }) {
  const parsed = useMemo<GraphSpec | { error: string }>(() => {
    try {
      const s = JSON.parse(raw) as GraphSpec
      if (!Array.isArray(s.xRange) || !Array.isArray(s.yRange))
        return { error: "graph spec needs xRange and yRange" }
      return s
    } catch (e) {
      return { error: e instanceof Error ? e.message : "invalid graph spec" }
    }
  }, [raw])

  if ("error" in parsed) {
    return (
      <div className="my-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
        មិនអាចបង្ហាញក្រាបបានទេ ({parsed.error})
      </div>
    )
  }

  const spec = parsed
  const [xMin, xMax] = spec.xRange
  const [yMin, yMax] = spec.yRange
  const xSpan = xMax - xMin || 1
  const ySpan = yMax - yMin || 1

  const px = (x: number) => PAD.left + ((x - xMin) / xSpan) * PLOT_W
  const py = (y: number) => PAD.top + ((yMax - y) / ySpan) * PLOT_H

  const xStep = niceStep(xSpan, 10)
  const yStep = niceStep(ySpan, 8)
  const xTicks = ticks(xMin, xMax, xStep)
  const yTicks = ticks(yMin, yMax, yStep)

  // Axis positions: on 0 if it's in range, else clamped to the plot edge.
  const axisX = px(Math.min(Math.max(0, xMin), xMax))
  const axisY = py(Math.min(Math.max(0, yMin), yMax))

  /* Sample a function into one or more polyline sub-paths, breaking wherever
     the value is non-finite or shoots far outside the y-window (asymptotes). */
  const buildPath = (fn: (x: number) => number): string => {
    const N = 480
    const bound = yMax + ySpan * 2
    const lbound = yMin - ySpan * 2
    let d = ""
    let penDown = false
    for (let i = 0; i <= N; i++) {
      const x = xMin + (xSpan * i) / N
      const y = fn(x)
      const ok = Number.isFinite(y) && y < bound && y > lbound
      if (ok) {
        d += `${penDown ? "L" : "M"}${px(x).toFixed(2)} ${py(y).toFixed(2)} `
        penDown = true
      } else {
        penDown = false
      }
    }
    return d.trim()
  }

  /* A shaded region under a curve between two x-bounds (definite integrals). */
  const buildArea = (fn: (x: number) => number, a: number, b: number): string => {
    const N = 160
    const y0 = Math.min(Math.max(0, yMin), yMax) // clamp baseline into view
    let d = `M${px(a).toFixed(2)} ${py(y0).toFixed(2)} `
    for (let i = 0; i <= N; i++) {
      const x = a + ((b - a) * i) / N
      const y = fn(x)
      if (Number.isFinite(y)) d += `L${px(x).toFixed(2)} ${py(y).toFixed(2)} `
    }
    d += `L${px(b).toFixed(2)} ${py(y0).toFixed(2)} Z`
    return d
  }

  const areas = (spec.areas ?? []).map((a) => {
    let d = ""
    try {
      d = buildArea(compile(a.fn), a.from, a.to)
    } catch {
      d = ""
    }
    return { d, ...a }
  })

  const curves = (spec.functions ?? []).map((f) => {
    let d = ""
    try {
      d = buildPath(compile(f.fn))
    } catch {
      d = ""
    }
    return { d, ...f }
  })

  const gridColor = "currentColor"

  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card/40 p-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full text-foreground"
          role="img"
          aria-label={spec.caption ?? "ក្រាប"}
          style={{ minWidth: 320 }}
        >
          <defs>
            {["violet", "cyan", "rose", "amber", "emerald", "blue"].map((c) => (
              <marker
                key={c}
                id={`arrow-${c}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" fill={color(c)} />
              </marker>
            ))}
          </defs>

          {/* grid */}
          {spec.grid !== false && (
            <g stroke={gridColor} strokeWidth={1} opacity={0.1}>
              {xTicks.map((t, i) => (
                <line key={`gx${i}`} x1={px(t)} y1={PAD.top} x2={px(t)} y2={H - PAD.bottom} />
              ))}
              {yTicks.map((t, i) => (
                <line key={`gy${i}`} x1={PAD.left} y1={py(t)} x2={W - PAD.right} y2={py(t)} />
              ))}
            </g>
          )}

          {/* shaded areas (definite-integral regions) — under the curves */}
          {areas.map((a, i) =>
            a.d ? <path key={`area${i}`} d={a.d} fill={color(a.color)} opacity={0.18} stroke="none" /> : null
          )}

          {/* asymptotes (dashed) */}
          <g strokeDasharray="5 4" strokeWidth={1.5} opacity={0.7}>
            {(spec.vAsymptotes ?? []).map((a, i) => (
              <line key={`va${i}`} x1={px(a.x)} y1={PAD.top} x2={px(a.x)} y2={H - PAD.bottom} stroke={PALETTE.slate} />
            ))}
            {(spec.hAsymptotes ?? []).map((a, i) => (
              <line key={`ha${i}`} x1={PAD.left} y1={py(a.y)} x2={W - PAD.right} y2={py(a.y)} stroke={PALETTE.slate} />
            ))}
          </g>

          {/* axes */}
          <g stroke="currentColor" strokeWidth={1.5} opacity={0.55}>
            <line x1={PAD.left} y1={axisY} x2={W - PAD.right} y2={axisY} />
            <line x1={axisX} y1={PAD.top} x2={axisX} y2={H - PAD.bottom} />
          </g>

          {/* tick labels */}
          <g fill="currentColor" opacity={0.6} fontSize={11} fontFamily="ui-sans-serif, system-ui">
            {xTicks.filter((t) => t !== 0).map((t, i) => (
              <text key={`tx${i}`} x={px(t)} y={axisY + 14} textAnchor="middle">{fmt(t)}</text>
            ))}
            {yTicks.filter((t) => t !== 0).map((t, i) => (
              <text key={`ty${i}`} x={axisX - 6} y={py(t) + 3.5} textAnchor="end">{fmt(t)}</text>
            ))}
            <text x={W - PAD.right} y={axisY - 6} textAnchor="end" opacity={0.8}>{spec.xLabel ?? "x"}</text>
            <text x={axisX + 6} y={PAD.top + 4} opacity={0.8}>{spec.yLabel ?? "y"}</text>
          </g>

          {/* segments (lines / vectors / tangents / oblique asymptotes) */}
          {(spec.segments ?? []).map((s, i) => {
            const c = s.color ?? "cyan"
            return (
              <g key={`seg${i}`}>
                <line
                  x1={px(s.from[0])}
                  y1={py(s.from[1])}
                  x2={px(s.to[0])}
                  y2={py(s.to[1])}
                  stroke={color(c)}
                  strokeWidth={2}
                  strokeDasharray={s.dashed ? "6 4" : undefined}
                  markerEnd={s.arrow ? `url(#arrow-${c in PALETTE ? c : "cyan"})` : undefined}
                />
                {s.label && (
                  <text
                    x={(px(s.from[0]) + px(s.to[0])) / 2 + 6}
                    y={(py(s.from[1]) + py(s.to[1])) / 2 - 4}
                    fill={color(c)}
                    fontSize={12}
                    fontWeight={600}
                  >
                    {s.label}
                  </text>
                )}
              </g>
            )
          })}

          {/* function curves */}
          {curves.map((c, i) =>
            c.d ? (
              <path
                key={`fn${i}`}
                d={c.d}
                fill="none"
                stroke={color(c.color)}
                strokeWidth={2.25}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={c.dashed ? "6 4" : undefined}
              />
            ) : null
          )}

          {/* points */}
          {(spec.points ?? []).map((p, i) => (
            <g key={`pt${i}`}>
              <circle
                cx={px(p.x)}
                cy={py(p.y)}
                r={3.8}
                fill={p.open ? "var(--card)" : color(p.color)}
                stroke={color(p.color)}
                strokeWidth={2}
              />
              {p.label && (
                <text
                  x={px(p.x) + 8}
                  y={py(p.y) - 7}
                  fill="currentColor"
                  fontSize={12}
                  fontWeight={600}
                >
                  {p.label}
                </text>
              )}
            </g>
          ))}

          {/* legend for labelled functions */}
          {curves.some((c) => c.label) && (
            <g fontSize={12} fontFamily="ui-sans-serif, system-ui">
              {curves
                .filter((c) => c.label)
                .map((c, i) => {
                  const y = PAD.top + 8 + i * 18
                  return (
                    <g key={`lg${i}`} transform={`translate(${PAD.left + 8}, ${y})`}>
                      <line x1={0} y1={0} x2={18} y2={0} stroke={color(c.color)} strokeWidth={2.5} strokeDasharray={c.dashed ? "5 3" : undefined} />
                      <text x={24} y={4} fill="currentColor">{c.label}</text>
                    </g>
                  )
                })}
            </g>
          )}
        </svg>
      </div>
      {spec.caption && (
        <figcaption className="mt-2 text-center text-[13px] italic text-muted-foreground leading-khmer">
          {spec.caption}
        </figcaption>
      )}
    </figure>
  )
}
