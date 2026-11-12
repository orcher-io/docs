import type { GlobalMenuItems, NavMenuConstant } from '../Navigation.types'
import { publishedGlobalMenu, publishedMenu } from './published'

const all_GLOBAL_MENU_ITEMS: GlobalMenuItems = [
  [
    {
      label: 'Getting Started',
      icon: 'getting-started',
      href: '/guides/getting-started',
      level: 'gettingstarted',
    },
  ],
  [
    {
      label: 'Guides',
      menuItems: [
        [
          { label: 'Core Features' },
          {
            label: 'Guides Overview',
            icon: 'getting-started',
            href: '/guides' as `/${string}`,
            level: 'guides',
          },
          {
            label: 'Understanding Orcher',
            icon: 'getting-started',
            href: '/guides/core/understanding' as `/${string}`,
            level: 'core',
          },
          {
            label: 'Building Workflows',
            icon: 'edge-functions',
            href: '/guides/core/workflows' as `/${string}`,
            level: 'core',
          },
          {
            label: 'Defining Tasks',
            icon: 'functions',
            href: '/guides/core/tasks' as `/${string}`,
            level: 'core',
          },
          {
            label: 'Automatic Journaling',
            icon: 'database',
            href: '/guides/core/journaling' as `/${string}`,
            level: 'core',
          },
          {
            label: 'Managing State',
            icon: 'storage',
            href: '/guides/core/state-management' as `/${string}`,
            level: 'core',
          },
          {
            label: 'Handling Events',
            icon: 'realtime',
            href: '/guides/core/events' as `/${string}`,
            level: 'core',
          },
          {
            label: 'Dealing with Errors',
            icon: 'troubleshooting',
            href: '/guides/core/error-handling' as `/${string}`,
            level: 'core',
          },
        ],
        [
          { label: 'Developer Patterns' },
          {
            label: 'Patterns Overview',
            icon: 'edge-functions',
            href: '/guides/patterns' as `/${string}`,
            level: 'guides',
          },
          {
            label: 'Parent-Child Orchestration',
            icon: 'edge-functions',
            href: '/guides/patterns/parent-child' as `/${string}`,
            level: 'guides',
          },
          {
            label: 'Saga & Compensation',
            icon: 'troubleshooting',
            href: '/guides/patterns/saga' as `/${string}`,
            level: 'guides',
          },
          {
            label: 'Fan-Out/Fan-In',
            icon: 'queues',
            href: '/guides/patterns/fan-out-fan-in' as `/${string}`,
            level: 'guides',
          },
          {
            label: 'Long-Running Processes',
            icon: 'cron',
            href: '/guides/patterns/long-running' as `/${string}`,
            level: 'guides',
          },
        ],

        [
          { label: 'Learning Paths' },
          {
            label: 'Data Engineers',
            icon: 'database',
            href: '/guides/learning/data-engineers' as `/${string}`,
            level: 'guides',
          },
          {
            label: 'Backend Engineers',
            icon: 'edge-functions',
            href: '/guides/learning/backend-engineers' as `/${string}`,
            level: 'guides',
          },
          {
            label: 'Platform Engineers',
            icon: 'platform',
            href: '/guides/learning/platform-engineers' as `/${string}`,
            level: 'guides',
          },
        ],

      ],
    },
  ],
  [
    {
      label: 'Reference',
      menuItems: [
        [
          { label: 'SDK Documentation' },
          {
            label: 'SDK Overview',
            icon: 'reference-javascript',
            href: '/guides/sdk' as `/${string}`,
            level: 'guides',
          },
          {
            label: 'Rust SDK',
            icon: 'reference-javascript',
            href: '/guides/sdk/rust' as `/${string}`,
            level: 'guides',
          },
          {
            label: 'TypeScript SDK',
            icon: 'reference-javascript',
            href: '/guides/sdk/typescript' as `/${string}`,
            level: 'reference_typescript',
            },
          {
            label: 'Python SDK',
            icon: 'reference-python',
            href: '/guides/sdk/python' as `/${string}`,
            level: 'guides',
            },
        ],
        [
          { label: 'API & CLI' },
          {
            label: 'REST API',
            icon: 'rest',
            href: '/guides/api' as `/${string}`,
            level: 'api',
          },
          {
            label: 'Command-Line Interface',
            icon: 'reference-cli',
            href: '/guides/sdk/cli' as `/${string}`,
            level: 'cli',
          },
          {
            label: 'Configuration Reference',
            icon: 'telemetry',
            href: '/guides/deployment/configuration' as `/${string}`,
            level: 'deployment',
          },
        ],
      ],
    },
  ],
  [
    {
      label: 'Operations',
      menuItems: [
        [
          { label: 'Running Orcher' },
          {
            label: 'Orchestrator Server',
            icon: 'platform',
            href: '/guides/operations/orchestrator' as `/${string}`,
            level: 'operations',
          },
          {
            label: 'Worker Management',
            icon: 'edge-functions',
            href: '/guides/operations/workers' as `/${string}`,
            level: 'operations',
          },
          {
            label: 'Queue Configuration',
            icon: 'queues',
            href: '/guides/operations/queue' as `/${string}`,
            level: 'operations',
          },
          {
            label: 'Storage Setup',
            icon: 'storage',
            href: '/guides/operations/storage' as `/${string}`,
            level: 'operations',
          },
        ],
        [
          { label: 'Observability' },
          {
            label: 'Metrics & Monitoring',
            icon: 'telemetry',
            href: '/guides/observability/metrics' as `/${string}`,
            level: 'observability',
          },
          {
            label: 'Logging',
            icon: 'troubleshooting',
            href: '/guides/observability/logging' as `/${string}`,
            level: 'observability',
          },
          {
            label: 'Tracing',
            icon: 'telemetry',
            href: '/guides/observability/tracing' as `/${string}`,
            level: 'observability',
          },
          {
            label: 'Debugging Workflows',
            icon: 'troubleshooting',
            href: '/guides/observability/debugging' as `/${string}`,
            level: 'observability',
          },
        ],
        [
          { label: 'Production Deployment' },
          {
            label: 'Docker Containers',
            icon: 'self-hosting',
            href: '/guides/deployment/docker' as `/${string}`,
            level: 'deployment',
          },
          {
            label: 'Kubernetes Clusters',
            icon: 'platform',
            href: '/guides/deployment/kubernetes' as `/${string}`,
            level: 'deployment',
          },
          {
            label: 'Cloud Platforms',
            icon: 'integrations',
            href: '/guides/deployment/cloud' as `/${string}`,
            level: 'deployment',
          },
          {
            label: 'Configuration Guide',
            icon: 'telemetry',
            href: '/guides/deployment/configuration' as `/${string}`,
            level: 'deployment',
          },
        ],
      ],
    },
  ],
]

