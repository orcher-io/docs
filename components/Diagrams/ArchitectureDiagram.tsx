'use client'

import { useState } from 'react'

/**
 * The parts of a deployment and how they connect. The engine is opened up;
 * the application, the workers and the database are one box each. Pointing at
 * a part, or tabbing to it, lights up what it talks to and says what it does.
 */

type Wire = 'in' | 'poll' | 'sql'

interface Part {
  title: string
  /** A short note under the title, in the box */
  note?: string
  /** One sentence, shown underneath while the part is pointed at */
  detail: string
  /** The other parts it works with */
  uses: string[]
  /** The connections it travels over */
  wires: Wire[]
}

const PARTS: Record<string, Part> = {
  client: {
    title: 'Your application',
    note: 'starts workflows, sends events, reads results',
    detail:
      'Starts workflows, sends them events and reads their results. The CLI and the dashboard are callers too.',
    uses: ['grpc', 'rest', 'auth'],
    wires: ['in'],
  },
  worker: {
    title: 'Your workflows and tasks',
    note: 'as many processes as you run',
    detail:
      'Your processes, running your workflows and tasks on an Orcher SDK. They call in to the engine and wait for work; the engine never calls them.',
    uses: ['grpc', 'dispatch', 'tw', 'wl'],
    wires: ['poll'],
  },
  pg: {
    title: 'PostgreSQL',
    note: 'the only place state lives',
    detail:
      'Holds every run, journal entry, task, timer and schedule. The engine can be stopped or replaced at any time, because nothing is kept anywhere else.',
    uses: ['dispatch', 'journal', 'timers', 'sched'],
    wires: ['sql'],
  },
  grpc: {
    title: 'gRPC API',
    note: 'workers and clients',
    detail:
      'The port workers and applications talk to. Workers hold long polls open here and are answered when there is work.',
    uses: ['client', 'worker', 'auth', 'dispatch'],
    wires: ['in', 'poll'],
  },
  rest: {
    title: 'REST API',
    note: '/api/v1',
    detail: 'What the dashboard and the CLI read: runs, journals, schedules, workers and namespaces.',
    uses: ['client', 'auth'],
    wires: ['in'],
  },
  ui: {
    title: 'Dashboard files',
    note: '/',
    detail: 'The engine serves the dashboard itself, so there is nothing else to deploy.',
    uses: ['rest'],
    wires: ['in'],
  },
  ops: {
    title: 'Health and metrics',
    note: '/health · /metrics',
    detail: 'Readiness and liveness probes, and Prometheus metrics.',
    uses: [],
    wires: [],
  },
  auth: {
    title: 'API keys',
    detail: 'When authentication is on, every gRPC and REST call carries a key.',
    uses: ['grpc', 'rest', 'ns'],
    wires: [],
  },
  ns: {
    title: 'Namespaces',
    detail: 'Separate sets of runs, queues and workers inside one engine.',
    uses: ['auth'],
    wires: [],
  },
  dispatch: {
    title: 'Dispatch',
    note: 'work to polling workers',
    detail: 'Matches a run or a task to a worker that is polling its task queue.',
    uses: ['grpc', 'worker', 'pg'],
    wires: ['poll', 'sql'],
  },
  journal: {
    title: 'Journal',
    note: 'one entry per step',
    detail: 'Appends each step and its result. A result and its entry are committed in one transaction.',
    uses: ['pg', 'dispatch'],
    wires: ['sql'],
  },
  timers: {
    title: 'Timers',
    note: 'sleeps and deadlines',
    detail: 'Kept in the database, so a timer fires whether or not a worker is running.',
    uses: ['pg'],
    wires: ['sql'],
  },
  sched: {
    title: 'Schedules',
    note: 'runs at set times',
    detail: 'Start a workflow at set times.',
    uses: ['pg', 'dispatch'],
    wires: ['sql'],
  },
  tw: {
    title: 'Timeout watcher',
    detail:
      'Times out a task that waited too long to start, ran too long, or whose worker stopped sending heartbeats, so that it can be tried again.',
    uses: ['worker', 'dispatch', 'pg'],
    wires: ['sql'],
  },
  wl: {
    title: 'Worker liveness',
    detail: 'Notices a worker process that has stopped polling, and offers the work it held to other workers.',
    uses: ['worker', 'dispatch', 'pg'],
    wires: ['sql'],
  },
  wr: {
    title: 'Workflow retry',
    detail: 'Starts a failed workflow again when it was given a retry policy.',
    uses: ['dispatch', 'pg'],
    wires: ['sql'],
  },
  cr: {
    title: 'Child reconciler',
    detail: "Reports each child workflow's ending to its parent, and applies the parent's close policy.",
    uses: ['pg'],
    wires: ['sql'],
  },
}

const ENGINE: [group: string, parts: string[]][] = [
  ['Front door', ['grpc', 'rest', 'ui', 'ops']],
  ['Access', ['auth', 'ns']],
  ['Core', ['dispatch', 'journal', 'timers', 'sched']],
  ['Background loops', ['tw', 'wl', 'wr', 'cr']],
]

function ArchitectureDiagram() {
  const [focus, setFocus] = useState<string | null>(null)
  const current = focus ? PARTS[focus] : null
  const lit = (key: string) => !!current && (key === focus || current.uses.includes(key))
  const wire = (key: Wire) => (current?.wires.includes(key) ? ' hot' : '')

  const part = (key: string, role?: string) => {
    const p = PARTS[key]
    return (
      <button
        type="button"
        key={key}
        className={'pt' + (role ? ' node' : '') + (lit(key) ? ' hot' : '')}
        onMouseEnter={() => setFocus(key)}
        onMouseLeave={() => setFocus(null)}
        onFocus={() => setFocus(key)}
        onBlur={() => setFocus(null)}
      >
        {role && <span className="who">{role}</span>}
        <span>{p.title}</span>
        {p.note && <small>{p.note}</small>}
      </button>
    )
  }

  return (
    <div className="orx not-prose">
      <div className="fig">
        <div className="stage">
          <div className={'arch' + (current ? ' focus' : '')}>
            <div className="pair">
              {part('client', 'caller')}
              <div className="stack">{part('worker', 'workers')}</div>
            </div>
            <div className="pair">
              <div className={'vc' + wire('in')}>
                <i />
                <span>gRPC or HTTP</span>
              </div>
              <div className={'vc' + wire('poll')}>
                <i />
                <span>gRPC long poll · workers call in</span>
              </div>
            </div>
            <div className="col engine">
              <div className="card big">
                <div className="bar">
                  <span className="who">orcher engine · one process</span>
                  <span className="ports">
                    <b>:50051</b> gRPC <b>:8080</b> HTTP
                  </span>
                </div>
                {ENGINE.map(([group, keys]) => (
                  <div className="grp" key={group}>
                    <span className="label">{group}</span>
                    <div className="pts two">{keys.map((key) => part(key))}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="one">
              <div className={'vc' + wire('sql')}>
                <i />
                <span>SQL · every change in a transaction</span>
              </div>
            </div>
            <div className="one">{part('pg', 'database')}</div>
          </div>
        </div>
        <div className="cap detail" aria-live="polite">
          <span className="ph">{current ? current.title : 'Detail'}</span>
          <span className="tx">
            {current ? current.detail : 'Point at any part to see what it does and what it talks to.'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ArchitectureDiagram
