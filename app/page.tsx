import { type Metadata, type ResolvingMetadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, RotateCw, Timer, X } from 'lucide-react'
import { cn } from 'ui'

import HomeLayout from '~/layouts/HomeLayout'
import { StatsBar } from '~/components/HomePageCover'
import { BASE_PATH } from '~/lib/constants'

const generateMetadata = async (_, parent: ResolvingMetadata): Promise<Metadata> => {
  const parentAlternates = (await parent).alternates

  return {
    alternates: {
      canonical: `${BASE_PATH}`,
      ...(parentAlternates && {
        languages: parentAlternates.languages || undefined,
        media: parentAlternates.media || undefined,
        types: parentAlternates.types || undefined,
      }),
    },
  }
}

// ─── Components ──────────────────────────────────────────────────────────────

function SectionIntro({
  kicker,
  title,
  description,
  id,
  action,
}: {
  kicker: string
  title: string
  description?: string
  id: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8 sm:mb-10">
      <div className="flex flex-col gap-2.5 max-w-xl">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-lighter">
          {kicker}
        </span>
        <h2
          id={id}
          className="scroll-mt-24 m-0 text-2xl sm:text-[28px] font-heading font-bold tracking-tight text-foreground leading-tight"
        >
          {title}
        </h2>
        {description && <p className="m-0 text-sm text-foreground-light">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="no-underline text-xs font-mono text-foreground-lighter hover:text-foreground transition-colors flex items-center gap-1 shrink-0 pb-1"
        >
          {action.label}
          <ArrowRight size={10} />
        </Link>
      )}
    </div>
  )
}

