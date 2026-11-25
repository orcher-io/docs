'use client'

import { useEffect, useRef, type CSSProperties } from 'react'

import { Controls } from './Controls'
import { clamp, ease, startTimeline } from './timeline'

/**
 * One run of a workflow, through a crash: a worker runs the function line by
 * line, each result lands in the journal, the worker is killed mid-task, and a
 * new worker replays the recorded steps before carrying on.
 *
 * The page is plain markup; the animation is driven from one effect, as a pure
 * function of time, so that the timeline underneath can be scrubbed.
 */

type Token = [className: string, text: string]

// The workflow, as the worker window shows it
const CODE: Token[][] = [
  [['k', 'async'], ['', ' '], ['fn', 'run'], ['pn', '('], ['', 'ctx, order'], ['pn', ') {']],
  [['', '  '], ['k', 'await'], ['', ' ctx.'], ['fn', 'executeTask'], ['pn', '('], ['s', 'chargeCard'], ['pn', ')']],
  [['', '  '], ['k', 'await'], ['', ' ctx.'], ['fn', 'executeTask'], ['pn', '('], ['s', 'updateInventory'], ['pn', ')']],
  [['', '  '], ['k', 'await'], ['', ' ctx.'], ['fn', 'executeTask'], ['pn', '('], ['s', 'sendConfirmation'], ['pn', ')']],
  [['', '  '], ['k', 'await'], ['', ' ctx.'], ['fn', 'executeTask'], ['pn', '('], ['s', 'notifyWarehouse'], ['pn', ')']],
  [['', '  '], ['k', 'return'], ['', ' '], ['pn', '{'], ['', ' orderId: order.id '], ['pn', '}']],
  [['pn', '}']],
]

const TASKS = ['chargeCard', 'updateInventory', 'sendConfirmation', 'notifyWarehouse']

const JOURNAL: [kind: string, subject: string, result: string][] = [
  ['started', 'process-order', ''],
  ['result', 'chargeCard', ' → ch_xyz'],
  ['result', 'updateInventory', ' → ok'],
  ['result', 'sendConfirmation', ' → sent'],
  ['result', 'notifyWarehouse', ' → ok'],
  ['completed', 'process-order', ''],
]

type LineState = '' | 'run' | 'ok' | 'lost' | 'read' | 're'
type Action = { t: 'append' } | { t: 'write' | 'read'; line: number; row: number }

interface RunBeat {
  d: number
  /** The chapter this beat opens */
  phase?: string
  /** The worker: the first one, killed, or its replacement */
  w: 'a' | 'dead' | 'b'
  /** The state of each of the four task lines */
  L: LineState[]
  /** The line the cursor is on */
  cur: number
  /** Journal entries before this beat */
  rows: number
  /** What travels between the code and the journal during it */
  act?: Action
  cap: string
}

