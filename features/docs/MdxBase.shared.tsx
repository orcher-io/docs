// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Box,
  Check as LucideCheck,
  Code2,
  Cog,
  Database,
  ExternalLink,
  GitBranch,
  Layers,
  LayoutGrid,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  Shield,
  Terminal,
  Timer,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { type AnchorHTMLAttributes, type ImgHTMLAttributes } from 'react'
import { BASE_PATH } from '~/lib/constants'
import { Badge, Button, Image } from 'ui'
import { Admonition, type AdmonitionProps } from 'ui-patterns/admonition'
import { GlassPanel } from 'ui-patterns/GlassPanel'
import { IconPanel } from 'ui-patterns/IconPanel'
import { GlassPanelWithIconPicker } from '~/features/ui/GlassPanelWithIconPicker'
import ReplayTimeline from '~/components/ReplayTimeline'
import { Heading } from 'ui/src/components/CustomHTMLElements'
import ButtonCard from '~/components/ButtonCard'
import { Check } from '~/components/Check'
import StepHikeCompact from '~/components/StepHikeCompact'
import { Accordion, AccordionItem } from '~/features/ui/Accordion'
import { CodeBlock } from '~/features/ui/CodeBlock/CodeBlock'
import InfoTooltip from '~/features/ui/InfoTooltip'
import { TabPanel, Tabs } from '~/features/ui/Tabs'

/**
 * Markdown links and <a> tags in guides.
 *
 * Internal links are written root-relative to the docs site, e.g.
 * `/guides/core/workflows#retries`, never with the `/docs` base path: they are
 * rendered through next/link, which applies the configured basePath exactly
 * once. External links open in a new tab.
 */
const MdxLink = ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  if (href && href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }
  if (href && /^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
        {children}
      </a>
    )
  }
  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

/** Root-relative image paths (`/img/...`) are served under the base path. */
const MdxImg = ({ src, alt = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={typeof src === 'string' && src.startsWith('/') && !src.startsWith('//') ? `${BASE_PATH}${src}` : src}
    alt={alt}
    {...props}
  />
)

// Wrap Admonition for Docs-specific styling (within MDX prose, requires a margin-bottom)
const AdmonitionWithMargin = (props: AdmonitionProps) => {
  return <Admonition {...props} className="mb-8" />
}

const components = {
  a: MdxLink,
  img: MdxImg,
  Accordion,
  AccordionItem,
  Admonition: AdmonitionWithMargin,
  Badge,
  Button,
  ButtonCard,
  Check,
  GlassPanel,
  GlassPanelWithIconPicker,
  IconArrowDown: ArrowDown,
  IconArrowRight: ArrowRight,
  IconBookOpen: BookOpen,
  IconBox: Box,
  IconCheck: LucideCheck,
  IconCode: Code2,
  IconCog: Cog,
  IconDatabase: Database,
  IconExternalLink: ExternalLink,
  IconGitBranch: GitBranch,
  IconLayers: Layers,
  IconLayoutGrid: LayoutGrid,
  IconMessageSquare: MessageSquare,
  IconPanel,
  ReplayTimeline,
  IconPlay: Play,
  IconRefreshCw: RefreshCw,
  IconSend: Send,
  IconShield: Shield,
  IconTerminal: Terminal,
  IconTimer: Timer,
  IconWorkflow: Workflow,
  IconX: X,
  IconZap: Zap,
  Image: (props: any) => <Image fill alt="" className="object-contain" {...props} />,
  Link,
  StepHikeCompact,
  Tabs,
  TabPanel,
  InfoTooltip,
  h2: (props: any) => (
    <Heading tag="h2" {...props}>
      {props.children}
    </Heading>
  ),
  h3: (props: any) => (
    <Heading tag="h3" {...props}>
      {props.children}
    </Heading>
  ),
  h4: (props: any) => (
    <Heading tag="h4" {...props}>
      {props.children}
    </Heading>
  ),
  pre: CodeBlock,
}

export { components }