const all_gettingstarted: NavMenuConstant = {
  icon: 'getting-started',
  title: 'Getting Started',
  url: '/guides/getting-started',
  items: [
    { name: 'Overview', url: '/guides/getting-started' },
    { name: 'Features', url: '/guides/getting-started/features' },
    { name: 'Architecture', url: '/guides/getting-started/architecture' },
    { name: 'Quickstart', url: '/guides/getting-started/quickstart' },
    {
      name: 'Use Cases',
      items: [
        {
          name: 'Data Pipelines & ETL',
          url: '/guides/use-cases/data-processing',
          items: [
            { name: 'Overview', url: '/guides/use-cases/data-processing' },
            { name: 'Batch Processing', url: '/guides/use-cases/data-processing/batch-processing' },
            { name: 'Parallel ETL', url: '/guides/use-cases/data-processing/parallel-etl' },
            { name: 'Scheduled Sync', url: '/guides/use-cases/data-processing/scheduled-sync' },
            { name: 'Data Validation', url: '/guides/use-cases/data-processing/data-validation' },
            { name: 'Best Practices', url: '/guides/use-cases/data-processing/best-practices' },
          ],
        },
        {
          name: 'Payment Workflows',
          url: '/guides/use-cases/financial-workflows',
          items: [
            { name: 'Overview', url: '/guides/use-cases/financial-workflows' },
            { name: 'Payment Processing', url: '/guides/use-cases/financial-workflows/payment-processing' },
            { name: 'Subscription Billing', url: '/guides/use-cases/financial-workflows/subscription-billing' },
            { name: 'Fraud Detection', url: '/guides/use-cases/financial-workflows/fraud-detection' },
            { name: 'Refund Processing', url: '/guides/use-cases/financial-workflows/refund-processing' },
            { name: 'Best Practices', url: '/guides/use-cases/financial-workflows/best-practices' },
          ],
        },
        {
          name: 'Service Orchestration',
          url: '/guides/use-cases/distributed-systems',
          items: [
            { name: 'Overview', url: '/guides/use-cases/distributed-systems' },
            { name: 'Child Workflows', url: '/guides/use-cases/distributed-systems/child-workflows' },
            { name: 'Saga Pattern', url: '/guides/use-cases/distributed-systems/saga-pattern' },
            { name: 'Event Gates', url: '/guides/use-cases/distributed-systems/event-gates' },
            { name: 'Multi-Service', url: '/guides/use-cases/distributed-systems/multi-service-deployment' },
            { name: 'Best Practices', url: '/guides/use-cases/distributed-systems/best-practices' },
          ],
        },
        {
          name: 'Background Jobs',
          url: '/guides/use-cases/background-tasks',
          items: [
            { name: 'Overview', url: '/guides/use-cases/background-tasks' },
            { name: 'Email Campaigns', url: '/guides/use-cases/background-tasks/email-campaigns' },
            { name: 'Scheduled Jobs', url: '/guides/use-cases/background-tasks/scheduled-jobs' },
            { name: 'Retry with Backoff', url: '/guides/use-cases/background-tasks/retry-backoff' },
            { name: 'Content Processing', url: '/guides/use-cases/background-tasks/content-processing' },
            { name: 'Best Practices', url: '/guides/use-cases/background-tasks/best-practices' },
          ],
        },
        {
          name: 'Event Processing & Actors',
          url: '/guides/use-cases/event-driven',
          items: [
            { name: 'Overview', url: '/guides/use-cases/event-driven' },
            { name: 'Order Processing', url: '/guides/use-cases/event-driven/order-processing' },
            { name: 'Stateful Actors', url: '/guides/use-cases/event-driven/stateful-actors' },
            { name: 'Stream Aggregation', url: '/guides/use-cases/event-driven/stream-aggregation' },
            { name: 'Pattern Detection', url: '/guides/use-cases/event-driven/pattern-detection' },
            { name: 'Best Practices', url: '/guides/use-cases/event-driven/best-practices' },
          ],
        },
      ],
    },
    {
      name: 'Learning Paths',
      items: [
        {
          name: 'For Data Engineers',
          url: '/guides/learning/data-engineers',
          items: [
            { name: 'Overview', url: '/guides/learning/data-engineers' },
            { name: 'ETL Pipelines', url: '/guides/learning/data-engineers/etl-pipelines' },
            { name: 'Batch Processing', url: '/guides/learning/data-engineers/batch-processing' },
            { name: 'Parallel Processing', url: '/guides/learning/data-engineers/parallel-processing' },
            { name: 'Production', url: '/guides/learning/data-engineers/production' },
          ],
        },
        {
          name: 'For Backend Engineers',
          url: '/guides/learning/backend-engineers',
          items: [
            { name: 'Overview', url: '/guides/learning/backend-engineers' },
            { name: 'Core Concepts', url: '/guides/learning/backend-engineers/core-concepts' },
            { name: 'Building Patterns', url: '/guides/learning/backend-engineers/building-patterns' },
            { name: 'Distributed Systems', url: '/guides/learning/backend-engineers/distributed-systems' },
            { name: 'Production', url: '/guides/learning/backend-engineers/production' },
          ],
        },
        {
          name: 'For Platform Engineers',
          url: '/guides/learning/platform-engineers',
          items: [
            { name: 'Overview', url: '/guides/learning/platform-engineers' },
            { name: 'Understanding', url: '/guides/learning/platform-engineers/understanding' },
            { name: 'Deploying', url: '/guides/learning/platform-engineers/deploying' },
            { name: 'Scaling', url: '/guides/learning/platform-engineers/scaling' },
            { name: 'Operating', url: '/guides/learning/platform-engineers/operating' },
          ],
        },
      ],
    },
  ],
}

