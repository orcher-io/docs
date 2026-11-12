#!/usr/bin/env node
// @ts-check
/**
 * Internal link checker.
 *
 * Fails (exit 1) on any internal link, in a guide or in site code, that points
 * to a page that does not exist, or to an anchor that page does not have.
 *
 * One link style is allowed: root-relative to the docs site, without the base
 * path, e.g. `/guides/core/workflows#retries`. The MDX link component and
 * next/link add the base path (`/docs` by default) once at render time, so a
 * link written with `/docs/...` would end up as `/docs/docs/...`; such links,
 * and relative links (`./x`, `../x`), are errors too.
 *
 * Also rejected anywhere: links to a private orcher-io repository (the hosted
 * service, the marketing sites, and the archived histories of public repos),
 * which return 404 for readers.
 *
 * Usage: node scripts/check-links.mjs [--quiet]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { GUIDES, ROOT, guidePages, headingsOf, stripFences, walk } from './lib/guides.mjs'

const PUBLIC = join(ROOT, 'public')
const CODE_DIRS = ['app', 'components', 'features', 'layouts', 'lib']
const quiet = process.argv.includes('--quiet')

/** route -> absolute file */
const pages = guidePages()
const HOME = join(ROOT, 'app', 'page.tsx')
pages.set('/', HOME)

/** @type {Map<string, Set<string>>} */
const anchorCache = new Map()
/** @param {string} file @returns {Set<string>} */
function anchorsOf(file) {
  const cached = anchorCache.get(file)
  if (cached) return cached
  const text = readFileSync(file, 'utf-8')
  const ids = new Set()
  if (file.endsWith('.mdx')) {
    const body = text.replace(/^---\n[\s\S]*?\n---\n/, (fm) => fm.replace(/[^\n]/g, ''))
    for (const heading of headingsOf(body)) ids.add(heading.slug)
  }
  for (const m of text.matchAll(/\bid=["']([^"']+)["']/g)) ids.add(m[1])
  for (const m of text.matchAll(/\bid:\s*["']([^"']+)["']/g)) ids.add(m[1])
  anchorCache.set(file, ids)
  return ids
}

const PRIVATE_REPOS = String.raw`github\.com\/orcher-io\/(?:cloud|client|landing|decks|macros|[\w-]+-(?:history|archive))(?![-\w])`
const PRIVATE_REPO = new RegExp(PRIVATE_REPOS)

/** @type {Array<{ file: string, line: number, link: string, problem: string }>} */
const problems = []
let checked = 0

/**
 * @param {string} file
 * @param {number} line
 * @param {string} link
 */
function check(file, line, link) {
  const report = (problem) => problems.push({ file: relative(ROOT, file), line, link, problem })
  if (PRIVATE_REPO.test(link)) return report('links a private repository')
  if (/^(https?:|mailto:|tel:|data:)/.test(link) || link.startsWith('//')) return
  if (link.includes('${') || link.includes('{')) return // template expression
  checked++

  if (link.startsWith('#')) {
    const anchor = decodeURIComponent(link.slice(1))
    if (anchor && !anchorsOf(file).has(anchor)) report('no such anchor on this page')
    return
  }
  if (!link.startsWith('/')) return report('relative link; write it root-relative, e.g. /guides/...')
  if (link === '/docs' || link.startsWith('/docs/') || link.startsWith('/docs#')) {
    return report('includes the /docs base path; drop it (it is added at render time)')
  }

  const [pathAndQuery, hash] = link.split('#')
  const path = pathAndQuery.split('?')[0].replace(/\/$/, '') || '/'

  if (/\.[a-z0-9]+$/i.test(path)) {
    if (!existsSync(join(PUBLIC, path))) report('no such file in public/')
    return
  }
  const target = pages.get(path)
  if (!target) return report('no such page')
  if (hash) {
    const anchor = decodeURIComponent(hash)
    if (!anchorsOf(target).has(anchor)) report(`page has no #${anchor} anchor`)
  }
}

/** Patterns that capture a URL in group 1. */
const MDX_PATTERNS = [
  /\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g, // [text](url "title")
  /^\s*\[[^\]]+\]:\s*(\S+)/gm, // [ref]: url
  /\bhref=["']([^"']+)["']/g, // <Link href="..."> / <a href="...">
  /\bhref=\{["'`]([^"'`]+)["'`]\}/g, // href={"..."}
  /\bhref:\s*["'`]([^"'`]+)["'`]/g, // { href: '...' } in MDX exports
]
const CODE_PATTERNS = [
  /\bhref=["']([^"']+)["']/g,
  /\bhref=\{["'`]([^"'`$]+)["'`]\}/g,
  /\b(?:href|url|link)\s*:\s*["'`]([^"'`]+)["'`]/g,
]

function lineOf(text, index) {
  let n = 1
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) n++
  return n
}

let mdxFiles = 0
for (const file of walk(GUIDES).filter((f) => f.endsWith('.mdx'))) {
  mdxFiles++
  const text = stripFences(readFileSync(file, 'utf-8'))
    // inline code spans are not links
    .replace(/`[^`\n]*`/g, (s) => ' '.repeat(s.length))
  for (const re of MDX_PATTERNS) {
    for (const m of text.matchAll(re)) check(file, lineOf(text, m.index ?? 0), m[1])
  }
  // Private-repo links can also hide in code samples and plain text.
  const raw = readFileSync(file, 'utf-8')
  for (const m of raw.matchAll(new RegExp(String.raw`https?:\/\/` + PRIVATE_REPOS + String.raw`[^\s)"'\`>]*`, 'g'))) {
    const line = lineOf(raw, m.index ?? 0)
    if (!problems.some((p) => p.file === relative(ROOT, file) && p.line === line)) {
      problems.push({ file: relative(ROOT, file), line, link: m[0], problem: 'links a private repository' })
    }
  }
}

let codeFiles = 0
for (const dir of CODE_DIRS) {
  for (const file of walk(join(ROOT, dir)).filter((f) => /\.(tsx?|mjs)$/.test(f))) {
    if (file.endsWith(join('scripts', 'check-links.mjs'))) continue
    codeFiles++
    const text = readFileSync(file, 'utf-8')
    for (const re of CODE_PATTERNS) {
      for (const m of text.matchAll(re)) {
        const link = m[1]
        // Only judge things that look like site links or GitHub links.
        if (!(link.startsWith('/') || link.startsWith('#') || PRIVATE_REPO.test(link))) continue
        check(file, lineOf(text, m.index ?? 0), link)
      }
    }
  }
}

if (!quiet || problems.length) {
  for (const p of problems) console.log(`${p.file}:${p.line}  ${p.link}  — ${p.problem}`)
}
console.log(
  `\ncheck-links: ${pages.size} pages, ${mdxFiles} MDX + ${codeFiles} code files, ` +
    `${checked} internal links checked, ${problems.length} problem(s)`
)
process.exit(problems.length ? 1 : 0)
