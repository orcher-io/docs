// @ts-check
/**
 * Shared helpers for the content scripts (link check, search index): which
 * guide pages exist and at what route, how fenced code is skipped, and the
 * heading anchors the site renders.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

export const ROOT = process.cwd()
export const GUIDES = join(ROOT, 'content', 'guides')

/** @param {string} dir @returns {string[]} */
export function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (name === 'node_modules' || name.startsWith('.')) return []
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

/**
 * Map every routed guide to its MDX file, mirroring app/guides/* and
 * getGuidesMarkdown(): `content/guides/overview.mdx` is `/guides`,
 * `<section>/<a>/index.mdx` is `/guides/<section>/<a>`, and `<a>.mdx` wins
 * over `<a>/index.mdx`. Files starting with `_` are partials, not pages.
 *
 * @returns {Map<string, string>} route -> absolute file path
 */
export function guidePages() {
  const routedSections = new Set(
    readdirSync(join(ROOT, 'app', 'guides')).filter((n) =>
      statSync(join(ROOT, 'app', 'guides', n)).isDirectory()
    )
  )
  const pages = new Map()
  for (const file of walk(GUIDES).filter((f) => f.endsWith('.mdx'))) {
    const rel = relative(GUIDES, file).split(sep).join('/').replace(/\.mdx$/, '')
    if (rel.split('/').at(-1)?.startsWith('_')) continue
    if (rel === 'overview') {
      pages.set('/guides', file)
      continue
    }
    if (!routedSections.has(rel.split('/')[0])) continue
    const route = '/guides/' + rel.replace(/\/index$/, '')
    if (!pages.has(route) || !rel.endsWith('/index')) pages.set(route, file)
  }
  return pages
}

/**
 * Blank out fenced code blocks, keeping line numbers.
 *
 * @param {string} text
 */
export function stripFences(text) {
  const out = []
  /** @type {string | null} */
  let fence = null
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(`{3,}|~{3,})/)
    if (fence) {
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length && line.trim() === m[1]) {
        fence = null
      }
      out.push('')
      continue
    }
    if (m) {
      fence = m[1]
      out.push('')
      continue
    }
    out.push(line)
  }
  return out.join('\n')
}

/**
 * Heading markdown -> the id the site gives it. Mirrors getAnchor() in
 * packages/ui/src/components/CustomHTMLElements/CustomHTMLElements.utils.ts:
 * a `[#custom]` anchor wins; otherwise each text run (trimmed) and each inline
 * element's text is slugified separately and the pieces joined with '-'.
 *
 * @param {string} raw
 */
export function headingAnchor(raw) {
  const custom = raw.match(/\[#([^\]]+)\]/)
  if (custom) return custom[1]
  /** @param {string} v */
  const slugify = (v) =>
    v
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9- ]/g, '')
      .replace(/[ ]/g, '-')
  const INLINE =
    /`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|\[([^\]]*)\]\([^)]*\)|<[^>]+>([^<]*)<\/[^>]+>/g
  /** @type {string[]} */
  const chunks = []
  let last = 0
  let elements = 0
  for (const m of raw.matchAll(INLINE)) {
    const index = m.index ?? 0
    if (index > last) chunks.push(raw.slice(last, index).trim())
    chunks.push(m.slice(1).find((g) => g !== undefined) ?? '')
    elements++
    last = index + m[0].length
  }
  if (last < raw.length) chunks.push(raw.slice(last).trim())
  if (!elements) return slugify(raw)
  return chunks.map(slugify).join('-').toLowerCase()
}

/** Plain heading text for display. @param {string} raw */
export function headingText(raw) {
  return raw
    .replace(/\[#[^\]]+\]/, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*]/g, '')
    .trim()
}

/**
 * Headings (level 2+) of an MDX body, outside code fences.
 *
 * @param {string} body MDX without frontmatter
 * @returns {Array<{ level: number, text: string, slug: string }>}
 */
export function headingsOf(body) {
  const found = []
  for (const m of stripFences(body).matchAll(/^(#{1,6})\s+(.+?)\s*#*\s*$/gm)) {
    found.push({ level: m[1].length, text: headingText(m[2]), slug: headingAnchor(m[2]) })
  }
  return found
}