const all_developerGuides: NavMenuConstant = {
  icon: 'edge-functions',
  title: 'Guides',
  url: '/guides',
  items: [
    { name: 'Overview', url: '/guides' },
    { name: 'Glossary', url: '/guides/resources/glossary' },
    {
      name: 'Core Features',
      items: [
        { name: 'Understanding Orcher', url: '/guides/core/understanding' },
        {
          name: 'Building Workflows',
          url: '/guides/core/workflows',
          items: [
            { name: 'Overview', url: '/guides/core/workflows' },
            { name: 'Getting Started', url: '/guides/core/workflows/getting-started' },
            { name: 'Determinism', url: '/guides/core/workflows/determinism' },
            { name: 'Patterns', url: '/guides/core/workflows/patterns' },
            { name: 'Lifecycle', url: '/guides/core/workflows/lifecycle' },
            { name: 'Best Practices', url: '/guides/core/workflows/best-practices' },
          ],
        },
        {
          name: 'Defining Tasks',
          url: '/guides/core/tasks',
          items: [
            { name: 'Overview', url: '/guides/core/tasks' },
            { name: 'Getting Started', url: '/guides/core/tasks/getting-started' },
            { name: 'Configuration', url: '/guides/core/tasks/configuration' },
            { name: 'Idempotency', url: '/guides/core/tasks/idempotency' },
            { name: 'Testing', url: '/guides/core/tasks/testing' },
            { name: 'Best Practices', url: '/guides/core/tasks/best-practices' },
          ],
        },
        {
          name: 'Automatic Journaling',
          url: '/guides/core/journaling',
          items: [
            { name: 'Overview', url: '/guides/core/journaling' },
            { name: 'How It Works', url: '/guides/core/journaling/how-it-works' },
            { name: 'Replay Safety', url: '/guides/core/journaling/replay-safety' },
            { name: 'Best Practices', url: '/guides/core/journaling/best-practices' },
          ],
        },
        {
          name: 'Managing State',
          url: '/guides/core/state-management',
          items: [
            { name: 'Overview', url: '/guides/core/state-management' },
            { name: 'Basics', url: '/guides/core/state-management/basics' },
            { name: 'Patterns', url: '/guides/core/state-management/patterns' },
            { name: 'Best Practices', url: '/guides/core/state-management/best-practices' },
          ],
        },
        {
          name: 'Actors',
          url: '/guides/core/actors',
          items: [
            { name: 'Overview', url: '/guides/core/actors' },
            { name: 'Defining Actors', url: '/guides/core/actors/defining-actors' },
            { name: 'Using Actors', url: '/guides/core/actors/using-actors' },
          ],
        },
        {
          name: 'Handling Events',
          url: '/guides/core/events',
          items: [
            { name: 'Overview', url: '/guides/core/events' },
            { name: 'Receiving Events', url: '/guides/core/events/receiving-events' },
            { name: 'Sending Events', url: '/guides/core/events/sending-events' },
            { name: 'Patterns', url: '/guides/core/events/patterns' },
            { name: 'Best Practices', url: '/guides/core/events/best-practices' },
          ],
        },
        {
          name: 'Dealing with Errors',
          url: '/guides/core/error-handling',
          items: [
            { name: 'Overview', url: '/guides/core/error-handling' },
            { name: 'Retry & Compensation', url: '/guides/core/error-handling/retry-compensation' },
            { name: 'Resilience Patterns', url: '/guides/core/error-handling/resilience-patterns' },
            { name: 'Error Codes', url: '/guides/core/error-handling/error-codes' },
            { name: 'Dead Letter Queue', url: '/guides/core/error-handling/dead-letter-queue' },
            { name: 'Best Practices', url: '/guides/core/error-handling/best-practices' },
          ],
        },
      ],
    },
    {
      name: 'Developer Patterns',
      items: [
        { name: 'Overview', url: '/guides/patterns' },
        {
          name: 'Parent-Child Orchestration',
          url: '/guides/patterns/parent-child',
          items: [
            { name: 'Overview', url: '/guides/patterns/parent-child' },
            { name: 'Dynamic Spawning', url: '/guides/patterns/parent-child/dynamic-spawning' },
            { name: 'Event Coordination', url: '/guides/patterns/parent-child/event-coordination' },
            { name: 'Hierarchical', url: '/guides/patterns/parent-child/hierarchical' },
            { name: 'Error Handling', url: '/guides/patterns/parent-child/error-handling' },
            { name: 'Map-Reduce', url: '/guides/patterns/parent-child/map-reduce' },
            { name: 'Best Practices', url: '/guides/patterns/parent-child/best-practices' },
          ],
        },
        {
          name: 'Saga & Compensation',
          url: '/guides/patterns/saga',
          items: [
            { name: 'Overview', url: '/guides/patterns/saga' },
            { name: 'Coordinator Pattern', url: '/guides/patterns/saga/coordinator' },
            { name: 'Parallel Saga', url: '/guides/patterns/saga/parallel' },
            { name: 'Forward Recovery', url: '/guides/patterns/saga/forward-recovery' },
            { name: 'Event-Driven', url: '/guides/patterns/saga/event-driven' },
            { name: 'Best Practices', url: '/guides/patterns/saga/best-practices' },
          ],
        },
        {
          name: 'Fan-Out/Fan-In',
          url: '/guides/patterns/fan-out-fan-in',
          items: [
            { name: 'Overview', url: '/guides/patterns/fan-out-fan-in' },
            { name: 'Rate Limiting', url: '/guides/patterns/fan-out-fan-in/rate-limiting' },
            { name: 'Partial Failures', url: '/guides/patterns/fan-out-fan-in/partial-failures' },
            { name: 'Dynamic Fan-Out', url: '/guides/patterns/fan-out-fan-in/dynamic' },
            { name: 'Nested', url: '/guides/patterns/fan-out-fan-in/nested' },
            { name: 'Best Practices', url: '/guides/patterns/fan-out-fan-in/best-practices' },
          ],
        },
        {
          name: 'Long-Running Processes',
          url: '/guides/patterns/long-running',
          items: [
            { name: 'Overview', url: '/guides/patterns/long-running' },
            { name: 'Approvals', url: '/guides/patterns/long-running/approvals' },
            { name: 'Trial Management', url: '/guides/patterns/long-running/trial-management' },
            { name: 'Order Fulfillment', url: '/guides/patterns/long-running/order-fulfillment' },
            { name: 'Recurring Tasks', url: '/guides/patterns/long-running/recurring-tasks' },
            { name: 'Best Practices', url: '/guides/patterns/long-running/best-practices' },
          ],
        },
      ],
    },

  ],
}

