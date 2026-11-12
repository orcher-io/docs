import { isPublishedHref, publishedHrefFor } from '~/lib/verified-pages'
import type {
  DropdownMenuItem,
  GlobalMenuItems,
  NavMenuConstant,
  NavMenuSection,
} from '../Navigation.types'

type MenuItem = NonNullable<DropdownMenuItem['menuItems']>[number][number]
type Section = Partial<NavMenuSection>

/**
 * A sidebar section without the pages content/verified-pages.txt doesn't list.
 * An entry whose own page is unpublished stays, without its link, while any of
 * its children is published; otherwise it goes.
 */
function publishedSections(items: ReadonlyArray<Section>): Section[] {
  return items.flatMap((item) => {
    const children = item.items ? publishedSections(item.items) : undefined
    const linked = item.url !== undefined && isPublishedHref(item.url)
    if (!linked && !children?.length) return []
    return [{ ...item, url: linked ? item.url : undefined, items: children ?? item.items }]
  })
}

/** A sidebar menu with only its published pages. */
export function publishedMenu(menu: NavMenuConstant): NavMenuConstant {
  return {
    ...menu,
    url: menu.url ? (publishedHrefFor(menu.url) as NavMenuConstant['url']) : undefined,
    items: publishedSections(menu.items),
  }
}

/**
 * One column of a dropdown: a label without a link heads the links after it,
 * so it stays only if one of those links does.
 */
function publishedColumn(column: MenuItem[]): MenuItem[] {
  const kept: MenuItem[] = []
  let header: MenuItem | undefined
  for (const item of column) {
    if (!item.href) {
      header = item
      continue
    }
    if (!isPublishedHref(item.href)) continue
    if (header) {
      kept.push(header)
      header = undefined
    }
    kept.push(item)
  }
  return kept
}

/** The top navigation with only its published pages; empty entries go. */
export function publishedGlobalMenu(menu: GlobalMenuItems): GlobalMenuItems {
  return menu
    .map((section) =>
      section.flatMap((item): DropdownMenuItem[] => {
        if (item.menuItems) {
          const columns = item.menuItems.map(publishedColumn).filter((column) => column.length)
          return columns.length ? [{ ...item, menuItems: columns }] : []
        }
        if (!item.href) return [item]
        const href = publishedHrefFor(item.href) as DropdownMenuItem['href']
        return href ? [{ ...item, href }] : []
      })
    )
    .filter((section) => section.length)
}
