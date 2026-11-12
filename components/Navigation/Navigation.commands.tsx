import { ArrowRight } from 'lucide-react'

import type { ICommand } from 'ui-patterns/CommandMenu'
import { useRegisterCommands } from 'ui-patterns/CommandMenu'

const navCommands = [
  {
    id: 'nav-getting-started',
    name: 'Go to Getting Started',
    route: '/guides/getting-started',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-core',
    name: 'Go to Core Features',
    route: '/guides/core',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-workflows',
    name: 'Go to Workflows',
    route: '/guides/core/workflows',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-tasks',
    name: 'Go to Tasks',
    route: '/guides/core/tasks',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-patterns',
    name: 'Go to Patterns',
    route: '/guides/patterns',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-saga',
    name: 'Go to Saga & Compensation',
    route: '/guides/patterns/saga',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-parent-child',
    name: 'Go to Parent-Child Orchestration',
    route: '/guides/patterns/parent-child',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-sdk',
    name: 'Go to SDK Documentation',
    route: '/guides/sdk',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-rust-sdk',
    name: 'Go to Rust SDK',
    value: 'Reference, API, SDK: Go to Rust SDK',
    route: '/guides/sdk/rust',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-typescript-sdk',
    name: 'Go to TypeScript SDK',
    value: 'Reference, API, SDK: Go to TypeScript SDK',
    route: '/guides/sdk/typescript',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-operations',
    name: 'Go to Operations',
    route: '/guides/operations',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-orchestrator',
    name: 'Go to Orchestrator Server',
    route: '/guides/operations/orchestrator',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-workers',
    name: 'Go to Worker Management',
    route: '/guides/operations/workers',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-observability',
    name: 'Go to Observability',
    route: '/guides/observability',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-metrics',
    name: 'Go to Metrics & Monitoring',
    route: '/guides/observability/metrics',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-local-dev',
    name: 'Go to Local Development',
    route: '/guides/local-development',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-use-cases',
    name: 'Go to Use Cases',
    route: '/guides/use-cases',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-learning',
    name: 'Go to Learning Paths',
    route: '/guides/learning',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-api',
    name: 'Go to REST API',
    value: 'Reference, API: Go to REST API',
    route: '/guides/api',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-cli',
    name: 'Go to CLI Reference',
    value: 'Reference, CLI: Go to Command-Line Interface',
    route: '/guides/sdk/cli',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-security',
    name: 'Go to Security',
    route: '/guides/security',
    icon: () => <ArrowRight />,
  },
  {
    id: 'nav-integrations',
    name: 'Go to Integrations',
    route: '/guides/integrations',
    icon: () => <ArrowRight />,
  },
] satisfies Array<ICommand>

const useDocsNavCommands = () => {
  useRegisterCommands('Go to', navCommands)
}

export { useDocsNavCommands }
