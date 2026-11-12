import { type Metadata, type ResolvingMetadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

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
  index,
  kicker,
  title,
  description,
  id,
  action,
}: {
  index: string
  kicker: string
  title: string
  description?: string
  id: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8 sm:mb-10">
      <div className="flex flex-col gap-2.5 max-w-xl">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          {index} · {kicker}
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
          className="no-underline text-xs font-mono text-foreground-muted hover:text-foreground transition-colors flex items-center gap-1 shrink-0 pb-1"
        >
          {action.label}
          <ArrowRight size={10} />
        </Link>
      )}
    </div>
  )
}

function ConceptCell({
  num,
  href,
  title,
  description,
}: {
  num: string
  href: string
  title: string
  description: string
}) {
  return (
    <Link href={href} className="no-underline group h-full">
      <div className="h-full bg-background p-6 flex flex-col gap-3 hover:bg-surface-75 transition-colors">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="font-mono text-[10px] text-foreground-muted">{num}</span>
        </div>
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
          <span className="font-mono text-[10px] text-foreground-muted border border-default px-1.5 py-0.5">
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

function IndexRow({ num, href, title }: { num: string; href: string; title: string }) {
  return (
    <Link href={href} className="no-underline group">
      <div className="bg-background px-5 py-3.5 flex items-center gap-4 hover:bg-surface-75 transition-colors">
        <span className="font-mono text-[10px] text-foreground-muted w-5 shrink-0">{num}</span>
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
        className="scroll-mt-24 m-0 mb-4 font-mono text-[10px] uppercase tracking-widest text-foreground-muted font-normal"
      >
        {label}
      </h3>
      <div className="flex flex-col gap-px bg-border-default border border-default">
        {items.map((item, i) => (
          <IndexRow key={item.title} num={String(i + 1).padStart(2, '0')} {...item} />
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
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted group-hover:text-foreground transition-colors flex items-center gap-1.5 pt-1">
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
        className="scroll-mt-24 m-0 mb-2 font-mono text-[10px] uppercase tracking-widest text-foreground-muted font-normal"
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

      {/* ── 01 · Concepts ─────────────────────────────────────────── */}
      <section>
        <div className="max-w-7xl mx-auto px-5 py-14 sm:py-16">
          <SectionIntro
            index="01"
            kicker="Concepts"
            title="The core model"
            description="Six primitives that make workflows durable."
            id="core-concepts"
            action={{ label: 'Overview', href: '/guides/core/understanding' }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border-default border border-default">
            {[
              { title: 'Workflows', href: '/guides/core/workflows', description: 'Define durable functions that survive crashes and restarts. Code-first, no YAML.' },
              { title: 'Tasks', href: '/guides/core/tasks', description: 'Execute side effects with automatic retry, timeout, and idempotency guarantees.' },
              { title: 'Journaling', href: '/guides/core/journaling', description: 'Every step is journaled for deterministic replay and auditability.' },
              { title: 'Events', href: '/guides/core/events', description: 'Send and receive events between workflows for coordination and signaling.' },
              { title: 'State', href: '/guides/core/state-management', description: 'Queryable workflow state with external visibility and persistence.' },
              { title: 'Actors', href: '/guides/core/actors', description: 'Long-lived stateful entities with exclusive and shared operations.' },
            ].map((item, i) => (
              <ConceptCell key={item.title} num={String(i + 1).padStart(2, '0')} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 02 · SDKs ─────────────────────────────────────────────── */}
      <section className="border-t border-default bg-alternative">
        <div className="max-w-7xl mx-auto px-5 py-14 sm:py-16">
          <SectionIntro
            index="02"
            kicker="SDKs"
            title="Your language, first-class"
            description="Native, idiomatic APIs for Rust, Python, and TypeScript."
            id="sdks"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-default border border-default">
            {[
              { title: 'Rust', ext: '.rs', href: '/guides/sdk/rust', install: 'cargo add orcher', description: '#[workflow] and #[task] macros, typed function refs, zero-cost abstractions, compile-time validation.' },
              { title: 'Python', ext: '.py', href: '/guides/sdk/python', install: 'pip install orcher', description: '@workflow and @task decorators, async/await, fluent builder API for services and clients.' },
              { title: 'TypeScript', ext: '.ts', href: '/guides/sdk/typescript', install: 'npm install @orcher/sdk', description: 'Class-based decorators, full type safety, NestJS-style dependency injection.' },
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
            index="03"
            kicker="In practice"
            title="Patterns & use cases"
            description="Battle-tested shapes for real-world systems."
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
            index="04"
            kicker="Learning paths"
            title="Guided journeys for your role"
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
            index="05"
            kicker="Platform"
            title="Run it in production"
            description="Operate, deploy, and observe the orchestrator."
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
              Build your first workflow
              <br />
              in five minutes.
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
              href="https://github.com/orcher-io/quickstart"
              target="_blank"
              rel="noreferrer noopener"
              className="no-underline border border-background/30 text-background px-5 py-2.5 text-sm flex items-center gap-2 hover:border-background transition-colors"
            >
              GitHub
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
