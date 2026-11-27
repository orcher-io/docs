import type { ReactNode } from 'react'

import { Box, Figure, Group, Label, Wire, sides } from './svg'

const WIDTH = 760

interface State {
  title: string
  note?: string
  /** The state the diagram is about */
  accent?: boolean
}

/**
 * A row of states with the transitions between neighbours, and the endings one
 * of them leads to, grouped under a name.
 */
export function StatesDiagram({
  states,
  transitions,
  endings,
  label,
  caption,
}: {
  states: State[]
  /** Between each state and the next: the label going forward, and back if it can return */
  transitions: { forward: string; back?: string }[]
  /** The endings, their group's name, and the state (by position) that leads to them */
  endings: { name: string; from: number; items: { title: string; failed?: boolean }[] }
  label: string
  caption?: ReactNode
}) {
  const W = 150
  const H = 50
  const Y = 36
  const span = (WIDTH - 80 - states.length * W) / (states.length - 1)
  const boxes = states.map((s, i) => ({ x: Math.round(40 + i * (W + span)), y: Y, w: W, h: H, ...s }))

  // The endings wrap onto rows of four, each row centred
  const PER_ROW = 4
  const rows: { title: string; failed?: boolean }[][] = []
  for (let i = 0; i < endings.items.length; i += PER_ROW) rows.push(endings.items.slice(i, i + PER_ROW))
  const groupY = 176
  const groupH = 24 + rows.length * 54
  const source = boxes[endings.from]

  return (
    <Figure height={groupY + groupH + 8} label={label} caption={caption}>
      {transitions.map((t, i) => {
        const a = boxes[i]
        const b = boxes[i + 1]
        const mid = (a.x + a.w + b.x) / 2
        const cy = a.y + a.h / 2
        if (!t.back) {
          return (
            <g key={i}>
              <Wire from={sides(a).right} to={sides(b).left} />
              <Label x={mid} y={cy - 9} text={t.forward} />
            </g>
          )
        }
        return (
          <g key={i}>
            <Wire from={[a.x + a.w, cy - 9]} to={[b.x, cy - 9]} />
            <Wire from={[b.x, cy + 9]} to={[a.x + a.w, cy + 9]} />
            <Label x={mid} y={cy - 18} text={t.forward} />
            <Label x={mid} y={cy + 26} text={t.back} />
          </g>
        )
      })}
      <Wire from={sides(source).bottom} to={[source.x + source.w / 2, groupY]} />
      {boxes.map((b, i) => (
        <Box key={i} x={b.x} y={b.y} w={b.w} h={b.h} title={b.title} note={b.note} tone={b.accent ? 'accent' : 'plain'} />
      ))}
      <Group x={40} y={groupY} w={WIDTH - 80} h={groupH} name={endings.name} />
      {rows.map((row, r) => {
        const w = row.length === PER_ROW ? 152 : 196
        const gap = 16
        const total = row.length * w + (row.length - 1) * gap
        const x0 = (WIDTH - total) / 2
        return row.map((item, k) => (
          <Box
            key={`${r}-${k}`}
            x={Math.round(x0 + k * (w + gap))}
            y={groupY + 20 + r * 54}
            w={w}
            h={38}
            title={item.title}
            tone={item.failed ? 'failed' : 'plain'}
            end
          />
        ))
      })}
    </Figure>
  )
}

/**
 * Routing: one source sends each item down one of several paths, and may
 * ignore what it does not recognise.
 */
export function RoutingDiagram({
  source,
  by,
  paths,
  otherwise,
  footer,
  label,
  caption,
}: {
  source: { title: string; note?: string; code?: boolean }
  /** What it routes on, shown on the connectors */
  by: string
  paths: { title: string; note?: string; code?: boolean }[]
  /** What happens to anything else */
  otherwise?: { title: string; note?: string }
  footer?: string
  label: string
  caption?: ReactNode
}) {
  const count = paths.length + (otherwise ? 1 : 0)
  const gap = 12
  const w = Math.min(190, Math.floor((WIDTH - 24 - (count - 1) * gap) / count))
  const total = count * w + (count - 1) * gap
  const x0 = (WIDTH - total) / 2
  const top = { x: WIDTH / 2 - 130, y: 6, w: 260, h: 54 }
  const at = (i: number) => ({ x: Math.round(x0 + i * (w + gap)), y: 150, w, h: 58 })

  return (
    <Figure height={footer ? 252 : 218} label={label} caption={caption}>
      {paths.map((_, i) => (
        <Wire key={i} from={sides(top).bottom} to={sides(at(i)).top} tone="accent" curve />
      ))}
      {otherwise && <Wire from={sides(top).bottom} to={sides(at(paths.length)).top} tone="quiet" curve />}
      <Box {...top} title={source.title} note={source.note} code={source.code} tone="accent" />
      {paths.map((p, i) => (
        <Box key={i} {...at(i)} title={p.title} note={p.note} code={p.code} />
      ))}
      {otherwise && <Box {...at(paths.length)} title={otherwise.title} note={otherwise.note} tone="quiet" />}
      <Label x={WIDTH / 2} y={100} text={by} tone="accent" pill />
      {footer && <Label x={WIDTH / 2} y={244} text={footer} tone="quiet" />}
    </Figure>
  )
}
