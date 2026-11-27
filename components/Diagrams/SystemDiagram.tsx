import type { ReactNode } from 'react'

/**
 * The whole system on one page: callers, the engine and workers, side by side
 * inside your own infrastructure, with PostgreSQL under the engine. Drawn
 * after the cloud providers' architecture diagrams: boundaries say who runs
 * what, each node is an icon with its label under it, connectors run straight
 * into a boundary, and numbers on them match the list under the picture.
 */

type Point = [number, number]

// Line icons in a 24 by 24 box
const ICONS = {
  app: 'M3 5h18v12H3zM3 9h18M8 21h8M12 17v4',
  cli: 'M3 4h18v16H3zM7 9l3 3-3 3M12 15h5',
  web: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3c-2.5 2.6-3.8 5.6-3.8 9s1.3 6.4 3.8 9',
  engine: 'M12 2l9 5v10l-9 5-9-5V7zM12 7v10M7.5 9.5l9 5M16.5 9.5l-9 5',
  worker: 'M4 4h16v6H4zM4 14h16v6H4zM7 7h.01M7 17h.01M11 7h5M11 17h5',
  db: 'M12 3c5 0 8 1.3 8 3s-3 3-8 3-8-1.3-8-3 3-3 8-3zM4 6v12c0 1.7 3 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3 3 8 3s8-1.3 8-3',
  cloud: 'M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.2 4.5 4.5 0 0 0 7 18z',
}
type Icon = keyof typeof ICONS

// Labels are JetBrains Mono at 11px: 6.6px a character
const CHAR = 6.6

function Zone({ x, y, w, h, name, icon, tone }: { x: number; y: number; w: number; h: number; name: string; icon?: Icon; tone?: 'dash' | 'engine' }) {
  const tab = Math.round(name.length * CHAR + (icon ? 34 : 16))
  return (
    <g className={`zone${tone ? ' ' + tone : ''}`}>
      <rect className="z-edge" x={x} y={y} width={w} height={h} />
      <rect className="z-tab" x={x + 12} y={y - 9} width={tab} height={18} />
      {icon && (
        <g className="z-ic" transform={`translate(${x + 18} ${y - 7}) scale(.58)`}>
          <path d={ICONS[icon]} />
        </g>
      )}
      <text x={x + 12 + (icon ? 26 : 8)} y={y + 4}>
        {name}
      </text>
    </g>
  )
}

function Node({ x, y, icon, title, note, accent }: { x: number; y: number; icon: Icon; title: string; note?: string; accent?: boolean }) {
  return (
    <g className={`node${accent ? ' accent' : ''}`}>
      <rect className="tile" x={x - 22} y={y} width={44} height={44} />
      <g className="ic" transform={`translate(${x - 12} ${y + 10})`}>
        <path d={ICONS[icon]} />
      </g>
      <text className="t" x={x} y={y + 62} textAnchor="middle">
        {title}
      </text>
      {note && (
        <text className="m" x={x} y={y + 77} textAnchor="middle">
          {note}
        </text>
      )}
    </g>
  )
}

function Part({ x, y, w, title }: { x: number; y: number; w: number; title: string }) {
  return (
    <g className="part">
      <rect x={x} y={y} width={w} height={26} />
      <text x={x + w / 2} y={y + 17} textAnchor="middle">
        {title}
      </text>
    </g>
  )
}

function Arrow({ from, to, both }: { from: Point; to: Point; both?: boolean }) {
  const head = (p: Point, q: Point) => {
    const dx = p[0] - q[0]
    const dy = p[1] - q[1]
    const l = Math.hypot(dx, dy) || 1
    const ux = dx / l
    const uy = dy / l
    const bx = p[0] - ux * 6
    const by = p[1] - uy * 6
    return `M${p[0]} ${p[1]} L${bx - uy * 2.6} ${by + ux * 2.6} L${bx + uy * 2.6} ${by - ux * 2.6}z`
  }
  return (
    <g className="arrow">
      <path className="line" d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} />
      <path className="head" d={head(to, from)} />
      {both && <path className="head" d={head(from, to)} />}
    </g>
  )
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  const w = Math.round(text.length * 6.3 + 10)
  return (
    <g className="lab">
      <rect x={Math.round(x - w / 2)} y={y - 11} width={w} height={15} />
      <text x={x} y={y} textAnchor="middle">
        {text}
      </text>
    </g>
  )
}

