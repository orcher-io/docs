// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { memo, type PropsWithChildren, type ReactNode, useEffect } from 'react'
// End of third-party imports

import { cn } from 'ui'
import type { NavMenuSection } from '~/components/Navigation/Navigation.types'
import DefaultNavigationMenu, {
  type MenuId,
} from '~/components/Navigation/NavigationMenu/NavigationMenu'
import { getMenuId } from '~/components/Navigation/NavigationMenu/NavigationMenu.utils'
import TopNavBar from '~/components/Navigation/NavigationMenu/TopNavBar'
import { DOCS_CONTENT_CONTAINER_ID } from '~/features/ui/helpers.constants'
import { menuState, useMenuMobileOpen } from '~/hooks/useMenuState'

const Footer = dynamic(() => import('~/components/Navigation/Footer'))

const footerEnabled = true

const levelsData: Record<string, { icon: string; name: string }> = {
  home: { icon: 'home', name: 'Home' },
  gettingstarted: { icon: 'getting-started', name: 'Getting Started' },
  developerGuides: { icon: 'edge-functions', name: 'Guides' },
  sdkDocumentation: { icon: 'reference-javascript', name: 'Reference' },
  operations: { icon: 'platform', name: 'Operations' },
  local_development: { icon: 'dev-cli', name: 'Local Development' },
}

type MobileHeaderProps = { menuId: MenuId } | { menuName: string }

const MobileHeader = memo(function MobileHeader(props: MobileHeaderProps) {
  const mobileMenuOpen = useMenuMobileOpen()

  return (
    <div
      className={cn(
        'lg:hidden px-3.5 border-b z-10',
        'transition-all ease-out',
        'top-0',
        mobileMenuOpen && 'absolute',
        'flex items-center',
        mobileMenuOpen ? 'gap-0' : 'gap-1'
      )}
    >
      <button
        className={cn(
          'h-8 w-8 flex group items-center justify-center mr-1',
          mobileMenuOpen && 'mt-0.5'
        )}
        onClick={() => menuState.setMenuMobileOpen(!mobileMenuOpen)}
      >
        <div
          className={cn(
            'space-y-1  cursor-pointer relative',
            mobileMenuOpen ? 'w-4 h-4' : 'w-4 h-[8px]'
          )}
        >
          <span
            className={cn(
              'transition-all ease-out block w-4 h-px bg-foreground-muted group-hover:bg-foreground',
              !mobileMenuOpen ? 'w-4' : 'absolute rotate-45 top-[6px]'
            )}
          />
          <span
            className={cn(
              'transition-all ease-out block h-px bg-foreground-muted group-hover:bg-foreground',
              !mobileMenuOpen ? 'w-3 group-hover:w-4' : 'absolute w-4 -rotate-45 top-[2px]'
            )}
          />
        </div>
      </button>
      <span
        className={cn(
          'transition-all duration-200',
          'text-foreground',
          mobileMenuOpen ? 'text-xs' : 'text-sm'
        )}
      >
        {mobileMenuOpen
          ? 'Close'
          : 'menuId' in props
            ? levelsData[props.menuId]?.name ?? levelsData['home'].name
            : props.menuName}
      </span>
    </div>
  )
})

const MobileMenuBackdrop = memo(function MobileMenuBackdrop() {
  const mobileMenuOpen = useMenuMobileOpen()

  useEffect(() => {
    window.addEventListener('resize', (e: UIEvent) => {
      const w = e.target as Window
      if (mobileMenuOpen && w.innerWidth >= 1024) {
        menuState.setMenuMobileOpen(!mobileMenuOpen)
      }
    })
    return () => {
      window.removeEventListener('resize', () => {})
    }
  }, [mobileMenuOpen])

  return (
    <div
      className={cn(
        'h-full',
        'left-0',
        'right-0',
        'z-10',
        'backdrop-blur-sm backdrop-filter bg-alternative/90',
        mobileMenuOpen ? 'absolute h-full w-full top-0 left-0' : 'hidden h-0',
        // always hide on desktop
        'lg:hidden'
      )}
      onClick={() => menuState.setMenuMobileOpen(!mobileMenuOpen)}
    ></div>
  )
})

