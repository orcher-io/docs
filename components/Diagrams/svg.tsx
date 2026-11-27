import type { ReactNode } from 'react'

/**
 * The parts every static diagram in the docs is drawn from: boxes, connectors
 * with arrowheads, labels, groups and numbered markers, on one canvas.
 *
 * A diagram is drawn at one unit per CSS pixel and never scaled up, and every
 * line sits on the pixel grid, so a hairline stays one sharp device pixel.
 * Text is real text: it can be selected and searched, and follows the theme.
 */

export type Point = [x: number, y: number]

/** How a box or a connector is drawn. */
export type Tone = 'plain' | 'accent' | 'failed' | 'undo' | 'quiet'

const CANVAS = 760

export function Figure({
  height,
  label,
  caption,
  children,
}: {
  height: number
  /** What the picture shows, for a reader who cannot see it */
  label: string
  caption?: ReactNode
  children: ReactNode
}) {
  return (
    <figure className="orx orxd not-prose">
      <svg viewBox={`0 0 ${CANVAS} ${height}`} role="img" aria-label={label}>
        <g transform="translate(.25 .25)">{children}</g>
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export interface BoxProps {
  x: number
  y: number
  w: number
  h: number
  title: string
  /** A second, smaller line */
  note?: string
  /** A step number, shown at the left; the title then starts beside it */
  n?: number
  /** A short status at the right, such as "done" */
  mark?: string
  tone?: Tone
  /** The title is an identifier: set it in the code face */
  code?: boolean
  /** A filled box, for where a path ends */
  end?: boolean
}

export function Box({ x, y, w, h, title, note, n, mark, tone = 'plain', code, end }: BoxProps) {
  const numbered = n != null
  const tx = numbered ? x + 40 : x + w / 2
  const anchor = numbered ? 'start' : 'middle'
  const ty = note ? y + h / 2 - 3 : y + h / 2 + 5
  return (
    <g className={`b ${tone}${code ? ' code' : ''}${end ? ' end' : ''}`}>
      <rect x={x} y={y} width={w} height={h} />
      {numbered && (
        <text className="n" x={x + 14} y={y + h / 2 + 4}>
          {String(n).padStart(2, '0')}
        </text>
      )}
      <text className="t" x={tx} y={ty} textAnchor={anchor}>
        {title}
      </text>
      {note && (
        <text className="m" x={tx} y={ty + 17} textAnchor={anchor}>
          {note}
        </text>
      )}
      {mark && (
        <text className="mk" x={x + w - 14} y={y + h / 2 + 4} textAnchor="end">
          {mark}
        </text>
      )}
    </g>
  )
}

/** The middle of each side of a box, for connectors to start and end on. */
export function sides(b: { x: number; y: number; w: number; h: number }) {
  return {
    top: [b.x + b.w / 2, b.y] as Point,
    bottom: [b.x + b.w / 2, b.y + b.h] as Point,
    left: [b.x, b.y + b.h / 2] as Point,
    right: [b.x + b.w, b.y + b.h / 2] as Point,
  }
}

const HEAD = 6

/**
 * A connector from one point to another, with an arrowhead at the end. Straight
 * by default; `curve` bends it, leaving and arriving vertically, for fans.
 */
export function Wire({
  from,
  to,
  tone = 'plain',
  curve,
}: {
  from: Point
  to: Point
  tone?: Tone
  curve?: boolean
}) {
  const [x1, y1] = from
  const [x2, y2] = to
  // The direction the line arrives from: a curve always arrives vertically
  let dx = x2 - x1
  let dy = y2 - y1
  if (curve) {
    dx = 0
    dy = y2 >= y1 ? 1 : -1
  }
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  // Stop the line at the back of the arrowhead, so the tip stays sharp
  const bx = x2 - ux * HEAD
  const by = y2 - uy * HEAD
  const mid = (y1 + by) / 2
  const d = curve ? `M${x1} ${y1} C${x1} ${mid} ${bx} ${mid} ${bx} ${by}` : `M${x1} ${y1} L${bx} ${by}`
  const half = HEAD * 0.42
  const head = `M${x2} ${y2} L${bx - uy * half} ${by + ux * half} L${bx + uy * half} ${by - ux * half}z`
  return (
    <g className={`w ${tone}`}>
      <path className="line" d={d} />
      <path className="head" d={head} />
    </g>
  )
}

// Labels are set in JetBrains Mono at 11px, where every character is 6.6px wide
const CHAR = 6.6

/** A label. `pill` gives it a backing, for where it sits on a connector. */
export function Label({
  x,
  y,
  text,
  tone = 'plain',
  pill,
}: {
  x: number
  y: number
  text: string
  tone?: Tone
  pill?: boolean
}) {
  const w = Math.round(text.length * CHAR + 18)
  return (
    <g className={`lab ${tone}`}>
      {pill && <rect x={Math.round(x - w / 2)} y={y - 14} width={w} height={20} />}
      <text x={x} y={y} textAnchor="middle">
        {text}
      </text>
    </g>
  )
}

/** A dashed outline around related boxes, with its name on the border. */
export function Group({
  x,
  y,
  w,
  h,
  name,
}: {
  x: number
  y: number
  w: number
  h: number
  name?: string
}) {
  return (
    <g className="grp">
      <rect className="g-edge" x={x} y={y} width={w} height={h} />
      {name && (
        <>
          <rect className="g-gap" x={x + 11} y={y - 8} width={Math.round(name.length * CHAR + 14)} height={16} />
          <text x={x + 18} y={y + 4}>
            {name}
          </text>
        </>
      )}
    </g>
  )
}

/** A numbered marker on the picture, matching a numbered list under it. */
export function Marker({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g className="co">
      <circle cx={x} cy={y} r={9} />
      <text x={x} y={y + 3.6} textAnchor="middle">
        {n}
      </text>
    </g>
  )
}
