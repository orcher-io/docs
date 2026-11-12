/**
 * Where the site is served. Both are read at build time (NEXT_PUBLIC_*), so
 * set them before `next build`.
 *
 * - NEXT_PUBLIC_BASE_PATH: path prefix, default `/docs` (orcher.io/docs). Set
 *   it to an empty string to serve from the root, e.g. at docs.orcher.io.
 * - NEXT_PUBLIC_SITE_URL: origin, default `https://orcher.io`.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/docs'
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://orcher.io').replace(
  /\/+$/,
  ''
)
export const PROD_URL = `${SITE_ORIGIN}${BASE_PATH}`
export const IS_DEV = process.env.NODE_ENV === 'development'

/** Public places to send readers. Never link the private engine repository. */
export const GITHUB_ORG_URL = 'https://github.com/orcher-io'
export const GITHUB_DOCS_REPO = 'orcher-io/docs'
export const GITHUB_DOCS_ISSUES_URL = `https://github.com/${GITHUB_DOCS_REPO}/issues`
export const GITHUB_DISCUSSIONS_URL = 'https://github.com/orcher-io/quickstart/discussions'