const BEATS: RunBeat[] = [
  { d: 1100, phase: 'Start', w: 'a', L: ['', '', '', ''], cur: 0, rows: 0, act: { t: 'append' }, cap: 'A client starts the run. The engine commits it to the journal before it answers.' },
  { d: 1700, w: 'a', L: ['run', '', '', ''], cur: 1, rows: 1, act: { t: 'write', line: 1, row: 1 }, cap: '<code>chargeCard</code> runs, and its result is committed to the journal.' },
  { d: 1700, w: 'a', L: ['ok', 'run', '', ''], cur: 2, rows: 2, act: { t: 'write', line: 2, row: 2 }, cap: '<code>updateInventory</code> runs and is recorded. Two steps are now safe.' },
  { d: 1100, w: 'a', L: ['ok', 'ok', 'run', ''], cur: 3, rows: 3, cap: '<code>sendConfirmation</code> starts.' },
  { d: 2000, phase: 'Crash', w: 'dead', L: ['ok', 'ok', 'lost', ''], cur: 3, rows: 3, cap: 'The worker is killed mid-task. Nothing was recorded for <code>sendConfirmation</code>.' },
  { d: 1700, phase: 'Replay', w: 'b', L: ['', '', '', ''], cur: 0, rows: 3, cap: 'A new worker takes the run and calls the function again from the top.' },
  { d: 800, w: 'b', L: ['read', '', '', ''], cur: 1, rows: 3, act: { t: 'read', line: 1, row: 1 }, cap: '<code>chargeCard</code> is in the journal, so its result comes straight back. No second charge.' },
  { d: 800, w: 'b', L: ['re', 'read', '', ''], cur: 2, rows: 3, act: { t: 'read', line: 2, row: 2 }, cap: 'The same for <code>updateInventory</code>: read, not run.' },
  { d: 1900, phase: 'Resume', w: 'b', L: ['re', 're', 'run', ''], cur: 3, rows: 3, act: { t: 'write', line: 3, row: 3 }, cap: 'There is no entry for <code>sendConfirmation</code>, so it runs, perhaps for the second time. Tasks must be safe to run twice.' },
  { d: 1700, w: 'b', L: ['re', 're', 'ok', 'run'], cur: 4, rows: 4, act: { t: 'write', line: 4, row: 4 }, cap: '<code>notifyWarehouse</code> runs: the step the first worker never reached.' },
  { d: 1800, phase: 'Done', w: 'b', L: ['re', 're', 'ok', 'ok'], cur: 5, rows: 5, act: { t: 'append' }, cap: 'The run completes. One charge, and a record of every step.' },
]

// Timeline bars: [task row, beat, colour]. A task has a bar for each time it
// was on a worker: ran, interrupted, or answered from the journal.
const BARS: [row: number, beat: number, colour: 'teal' | 'cyan' | 'red'][] = [
  [0, 1, 'teal'], [1, 2, 'teal'], [2, 3, 'red'],
  [0, 6, 'cyan'], [1, 7, 'cyan'], [2, 8, 'teal'], [3, 9, 'teal'],
]
const CRASH_BEAT = 4
const CHIPS: Record<string, string> = { run: 'running', ok: 'ran', lost: 'interrupted', read: 'reading', re: 'replayed' }
const RULER = 26
const ROW = 30

