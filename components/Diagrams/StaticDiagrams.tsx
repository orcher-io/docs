import type { ReactNode } from 'react'

import { Box, Figure, Label, Wire, sides, type Tone } from './svg'

/**
 * The diagram shapes the docs use, each described by its content: a page says
 * what the steps or branches are, and the layout is worked out here, so every
 * diagram of a kind looks the same.
 */

const WIDTH = 760

// ---------------------------------------------------------------------------
// Steps: one or two columns of numbered steps, each ending in a result. A
// column can fail part way and undo what it finished.
// ---------------------------------------------------------------------------

interface Step {
  title: string
  /** A second, smaller line under the title */
  note?: string
  /** A short status at the right, such as "done" */
  mark?: string
  /** This step fails */
  failed?: boolean
  /** This step is the one the diagram is about: drawn in the accent colour */
  accent?: boolean
  /** The title is an identifier: set it in the code face */
  code?: boolean
}

interface StepColumn {
  title: string
  /** The column shows a failure: its title is drawn in red */
  failure?: boolean
  steps: Step[]
  /** What the steps that finished are undone by, in the order they run */
  undo?: { label: string; steps: (Step & { n: number })[] }
  /** Where the column ends, if it is worth saying */
  end?: string
}

export function StepsDiagram({
  columns,
  label,
  caption,
}: {
  columns: StepColumn[]
  label: string
  caption?: ReactNode
}) {
  const W = columns.length === 1 ? 420 : columns.length === 2 ? 340 : 228
  // A step with a note under its title needs a taller box; keep them all alike
  const noted = columns.some((c) => c.steps.some((s) => s.note))
  const H = noted ? 54 : 44
  const GAP = 22
  const TOP = 34
  const pitch = H + GAP
  const gutter = (WIDTH - columns.length * W) / (columns.length + 1)
  const rows = (c: StepColumn) => c.steps.length + (c.undo ? c.undo.steps.length : 0) + (c.end ? 1 : 0)
  const height = TOP + Math.max(...columns.map(rows)) * pitch - GAP + Math.max(...columns.map((c) => (c.undo ? 20 : 0))) + 8

  return (
    <Figure height={height} label={label} caption={caption}>
      {columns.map((column, c) => {
        const x = gutter + c * (W + gutter)
        const out: ReactNode[] = [
          <Label key="title" x={x + W / 2} y={14} text={column.title} tone={column.failure ? 'failed' : 'quiet'} />,
        ]
        let y = TOP
        let previous: { x: number; y: number; w: number; h: number } | null = null
        let tone: Tone = 'plain'
        const place = (key: string, box: Parameters<typeof Box>[0]) => {
          if (previous) out.push(<Wire key={key + '-w'} from={sides(previous).bottom} to={sides(box).top} tone={tone} />)
          out.push(<Box key={key} {...box} />)
          previous = box
        }
        column.steps.forEach((step, i) => {
          place('s' + i, { x, y, w: W, h: H, title: step.title, note: step.note, code: step.code, n: i + 1, mark: step.mark, tone: step.failed ? 'failed' : step.accent ? 'accent' : 'plain' })
          y += pitch
        })
        if (column.undo) {
          tone = 'undo'
          y += 20
          column.undo.steps.forEach((step, i) => {
            place('u' + i, { x, y, w: W, h: H, title: step.title, n: step.n, mark: step.mark, tone: 'undo' })
            y += pitch
          })
          // The label sits on the connector between the failure and the first undo
          out.push(<Label key="undo" x={x + W / 2} y={TOP + column.steps.length * pitch + 4} text={column.undo.label} pill />)
        }
        if (column.end) place('end', { x: x + 60, y, w: W - 120, h: 44, title: column.end, end: true })
        return <g key={c}>{out}</g>
      })}
    </Figure>
  )
}

// ---------------------------------------------------------------------------
// Fan-out and fan-in: one start, several branches at once, one join.
// ---------------------------------------------------------------------------

export function FanOutDiagram({
  start,
  branches,
  join,
  out = 'fan out: all at once',
  back = 'fan in: wait for all',
  after,
  label,
  caption,
}: {
  start: string
  branches: { title: string; note?: string }[]
  join: string
  out?: string
  back?: string
  /** What happens after the join, as a quiet line under it */
  after?: string
  label: string
  caption?: ReactNode
}) {
  const n = branches.length
  const gap = 18
  const w = Math.min(170, Math.floor((WIDTH - 68 - (n - 1) * gap) / n))
  const total = n * w + (n - 1) * gap
  const x0 = (WIDTH - total) / 2
  const top = { x: WIDTH / 2 - 90, y: 6, w: 180, h: 44, title: start }
  const boxes = branches.map((b, i) => ({ x: Math.round(x0 + i * (w + gap)), y: 124, w, h: b.note ? 50 : 44, ...b }))
  const bottom = { x: WIDTH / 2 - 100, y: 252, w: 200, h: 44, title: join }
  return (
    <Figure height={after ? 330 : 304} label={label} caption={caption}>
      {boxes.map((b, i) => (
        <Wire key={'o' + i} from={sides(top).bottom} to={sides(b).top} tone="accent" curve />
      ))}
      {boxes.map((b, i) => (
        <Wire key={'i' + i} from={sides(b).bottom} to={sides(bottom).top} curve />
      ))}
      <Box {...top} />
      {boxes.map((b, i) => (
        <Box key={i} {...b} />
      ))}
      <Box {...bottom} />
      <Label x={WIDTH / 2} y={92} text={out} tone="accent" pill />
      <Label x={WIDTH / 2} y={226} text={back} pill />
      {after && <Label x={WIDTH / 2} y={322} text={after} tone="quiet" />}
    </Figure>
  )
}