const Container = memo(function Container({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <main
      // used by layout to scroll to top
      id={DOCS_CONTENT_CONTAINER_ID}
      className={cn(
        'w-full transition-all ease-out relative',
        // desktop override any margin styles
        'lg:ml-0',
        className
      )}
    >
      <div className="flex flex-col sticky top-0">{children}</div>
    </main>
  )
})

const NavContainer = memo(function NavContainer({ children }: PropsWithChildren) {
  const mobileMenuOpen = useMenuMobileOpen()

  return (
    <nav
      aria-labelledby="main-nav-title"
      className={cn(
        'fixed lg:relative z-40 lg:z-auto',
        mobileMenuOpen ? 'w-[75%] sm:w-[50%] md:w-[33%] left-0' : 'w-0 -left-full',
        'lg:w-[420px] !lg:left-0',
        'lg:top-[var(--header-height)] lg:sticky',
        'h-screen lg:h-[calc(100vh-var(--header-height))]',
        // desktop override any left styles
        'lg:left-0',
        'transition-all',
        'top-0 bottom-0',
        'flex flex-col ml-0',
        'border-r',
        'lg:overflow-y-auto'
      )}
    >
      <div
        className={cn(
          'top-0 lg:top-[var(--header-height)]',
          'h-full',
          'relative lg:sticky',
          'w-full lg:w-auto',
          'h-fit lg:h-screen overflow-y-scroll lg:overflow-auto',
          '[overscroll-behavior:contain]',
          'backdrop-blur backdrop-filter bg-background',
          'flex flex-col flex-grow'
        )}
      >
        <span id="main-nav-title" className="sr-only">
          Main menu
        </span>
        <div className="top-0 sticky h-0 z-10">
          <div className="bg-gradient-to-b from-background to-transparent h-4 w-full"></div>
        </div>
        <div
          className={cn(
            'transition-all ease-out duration-200',
            'absolute left-0 right-0',
            'px-5 pl-5 pt-6 pb-16 lg:pb-32',
            'bg-background',
            // desktop styles
            'lg:relative lg:left-0 lg:pb-10 lg:px-10 lg:flex',
            'lg:opacity-100 lg:visible'
          )}
        >
          {children}
        </div>
      </div>
    </nav>
  )
})

interface SkeletonProps extends PropsWithChildren {
  menuId?: MenuId
  menuName?: string
  hideSideNav?: boolean
  NavigationMenu?: ReactNode
  hideFooter?: boolean
  className?: string
  additionalNavItems?: Record<string, Partial<NavMenuSection>[]>
}

function TopNavSkeleton({ children }) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="hidden lg:sticky w-full lg:flex top-0 left-0 right-0 z-50">
        <TopNavBar />
      </div>
      {children}
    </div>
  )
}

function SidebarSkeleton({
  children,
  menuId: _menuId,
  menuName,
  NavigationMenu,
  hideFooter = !footerEnabled,
  className,
  hideSideNav,
  additionalNavItems,
}: SkeletonProps) {
  const pathname = usePathname()
  const menuId = _menuId ?? getMenuId(pathname)

  const mobileMenuOpen = useMenuMobileOpen()

  return (
    <div className={cn('flex flex-row h-full relative', className)}>
      {!hideSideNav && (
        <NavContainer>
          {NavigationMenu ?? (
            <DefaultNavigationMenu menuId={menuId} additionalNavItems={additionalNavItems} />
          )}
        </NavContainer>
      )}
      <Container>
        <div
          className={cn(
            'flex lg:hidden w-full top-0 left-0 right-0 z-50',
            hideSideNav && 'sticky',
            mobileMenuOpen && 'z-10'
          )}
        >
          <TopNavBar />
        </div>
        <div
          className={cn(
            'sticky',
            'transition-all top-0 z-10',
            'backdrop-blur backdrop-filter bg-background'
          )}
        >
          {hideSideNav ? null : menuName ? (
            <MobileHeader menuName={menuName} />
          ) : (
            <MobileHeader menuId={menuId} />
          )}
        </div>
        <div className="grow">
          {children}
          {!hideFooter && <Footer />}
        </div>
        <MobileMenuBackdrop />
      </Container>
    </div>
  )
}

export { SidebarSkeleton, TopNavSkeleton }