const all_sdkDocumentation: NavMenuConstant = {
  icon: 'reference-javascript',
  title: 'Reference',
  url: '/guides/sdk',
  items: [
    { name: 'Overview', url: '/guides/sdk' },
    {
      name: 'SDK Documentation',
      items: [
        {
          name: 'Rust SDK',
          url: '/guides/sdk/rust',
          items: [
            { name: 'Overview', url: '/guides/sdk/rust' },
            { name: 'Workflows', url: '/guides/sdk/rust/workflows' },
            { name: 'Tasks', url: '/guides/sdk/rust/tasks' },
            { name: 'Client API', url: '/guides/sdk/rust/client' },
            { name: 'Worker', url: '/guides/sdk/rust/worker' },
            { name: 'Sessions', url: '/guides/sdk/rust/sessions' },
            { name: 'Actors', url: '/guides/sdk/rust/actors' },
            { name: 'Testing', url: '/guides/sdk/rust/testing' },
            { name: 'Patterns', url: '/guides/sdk/rust/patterns' },
          ],
        },
        {
          name: 'TypeScript SDK',
          url: '/guides/sdk/typescript',
          items: [
            { name: 'Overview', url: '/guides/sdk/typescript' },
            { name: 'Workflows', url: '/guides/sdk/typescript/workflows' },
            { name: 'Tasks', url: '/guides/sdk/typescript/tasks' },
            { name: 'Client API', url: '/guides/sdk/typescript/client' },
            { name: 'Worker', url: '/guides/sdk/typescript/worker' },
            { name: 'Sessions', url: '/guides/sdk/typescript/sessions' },
            { name: 'Actors', url: '/guides/sdk/typescript/actors' },
            { name: 'Testing', url: '/guides/sdk/typescript/testing' },
            { name: 'Patterns', url: '/guides/sdk/typescript/patterns' },
          ],
        },
        {
          name: 'Python SDK',
          url: '/guides/sdk/python',
          items: [
            { name: 'Overview', url: '/guides/sdk/python' },
            { name: 'Workflows', url: '/guides/sdk/python/workflows' },
            { name: 'Tasks', url: '/guides/sdk/python/tasks' },
            { name: 'Client API', url: '/guides/sdk/python/client' },
            { name: 'Worker', url: '/guides/sdk/python/worker' },
            { name: 'Sessions', url: '/guides/sdk/python/sessions' },
            { name: 'Actors', url: '/guides/sdk/python/actors' },
            { name: 'Testing', url: '/guides/sdk/python/testing' },
            { name: 'Patterns', url: '/guides/sdk/python/patterns' },
          ],
        },
      ],
    },
    {
      name: 'API & CLI',
      items: [
        {
          name: 'REST API',
          url: '/guides/api',
          items: [
            { name: 'Overview', url: '/guides/api' },
            { name: 'Authentication', url: '/guides/api/authentication' },
            { name: 'Namespaces', url: '/guides/api/namespaces' },
            { name: 'Workflows', url: '/guides/api/workflows' },
            { name: 'Schedules', url: '/guides/api/schedules' },
            { name: 'Tasks', url: '/guides/api/tasks' },
            { name: 'Users', url: '/guides/api/users' },
            { name: 'Organizations', url: '/guides/api/organizations' },
            { name: 'Registry', url: '/guides/api/registry' },
            { name: 'Health & System', url: '/guides/api/health' },
            { name: 'Version & System', url: '/guides/api/system' },
            { name: 'Errors & Limits', url: '/guides/api/errors-and-limits' },
            { name: 'Best Practices', url: '/guides/api/best-practices' },
          ],
        },
        {
          name: 'Command-Line Interface',
          url: '/guides/sdk/cli',
          items: [
            { name: 'Overview', url: '/guides/sdk/cli' },
            { name: 'Project & Dev', url: '/guides/sdk/cli/project' },
            { name: 'Workflows', url: '/guides/sdk/cli/workflows' },
            { name: 'Infrastructure', url: '/guides/sdk/cli/infrastructure' },
            { name: 'Configuration', url: '/guides/sdk/cli/configuration' },
            { name: 'Examples', url: '/guides/sdk/cli/examples' },
          ],
        },
        { name: 'Configuration Reference', url: '/guides/deployment/configuration' },
      ],
    },
  ],
}

