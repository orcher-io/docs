// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
import { cn, IconGitHubSolid } from 'ui'

import { GITHUB_DISCUSSIONS_URL, GITHUB_DOCS_ISSUES_URL, GITHUB_ORG_URL } from '~/lib/constants'

const linkClassName = 'text-xs text-foreground-lighter hover:underline'

const Footer = ({ className }: { className?: string }) => (
  <div className={cn('max-w-7xl mx-auto px-5', className)}>
    <footer role="contentinfo" aria-label="footer" className="py-8">
      <div className="flex gap-4 items-center justify-between">
        <div className="flex flex-col lg:flex-row gap-3">
          <a href="https://orcher.io/" className="text-xs text-foreground-lighter">
            &copy; Orcher
          </a>
          <a href={GITHUB_DISCUSSIONS_URL} className={linkClassName}>
            Discussions
          </a>
          <a href={GITHUB_DOCS_ISSUES_URL} className={linkClassName}>
            Report a docs issue
          </a>
          <span className="text-xs text-foreground-lighter">
            Site built on{' '}
            <a href="https://github.com/supabase/supabase" className="hover:underline">
              Supabase&apos;s open-source docs
            </a>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={GITHUB_ORG_URL}
            className="text-foreground-muted hover:text-foreground transition"
          >
            <span className="sr-only">GitHub</span>
            <IconGitHubSolid size={14} />
          </a>
        </div>
      </div>
    </footer>
  </div>
)

export default Footer
