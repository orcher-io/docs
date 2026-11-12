// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { MenuId } from '~/components/Navigation/NavigationMenu/NavigationMenu'
import { menuState } from '../../../hooks/useMenuState'

export function getPathWithoutHash(relativePath: string) {
  return new URL(relativePath, 'http://placeholder').pathname
}

export const getMenuId = (pathname: string | null) => {
  pathname = (pathname ?? '').replace(/^\/guides\/?/, '')

  switch (true) {
    case pathname === '':
    case pathname.startsWith('core'):
    case pathname.startsWith('patterns'):
    case pathname.startsWith('resources'):
      return MenuId.Guides

    case pathname.startsWith('sdk'):
    case pathname.startsWith('api'):
      return MenuId.Sdk

    case pathname.startsWith('operations'):
    case pathname.startsWith('observability'):
    case pathname.startsWith('deployment'):
    case pathname.startsWith('security'):
      return MenuId.Operations

    case pathname.startsWith('local-development'):
      return MenuId.LocalDevelopment

    // getting-started, use-cases, learning
    default:
      return MenuId.GettingStarted
  }
}

export const useCloseMenuOnRouteChange = () => {
  const pathname = usePathname()

  useEffect(() => {
    menuState.setMenuMobileOpen(false)
  }, [pathname])
}