const all_operations: NavMenuConstant = {
  icon: 'platform',
  title: 'Operations',
  url: '/guides/operations/orchestrator',
  items: [
    { name: 'Security', url: '/guides/security' },
    {
      name: 'Running Orcher',
      items: [
        {
          name: 'Orchestrator Server',
          url: '/guides/operations/orchestrator',
          items: [
            { name: 'Overview', url: '/guides/operations/orchestrator' },
            { name: 'Configuration', url: '/guides/operations/orchestrator/configuration' },
            { name: 'Deployment', url: '/guides/operations/orchestrator/deployment' },
            { name: 'High Availability', url: '/guides/operations/orchestrator/high-availability' },
            { name: 'Monitoring', url: '/guides/operations/orchestrator/monitoring' },
          ],
        },
        {
          name: 'Worker Management',
          url: '/guides/operations/workers',
          items: [
            { name: 'Overview', url: '/guides/operations/workers' },
            { name: 'Creating a Worker', url: '/guides/operations/workers/creating-a-worker' },
            { name: 'Connectivity', url: '/guides/operations/workers/connectivity' },
            { name: 'Scaling', url: '/guides/operations/workers/scaling' },
            { name: 'Operations', url: '/guides/operations/workers/operations' },
          ],
        },
        {
          name: 'Queue Configuration',
          url: '/guides/operations/queue',
          items: [
            { name: 'Overview', url: '/guides/operations/queue' },
            { name: 'Configuration', url: '/guides/operations/queue/configuration' },
            { name: 'Polling & DLQ', url: '/guides/operations/queue/polling' },
            { name: 'Monitoring', url: '/guides/operations/queue/monitoring' },
          ],
        },
        {
          name: 'Storage Setup',
          url: '/guides/operations/storage',
          items: [
            { name: 'Overview', url: '/guides/operations/storage' },
            { name: 'Redis', url: '/guides/operations/storage/redis' },
            { name: 'Caching & Schema', url: '/guides/operations/storage/caching' },
            { name: 'Operations', url: '/guides/operations/storage/operations' },
          ],
        },
      ],
    },
    {
      name: 'Observability',
      items: [
        {
          name: 'Metrics & Monitoring',
          url: '/guides/observability/metrics',
          items: [
            { name: 'Overview', url: '/guides/observability/metrics' },
            { name: 'Metric Reference', url: '/guides/observability/metrics/reference' },
            { name: 'Prometheus', url: '/guides/observability/metrics/prometheus' },
            { name: 'Alerting', url: '/guides/observability/metrics/alerting' },
          ],
        },
        {
          name: 'Logging',
          url: '/guides/observability/logging',
          items: [
            { name: 'Overview', url: '/guides/observability/logging' },
            { name: 'Structured Logging', url: '/guides/observability/logging/structured-logging' },
            { name: 'Viewing Logs', url: '/guides/observability/logging/viewing-logs' },
            { name: 'Aggregation', url: '/guides/observability/logging/aggregation' },
          ],
        },
        {
          name: 'Tracing',
          url: '/guides/observability/tracing',
          items: [
            { name: 'Overview', url: '/guides/observability/tracing' },
            { name: 'Creating Spans', url: '/guides/observability/tracing/creating-spans' },
            { name: 'Context Propagation', url: '/guides/observability/tracing/context-propagation' },
            { name: 'Best Practices', url: '/guides/observability/tracing/best-practices' },
          ],
        },
        {
          name: 'Debugging Workflows',
          url: '/guides/observability/debugging',
          items: [
            { name: 'Overview', url: '/guides/observability/debugging' },
            { name: 'Viewing Logs', url: '/guides/observability/debugging/logs' },
            { name: 'Replay', url: '/guides/observability/debugging/replay' },
            { name: 'Scenarios', url: '/guides/observability/debugging/scenarios' },
          ],
        },
      ],
    },
    {
      name: 'Production Deployment',
      items: [
        {
          name: 'Docker Containers',
          url: '/guides/deployment/docker',
          items: [
            { name: 'Overview', url: '/guides/deployment/docker' },
            { name: 'Configuration', url: '/guides/deployment/docker/configuration' },
            { name: 'Production', url: '/guides/deployment/docker/production' },
            { name: 'Troubleshooting', url: '/guides/deployment/docker/troubleshooting' },
          ],
        },
        {
          name: 'Kubernetes Clusters',
          url: '/guides/deployment/kubernetes',
          items: [
            { name: 'Overview', url: '/guides/deployment/kubernetes' },
            { name: 'Manifests', url: '/guides/deployment/kubernetes/manifests' },
            { name: 'Autoscaling', url: '/guides/deployment/kubernetes/autoscaling' },
            { name: 'Production', url: '/guides/deployment/kubernetes/production' },
          ],
        },
        {
          name: 'Cloud Platforms',
          url: '/guides/deployment/cloud',
          items: [
            { name: 'Overview', url: '/guides/deployment/cloud' },
            { name: 'Managed Databases', url: '/guides/deployment/cloud/managed-databases' },
            { name: 'Cloud Providers', url: '/guides/deployment/cloud/providers' },
            { name: 'Operations', url: '/guides/deployment/cloud/operations' },
          ],
        },
        {
          name: 'Configuration Guide',
          url: '/guides/deployment/configuration',
          items: [
            { name: 'Overview', url: '/guides/deployment/configuration' },
            { name: 'TOML Reference', url: '/guides/deployment/configuration/toml-reference' },
            { name: 'Environments', url: '/guides/deployment/configuration/environments' },
          ],
        },
      ],
    },
  ],
}