function Marker({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g className="co">
      <circle cx={x} cy={y} r={8.5} />
      <text x={x} y={y + 3.5} textAnchor="middle">
        {n}
      </text>
    </g>
  )
}

function Sub({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text className="sub" x={x} y={y} textAnchor="middle">
      {children}
    </text>
  )
}

export default function SystemDiagram() {
  // Three columns with an 84px gap between them, so each gap holds its label
  const L = { x: 24, w: 132 }
  const E = { x: 240, w: 280 }
  const R = { x: 604, w: 132 }
  const TOP = 52
  const H = 300
  const cx = L.x + L.w / 2
  const ex = E.x + E.w / 2
  const wx = R.x + R.w / 2
  const gapL = (L.x + L.w + E.x) / 2
  const gapR = (E.x + E.w + R.x) / 2
  const callers = [78, 176, 262]
  const workers = [78, 176]

  return (
    <figure className="orx orxsys not-prose">
      <svg
        viewBox="0 0 760 468"
        role="img"
        aria-label="Your application, the CLI and the dashboard call the engine; workers call in to the engine on a long poll; the engine keeps all state in PostgreSQL. All of it runs in your infrastructure."
      >
        <g transform="translate(.25 .25)">
          <Zone x={8} y={20} w={744} h={440} name="Your infrastructure" icon="cloud" />

          <Zone x={L.x} y={TOP} w={L.w} h={H} name="Callers" tone="dash" />
          <Node x={cx} y={callers[0]} icon="app" title="Your application" note="SDK client" />
          <Node x={cx} y={callers[1]} icon="cli" title="orcher CLI" />
          <Node x={cx} y={callers[2]} icon="web" title="Dashboard" note="in a browser" />

          <Zone x={E.x} y={TOP} w={E.w} h={H} name="Orcher engine" icon="engine" tone="engine" />
          <Node x={ex} y={74} icon="engine" title="Engine" note="gRPC :50051 · HTTP :8080" accent />
          {[
            ['Dispatch', 'Journal'],
            ['Timers', 'Schedules'],
            ['API keys', 'Namespaces'],
          ].map((row, r) =>
            row.map((title, c) => <Part key={title} x={E.x + 16 + c * 128} y={176 + r * 34} w={120} title={title} />)
          )}
          <Sub x={ex} y={300}>
            and background loops: timeouts,
          </Sub>
          <Sub x={ex} y={314}>
            worker liveness, retries, children
          </Sub>

          <Zone x={R.x} y={TOP} w={R.w} h={H} name="Workers" tone="dash" />
          {workers.map((y, i) => (
            <Node key={i} x={wx} y={y} icon="worker" title="Worker" note="workflows, tasks" />
          ))}
          <Sub x={wx} y={290}>
            as many as you run
          </Sub>

          <Node x={ex} y={380} icon="db" title="PostgreSQL" />
          <Sub x={ex} y={455}>
            the only place state lives
          </Sub>

          {callers.map((y) => (
            <Arrow key={y} from={[cx + 24, y + 22]} to={[E.x - 1, y + 22]} />
          ))}
          <Label x={gapL} y={callers[0] + 12} text="gRPC, HTTP" />
          <Marker x={gapL} y={callers[0] + 40} n={1} />

          <Arrow from={[ex, TOP + H + 1]} to={[ex, 379]} both />
          <Label x={ex + 34} y={370} text="SQL" />
          <Marker x={ex - 26} y={366} n={2} />

          {workers.map((y) => (
            <Arrow key={y} from={[wx - 24, y + 22]} to={[E.x + E.w + 1, y + 22]} both />
          ))}
          <Label x={gapR} y={workers[0] + 12} text="long poll" />
          <Marker x={gapR} y={workers[0] + 40} n={3} />
          <Label x={gapR} y={workers[1] + 12} text="result" />
          <Marker x={gapR} y={workers[1] + 40} n={4} />
        </g>
      </svg>
      <ol className="keyed">
        <li>Your application, the CLI or the dashboard calls the engine to start a workflow, send it an event or read its result.</li>
        <li>The engine commits the run to PostgreSQL before it answers. Every change it makes is a transaction there.</li>
        <li>Workers call in and wait on a long poll. The engine hands each one a run or a task when there is one.</li>
        <li>The worker runs your code and reports the result, which the engine records in the journal.</li>
      </ol>
    </figure>
  )
}