function ConceptCell({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link href={href} className="no-underline group h-full">
      <div className="h-full bg-background p-6 flex flex-col gap-3 hover:bg-surface-75 transition-colors">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <p className="m-0 text-xs text-foreground-light leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}

function SdkCard({
  href,
  title,
  ext,
  description,
  install,
}: {
  href: string
  title: string
  ext: string
  description: string
  install: string
}) {
  return (
    <Link href={href} className="no-underline group h-full">
      <div className="h-full bg-background p-6 flex flex-col gap-4 hover:bg-surface-75 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="font-mono text-[10px] text-foreground-lighter border border-default px-1.5 py-0.5">
            {ext}
          </span>
        </div>
        <p className="m-0 text-xs text-foreground-light leading-relaxed flex-1">{description}</p>
        <div className="flex items-center justify-between gap-3 border-t border-default pt-4">
          <code className="font-mono text-[11px] text-foreground-light">
            <span className="text-foreground-muted">$ </span>
            {install}
          </code>
          <ArrowRight
            size={12}
            className="text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          />
        </div>
      </div>
    </Link>
  )
}

function IndexRow({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} className="no-underline group">
      <div className="bg-background px-5 py-3.5 flex items-center gap-4 hover:bg-surface-75 transition-colors">
        <span className="text-sm text-foreground-light group-hover:text-foreground transition-colors">
          {title}
        </span>
        <ArrowRight
          size={12}
          className="ml-auto text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        />
      </div>
    </Link>
  )
}

function IndexList({
  label,
  id,
  items,
}: {
  label: string
  id: string
  items: { title: string; href: string }[]
}) {
  return (
    <div>
      <h3
        id={id}
        className="scroll-mt-24 m-0 mb-4 font-mono text-[10px] uppercase tracking-widest text-foreground-lighter font-normal"
      >
        {label}
      </h3>
      <div className="flex flex-col gap-px bg-border-default border border-default">
        {items.map((item) => (
          <IndexRow key={item.title} {...item} />
        ))}
      </div>
    </div>
  )
}

function PathCard({
  href,
  title,
  description,
  tag,
}: {
  href: string
  title: string
  description: string
  tag: string
}) {
  return (
    <Link href={href} className="no-underline group h-full">
      <div className="h-full bg-background p-6 flex flex-col gap-3 hover:bg-surface-75 transition-colors">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <p className="m-0 text-xs text-foreground-light leading-relaxed flex-1">{description}</p>
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-lighter group-hover:text-foreground transition-colors flex items-center gap-1.5 pt-1">
          {tag}
          <ArrowRight size={10} />
        </span>
      </div>
    </Link>
  )
}

function PlatformColumn({
  label,
  id,
  links,
}: {
  label: string
  id: string
  links: { title: string; href: string }[]
}) {
  return (
    <div>
      <h3
        id={id}
        className="scroll-mt-24 m-0 mb-2 font-mono text-[10px] uppercase tracking-widest text-foreground-lighter font-normal"
      >
        {label}
      </h3>
      <ul className="m-0 p-0 list-none flex flex-col">
        {links.map((link) => (
          <li key={link.title} className="border-b border-default">
            <Link
              href={link.href}
              className="no-underline group flex items-center justify-between gap-3 py-3"
            >
              <span className="text-sm text-foreground-light group-hover:text-foreground transition-colors">
                {link.title}
              </span>
              <ArrowRight
                size={12}
                className="text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const RUN_STEPS: { title: string; body: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Your workflow calls a task',
    body: 'order runs charge. A workflow is an ordinary async function; tasks are where its side effects go.',
    links: [
      { label: 'Workflows', href: '/guides/core/workflows' },
      { label: 'Tasks', href: '/guides/core/tasks' },
    ],
  },
  {
    title: 'The engine journals the result',
    body: 'When charge returns, its result is recorded in PostgreSQL before the workflow moves on.',
    links: [{ label: 'Journaling', href: '/guides/core/journaling' }],
  },
  {
    title: 'The worker dies',
    body: 'A deploy or a crash during the ten-second timer loses nothing: the engine keeps the timer, not the worker.',
    links: [],
  },
  {
    title: 'Another worker resumes the run',
    body: 'It replays the journal, reuses the recorded charge result without running the task again, and continues at ship.',
    links: [],
  },
]

const JOURNAL_ROWS: { icon: typeof Check; step: string; note: string; tone?: 'lost' | 'done' }[] = [
  { icon: Check, step: 'charge', note: 'recorded · "charged 1042"' },
  { icon: Timer, step: 'timer 10s', note: 'started' },
  { icon: X, step: 'worker lost', note: 'nothing to redo', tone: 'lost' },
  { icon: RotateCw, step: 'replay', note: 'charge reused, not run again' },
  { icon: Check, step: 'ship', note: 'recorded · "shipped 1042"' },
  { icon: Check, step: 'completed', note: '"charged 1042, then shipped 1042"', tone: 'done' },
]

/** The run's journal, as the steps beside it describe it. An illustration, not a screenshot. */
function JournalView() {
  return (
    <figure className="m-0 border border-default bg-background">
      <figcaption className="flex items-center justify-between gap-3 border-b border-default bg-surface-75 px-5 py-2.5 font-mono text-xs">
        <span className="text-foreground">order-1042</span>
        <span className="text-foreground-lighter">journal</span>
      </figcaption>
      <ul className="m-0 p-0 list-none">
        {JOURNAL_ROWS.map(({ icon: Icon, step, note, tone }, i) => (
          <li
            key={step}
            className={cn(
              'flex items-start sm:items-center gap-3 px-5 py-3 font-mono text-xs',
              i > 0 && 'border-t border-default',
              tone === 'lost' && 'bg-surface-75'
            )}
          >
            <Icon
              size={13}
              strokeWidth={1.75}
              className={cn(
                'shrink-0 mt-0.5 sm:mt-0',
                tone === 'lost' ? 'text-destructive' : tone === 'done' ? 'text-brand' : 'text-foreground-light'
              )}
            />
            <span className={cn('w-24 shrink-0', tone === 'lost' ? 'text-destructive' : 'text-foreground')}>
              {step}
            </span>
            <span className="min-w-0 text-foreground-lighter sm:truncate">{note}</span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

const HomePage = () => (
  <HomeLayout>
    <div className="flex flex-col not-prose">
      {/* ── Stats strip ───────────────────────────────────────────── */}
      <section className="border-y border-default bg-alternative">
        <div className="max-w-7xl mx-auto px-5">
          <StatsBar />
        </div>
      </section>

      {/* ── How a run survives a crash ────────────────────────────── */}
      <section>
        <div className="max-w-7xl mx-auto px-5 py-14 sm:py-16">
          <SectionIntro
            kicker="How it works"
            title="How a run survives a crash"
            description="The order workflow above, when its worker dies halfway through."
            id="core-concepts"
            action={{ label: 'Try it in the quickstart', href: '/guides/getting-started/quickstart' }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <ol className="m-0 p-0 list-none flex flex-col gap-7">
              {RUN_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-default font-mono text-[11px] text-foreground-light">
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-foreground">{step.title}</span>
                    <p className="m-0 text-sm text-foreground-light leading-relaxed">{step.body}</p>
                    {step.links.length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                        {step.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="no-underline font-mono text-xs text-foreground-lighter hover:text-foreground transition-colors flex items-center gap-1"
                          >
                            {link.label}
                            <ArrowRight size={10} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <JournalView />
          </div>

          <h3 className="m-0 mt-14 mb-4 font-mono text-[10px] uppercase tracking-widest text-foreground-lighter font-normal">
            Also in the model
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-default border border-default">
            {[
              { title: 'Events', href: '/guides/core/events', description: 'Send data to a running workflow, or have it wait for some, with or without a timeout.' },
              { title: 'State', href: '/guides/core/state-management', description: 'What a workflow keeps as it runs, and how callers read it from outside.' },
              { title: 'Actors', href: '/guides/core/actors', description: 'Long-lived entities with their own state, exclusive and shared operations.' },
            ].map((item) => (
              <ConceptCell key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 02 · SDKs ─────────────────────────────────────────────── */}
      <section className="border-t border-default bg-alternative">
        <div className="max-w-7xl mx-auto px-5 py-14 sm:py-16">
          <SectionIntro
            kicker="SDKs"
            title="Your language, first-class"
            description="Native, idiomatic APIs for Rust, Python, and TypeScript."
            id="sdks"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-default border border-default">
            {[
              { title: 'Rust', ext: '.rs', href: '/guides/sdk/rust', install: 'cargo add orcher-sdk', description: '#[workflow] and #[task] macros, typed task references, and registration at startup with no manual wiring.' },
              { title: 'Python', ext: '.py', href: '/guides/sdk/python', install: 'pip install orcher-sdk', description: '@workflow and @task decorators on plain async functions, a worker builder and a typed client.' },
              { title: 'TypeScript', ext: '.ts', href: '/guides/sdk/typescript', install: 'npm install @orcher/sdk', description: 'Functional or decorator-based definitions, typed task references, and dependency injection for tasks.' },
            ].map((sdk) => (
              <SdkCard key={sdk.title} {...sdk} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 · Patterns & use cases ─────────────────────────────── */}
      <section className="border-t border-default">
        <div className="max-w-7xl mx-auto px-5 py-14 sm:py-16">
          <SectionIntro
            kicker="In practice"
            title="Patterns & use cases"
            description="Common workflow shapes, and the systems they are used in."
            id="patterns"
            action={{ label: 'All patterns', href: '/guides/patterns' }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <IndexList
              label="Workflow patterns"
              id="workflow-patterns"
              items={[
                { title: 'Saga & Compensation', href: '/guides/patterns/saga' },
                { title: 'Fan-Out / Fan-In', href: '/guides/patterns/fan-out-fan-in' },
                { title: 'Parent-Child Workflows', href: '/guides/patterns/parent-child' },
                { title: 'Long-Running Processes', href: '/guides/patterns/long-running' },
                { title: 'Error & Retry Handling', href: '/guides/core/error-handling' },
              ]}
            />
            <IndexList
              label="Use cases"
              id="use-cases"
              items={[
                { title: 'Financial Workflows', href: '/guides/use-cases/financial-workflows' },
                { title: 'Data Processing & ETL', href: '/guides/use-cases/data-processing' },
                { title: 'Event-Driven Systems', href: '/guides/use-cases/event-driven' },
                { title: 'Background Tasks', href: '/guides/use-cases/background-tasks' },
                { title: 'Distributed Systems', href: '/guides/use-cases/distributed-systems' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── 04 · Learning paths ───────────────────────────────────── */}
      <section className="border-t border-default bg-alternative">
        <div className="max-w-7xl mx-auto px-5 py-14 sm:py-16">
          <SectionIntro
            kicker="Learning paths"
            title="Guides for your role"
            id="learning-paths"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-default border border-default">
            {[
              { title: 'Backend Engineers', href: '/guides/learning/backend-engineers', description: 'Core concepts, building patterns, distributed systems, and production readiness.', tag: '5 guides' },
              { title: 'Data Engineers', href: '/guides/learning/data-engineers', description: 'ETL pipelines, batch processing, parallel execution, and production data workflows.', tag: '5 guides' },
              { title: 'Platform Engineers', href: '/guides/learning/platform-engineers', description: 'Deploying, operating, scaling, and monitoring the Orcher platform.', tag: '5 guides' },
            ].map((path) => (
              <PathCard key={path.title} {...path} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 · Platform ─────────────────────────────────────────── */}
      <section className="border-t border-default">
        <div className="max-w-7xl mx-auto px-5 py-14 sm:py-16">
          <SectionIntro
            kicker="Platform"
            title="Run and operate"
            description="Deploy, configure and observe the engine."
            id="operations"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <PlatformColumn
              label="Operations & API"
              id="operations-api"
              links={[
                { title: 'Orchestrator', href: '/guides/operations/orchestrator' },
                { title: 'Storage & Caching', href: '/guides/operations/storage' },
                { title: 'Queue System', href: '/guides/operations/queue' },
                { title: 'REST API', href: '/guides/api' },
              ]}
            />
            <PlatformColumn
              label="Deployment"
              id="deployment"
              links={[
                { title: 'Docker', href: '/guides/deployment/docker' },
                { title: 'Kubernetes', href: '/guides/deployment/kubernetes' },
                { title: 'Configuration', href: '/guides/deployment/configuration' },
                { title: 'Cloud Providers', href: '/guides/deployment/cloud' },
              ]}
            />
            <PlatformColumn
              label="Observability"
              id="observability"
              links={[
                { title: 'Metrics & Prometheus', href: '/guides/observability/metrics' },
                { title: 'Distributed Tracing', href: '/guides/observability/tracing' },
                { title: 'Structured Logging', href: '/guides/observability/logging' },
                { title: 'Debugging', href: '/guides/observability/debugging' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────── */}
      <section className="bg-foreground">
        <div className="max-w-7xl mx-auto px-5 py-16 sm:py-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-background/60">
              Get started
            </span>
            <h2 className="m-0 text-2xl sm:text-3xl font-heading font-bold tracking-tight text-background leading-tight">
              Run your first workflow,
              <br />
              then kill it and watch it resume.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/guides/getting-started/quickstart"
              className="no-underline bg-background text-foreground px-5 py-2.5 text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight size={13} />
            </Link>
            <a
              href="https://github.com/orcher-io/orcher"
              target="_blank"
              rel="noreferrer noopener"
              className="no-underline border border-background/30 text-background px-5 py-2.5 text-sm flex items-center gap-2 hover:border-background transition-colors"
            >
              Engine on GitHub
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </section>
    </div>
  </HomeLayout>
)

export default HomePage
export { generateMetadata }
