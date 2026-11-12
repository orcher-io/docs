// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
import { memo } from 'react'

import type { NavMenuSection } from '../Navigation.types'
import { useCloseMenuOnRouteChange } from './NavigationMenu.utils'
import NavigationMenuGuideList from './NavigationMenuGuideList'

enum MenuId {
  GettingStarted = 'gettingstarted',
  Guides = 'developerGuides',
  Sdk = 'sdkDocumentation',
  Operations = 'operations',
  LocalDevelopment = 'local_development',
}

interface Menu {
  id: MenuId
  type: 'guide'
}

const menus: Menu[] = Object.values(MenuId).map((id) => ({ id, type: 'guide' }))

function getMenuById(id: MenuId) {
  return menus.find((menu) => menu.id === id)
}

function getMenuElement(menu: Menu | undefined, props?: any) {
  if (!menu) return null

  const menuType = menu?.type
  switch (menuType) {
    case 'guide':
      return <NavigationMenuGuideList id={menu.id} {...props} />
    default:
      return null
  }
}

const NavigationMenu = ({
  menuId,
  additionalNavItems,
}: {
  menuId: MenuId
  additionalNavItems?: Record<string, Partial<NavMenuSection>[]>
}) => {
  const level = menuId
  const menu = getMenuById(level)

  useCloseMenuOnRouteChange()

  return getMenuElement(menu, { additionalNavItems })
}

export { getMenuById, MenuId }
export default memo(NavigationMenu)
