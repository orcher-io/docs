'use client'

import dynamic from 'next/dynamic'
import type { PropsWithChildren } from 'react'

import { CommandProvider, useCommandMenuInitiated } from 'ui-patterns/CommandMenu'

const LazyCommandMenu = dynamic(() => import('./CommandMenu'), { ssr: false })

const DocsCommandMenu = () => {
  const isInitiated = useCommandMenuInitiated()
  return isInitiated && <LazyCommandMenu />
}

function DocsCommandProvider({ children }: PropsWithChildren) {
  return (
    <CommandProvider>
      {children}
    </CommandProvider>
  )
}

export { DocsCommandMenu, DocsCommandProvider }
