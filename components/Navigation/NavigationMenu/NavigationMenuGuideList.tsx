'use client'

import * as Accordion from '@radix-ui/react-accordion'

import { type NavMenuSection } from '../Navigation.types'
import * as NavItems from './NavigationMenu.constants'
import NavigationMenuGuideListItems from './NavigationMenuGuideListItems'
import { usePathname } from 'next/navigation'
import { PropsWithChildren } from 'react'

const NavigationMenuGuideList = ({
  id,
  additionalNavItems,
}: {
  id: string
  additionalNavItems?: Record<string, Partial<NavMenuSection>[]>
}) => {
  const pathname = usePathname()
  const firstLevelRoute = pathname?.split('/')?.slice(0, 4)?.join('/')

  // eslint-disable-next-line import/namespace -- dynamic access, can't lint properly
  const menu = NavItems[id]

  return (
    <NavigationMenuGuideListWrapper id={id} firstLevelRoute={firstLevelRoute}>
      <NavigationMenuGuideListItems menu={menu} id={id} />
    </NavigationMenuGuideListWrapper>
  )
}

export function NavigationMenuGuideListWrapper({
  id,
  firstLevelRoute,
  children,
}: PropsWithChildren<{
  id: string
  firstLevelRoute?: string
}>) {
  return (
    <Accordion.Root
      collapsible={true}
      key={id}
      type="single"
      value={firstLevelRoute}
      className="transition-all duration-150 ease-out opacity-100 ml-0 delay-150 w-full"
    >
      {children}
    </Accordion.Root>
  )
}

export default NavigationMenuGuideList