function RunCrashDiagram() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const el = <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-el="${name}"]`)!
    const stage = el('stage')
    const win = el('win')
    const status = el('status')
    const cursor = el('cursor')
    const lines = [...root.querySelectorAll<HTMLElement>('.ln')]
    const rows = [...root.querySelectorAll<HTMLElement>('.row')]
    const names = [...root.querySelectorAll<HTMLElement>('.names span')].slice(1)
    const knob = root.querySelector<HTMLElement>('.knob')!
    const path = el<SVGPathElement>('path')
    const dots = [...root.querySelectorAll<SVGCircleElement>('.wire circle')]
    const phase = el('phase')
    const caption = el('caption')
    const charged = el('charged')
    const entries = el('entries')
    const replayed = el('replayed')

    // The timeline: a ruler, a row per task, a bar wherever it was on a worker
    const starts: number[] = []
    let total = 0
    for (const b of BEATS) {
      starts.push(total)
      total += b.d
    }
    const pct = (ms: number) => (ms / total) * 100 + '%'
    const layer = el('bars')
    layer.replaceChildren()
    const add = (className: string, style: Partial<CSSStyleDeclaration>, parent: HTMLElement = layer) => {
      const node = document.createElement('div')
      node.className = className
      Object.assign(node.style, style)
      parent.appendChild(node)
      return node
    }
    const ruler = add('ruler', {})
    const grid = add('gridl', {})
    for (let ms = 0; ms <= total; ms += 500) {
      const tick = document.createElement('i')
      tick.style.left = pct(ms)
      if (ms % 2000 === 0) {
        tick.className = 'maj'
        tick.dataset.t = ms / 1000 + 's'
        const line = document.createElement('i')
        line.style.left = pct(ms)
        grid.appendChild(line)
      }
      ruler.appendChild(tick)
    }
    for (let r = 1; r < TASKS.length; r++) add('rowline', { top: RULER + r * ROW + 'px' })
    const down = add('down', { left: pct(starts[CRASH_BEAT]), width: pct(BEATS[CRASH_BEAT].d) })
    const bars = BARS.map(([row, beat, colour]) => {
      const a = starts[beat]
      const z = a + BEATS[beat].d
      const bar = add('span' + (colour === 'red' ? ' lost' : ''), {
        left: pct(a),
        width: `calc(${pct(z - a)} - 3px)`,
        top: RULER + row * ROW + 10 + 'px',
      })
      bar.style.setProperty('--c', `var(--${colour})`)
      const fill = document.createElement('i')
      bar.appendChild(fill)
      return { fill, a, z, row }
    })

    const anchor = (node: Element, side: 'l' | 'r'): [number, number] => {
      const s = stage.getBoundingClientRect()
      const r = node.getBoundingClientRect()
      return [(side === 'r' ? r.right : r.left) - s.left, r.top + r.height / 2 - s.top]
    }

    function render(k: number, p: number) {
      const b = BEATS[k]
      const act = b.act
      const now = starts[k] + p * b.d

      for (const bar of bars) bar.fill.style.width = clamp((now - bar.a) / (bar.z - bar.a), 0, 1) * 100 + '%'
      down.classList.toggle('on', now >= starts[CRASH_BEAT])
      names.forEach((n, i) => n.classList.toggle('on', bars.some((x) => x.row === i && now >= x.a && now < x.z)))
      knob.dataset.t = (now / 1000).toFixed(1) + 's'

      // A write lands late in its beat, a read early: reading is the quick one
      const landed = !!act && (act.t === 'read' ? p >= 0.62 : p >= 0.9)
      win.dataset.w = b.w
      status.textContent = b.w === 'dead' ? 'killed' : b.w === 'b' ? 'restarted' : 'running'
      const states = b.L.map((s) => (landed && s === 'run' ? 'ok' : landed && s === 'read' ? 're' : s))
      states.forEach((s, i) => {
        const line = lines[i + 1]
        if (s) line.dataset.s = s
        else delete line.dataset.s
        line.querySelector('.chip')!.textContent = CHIPS[s] ?? ''
      })
      cursor.style.top = lines[b.cur].offsetTop + 'px'
      cursor.style.setProperty(
        '--c',
        b.w === 'dead'
          ? 'var(--red)'
          : act?.t === 'read'
            ? 'var(--cyan)'
            : k === BEATS.length - 1 || landed
              ? 'var(--teal)'
              : 'var(--amber)'
      )

      const shown = b.rows + (act && act.t !== 'read' && landed ? 1 : 0)
      rows.forEach((r, i) => {
        r.classList.toggle('in', i < shown)
        r.classList.toggle('w', !!act && act.t !== 'read' && landed && i === shown - 1 && p < 0.999)
        r.classList.toggle('r', act?.t === 'read' && i === act.row)
      })

      // The dot that travels between the line and its journal entry
      let q = -1
      let from: [number, number] | null = null
      let to: [number, number] | null = null
      let colour = ''
      if (act?.t === 'write') {
        q = (p - 0.5) / 0.4
        from = anchor(lines[act.line], 'r')
        to = anchor(rows[act.row], 'l')
        colour = 'var(--teal)'
      } else if (act?.t === 'read') {
        q = (p - 0.08) / 0.54
        from = anchor(rows[act.row], 'l')
        to = anchor(lines[act.line], 'r')
        colour = 'var(--cyan)'
      }
      // Stacked on a narrow screen, the two cards are not side by side
      const live = q > 0 && q < 1 && !!from && !!to && Math.abs(to[0] - from[0]) > 40
      path.style.opacity = live ? '0.7' : '0'
      dots.forEach((d) => (d.style.opacity = '0'))
      if (live && from && to) {
        const mid = (from[0] + to[0]) / 2
        path.setAttribute('d', `M${from[0]} ${from[1]} C${mid} ${from[1]} ${mid} ${to[1]} ${to[0]} ${to[1]}`)
        path.style.stroke = colour
        const length = path.getTotalLength()
        ;[0, 0.07, 0.14].forEach((lag, i) => {
          const at = path.getPointAtLength(length * ease(clamp(q - lag, 0, 1)))
          dots[i].setAttribute('cx', String(at.x))
          dots[i].setAttribute('cy', String(at.y))
          dots[i].style.fill = colour
          dots[i].style.opacity = String([1, 0.55, 0.28][i])
        })
      }

      charged.textContent = k > 1 || (k === 1 && landed) ? '1' : '0'
      charged.classList.toggle('hit', charged.textContent === '1')
      entries.textContent = String(shown)
      replayed.textContent = String(states.filter((s) => s === 're').length)
      let chapter = ''
      for (let i = 0; i <= k; i++) chapter = BEATS[i].phase ?? chapter
      phase.textContent = chapter
      // Captions are the constants above, never anything a reader supplied
      caption.innerHTML = b.cap
    }

    return startTimeline(root, BEATS, render)
  }, [])

  return (
    <div className="orx not-prose">
      <div className="fig" ref={ref}>
        <div className="stage" data-el="stage">
          <div className="f1">
            <div className="win" data-el="win" data-w="a">
              <div className="bar">
                <span className="dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="who">worker</span>
                <span className="st" data-el="status">
                  running
                </span>
              </div>
              <div className="code">
                <div className="cursor" data-el="cursor" />
                {CODE.map((tokens, i) => (
                  <div className="ln" key={i}>
                    <b>{i + 1}</b>
                    <span style={{ whiteSpace: 'pre' }}>
                      {tokens.map(([className, text], j) => (
                        <span className={className || undefined} key={j}>
                          {text}
                        </span>
                      ))}
                    </span>
                    <i className="chip" />
                  </div>
                ))}
              </div>
              <div className="veil">
                <span>process killed</span>
              </div>
            </div>
            <div />
            <div className="jr">
              <div className="bar">
                <span className="who">journal</span>
                <span className="st" style={{ color: 'var(--fg-3)' }}>
                  postgresql
                </span>
              </div>
              <div className="rows">
                {JOURNAL.map(([kind, subject, result], i) => (
                  <div className="row" key={i}>
                    <b>{String(i + 1).padStart(2, '0')}</b>
                    <span>
                      {kind} <em>{subject}</em>
                      {result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <svg className="wire" aria-hidden="true">
            <path data-el="path" />
            <circle r="4.5" />
            <circle r="3.5" />
            <circle r="2.5" />
          </svg>
          <div className="stats">
            <div className="stat">
              <span className="v" data-el="charged">
                0
              </span>
              <span className="label">times the card was charged</span>
            </div>
            <div className="stat">
              <span className="v" data-el="entries">
                0
              </span>
              <span className="label">journal entries</span>
            </div>
            <div className="stat">
              <span className="v" data-el="replayed">
                0
              </span>
              <span className="label">steps answered from the journal</span>
            </div>
          </div>
        </div>
        <div className="cap" aria-live="polite">
          <span className="ph" data-el="phase" />
          <span className="tx" data-el="caption" />
        </div>
        <div className="tlp">
          <Controls label="Timeline" />
          <div className="tlb">
            <div className="names">
              <span />
              {TASKS.map((task) => (
                <span key={task}>{task}</span>
              ))}
            </div>
            <div className="track wf">
              <div data-el="bars" />
              <div className="knob" />
            </div>
          </div>
          <div className="key">
            <span style={{ '--c': 'var(--teal)' } as CSSProperties}>ran</span>
            <span style={{ '--c': 'var(--cyan)' } as CSSProperties}>answered from the journal</span>
            <span style={{ '--c': 'var(--red)' } as CSSProperties}>interrupted</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RunCrashDiagram