const all_local_development: NavMenuConstant = {
  icon: 'dev-cli',
  title: 'Local Dev / CLI',
  url: '/guides/local-development',
  items: [
    { name: 'Overview', url: '/guides/local-development' },
    {
      name: 'Local development',
      url: undefined,
      items: [
        { name: 'Getting started', url: '/guides/local-development/getting-started' },
        {
          name: 'Workflow development',
          url: '/guides/local-development/workflow-development' as `/${string}`,
        },
        {
          name: 'Testing workflows',
          url: '/guides/local-development/testing-workflows' as `/${string}`,
        },
        {
          name: 'Configuration',
          url: '/guides/local-development/configuration' as `/${string}`,
        },
        {
          name: 'Debugging workflows',
          url: '/guides/local-development/debugging-workflows' as `/${string}`,
        },
      ],
    },
    {
      name: 'CLI',
      url: undefined,
      items: [{ name: 'CLI reference', url: '/guides/sdk/cli' }],
    },
  ],
}

// What the site shows: every menu without the pages content/verified-pages.txt
// doesn't list yet.
export const GLOBAL_MENU_ITEMS = publishedGlobalMenu(all_GLOBAL_MENU_ITEMS)
export const gettingstarted = publishedMenu(all_gettingstarted)
export const developerGuides = publishedMenu(all_developerGuides)
export const sdkDocumentation = publishedMenu(all_sdkDocumentation)
export const operations = publishedMenu(all_operations)
export const local_development = publishedMenu(all_local_development)
