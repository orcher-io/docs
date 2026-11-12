// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
'use client'

import { type PropsWithChildren } from 'react'
import { ThemeProvider } from 'common'
import { SonnerToaster, TooltipProvider } from 'ui'
import SiteLayout from '~/layouts/SiteLayout'
import { DocsCommandMenu, DocsCommandProvider } from './command'
import { ScrollRestoration } from './ui/helpers.scroll.client'

/**
 * Global providers that wrap the entire app
 */
function GlobalProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={0}>
        <DocsCommandProvider>
          <ScrollRestoration />
          <div className="flex flex-col">
            <SiteLayout>
              {children}
              <DocsCommandMenu />
            </SiteLayout>
          </div>
        </DocsCommandProvider>
        <SonnerToaster position="top-right" />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export { GlobalProviders }
