import list from '~/content/verified-pages.txt'

/**
 * The guide files listed in content/verified-pages.txt, as repo-relative paths
 * (`content/guides/sdk/rust/index.mdx`). Only these are published: shown in the
 * navigation and in search. The rest still build, with a notice.
 */
export const VERIFIED_FILES: ReadonlySet<string> = new Set(
  list
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
)

/**
 * The files a `/guides/...` route can be served from, in the order
 * getGuidesMarkdown() tries them: `/guides` is `overview.mdx`, and `<a>.mdx`
 * wins over `<a>/index.mdx`.
 */
export function guideFilesFor(pathname: string): string[] {
  const rel = pathname.replace(/^\/guides\/?/, '').replace(/\/$/, '') || 'overview'
  return [`content/guides/${rel}.mdx`, `content/guides/${rel}/index.mdx`]
}

/**
 * Whether a site link leads to a published page. Links outside `/guides`
 * (other site pages, external URLs) are not guide pages and always pass.
 */
export function isPublishedHref(href: string): boolean {
  if (!href.startsWith('/guides')) return true
  const pathname = href.split(/[?#]/)[0]
  return guideFilesFor(pathname).some((file) => VERIFIED_FILES.has(file))
}

/** The route a listed file is served at: the inverse of guideFilesFor(). */
function routeOf(file: string): `/${string}` {
  const rel = file.replace(/^content\/guides\//, '').replace(/\.mdx$/, '').replace(/(^|\/)index$/, '')
  return rel === 'overview' ? '/guides' : `/guides/${rel}`
}

/**
 * Where a navigation link to `href` should go: `href` itself when it is
 * published; otherwise the published page nearest below it (fewest path
 * segments, then list order), so a section whose overview isn't verified yet
 * still leads to the pages that are; or nothing.
 */
export function publishedHrefFor<T extends string>(href: T): T | `/${string}` | undefined {
  if (isPublishedHref(href)) return href
  const pathname = href.split(/[?#]/)[0].replace(/\/$/, '')
  const below = [...VERIFIED_FILES]
    .map(routeOf)
    .filter((route) => route.startsWith(`${pathname}/`))
    .sort((a, b) => a.split('/').length - b.split('/').length)
  return below[0]
}

