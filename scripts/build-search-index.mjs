#!/usr/bin/env node
// @ts-check
/**
 * Build the client-side search index from every routed guide.
 *
 * Writes public/search/index.json, which the search box fetches. Runs before
 * `next dev` and `next build` (see package.json), so the index always matches
 * the pages being served; the output is git-ignored.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import matter from 'gray-matter'

import { ROOT, guidePages, headingsOf, stripFences } from './lib/guides.mjs'
import { expandCodeSamples } from '../lib/samples.mjs'

const OUT = join(ROOT, 'public', 'search', 'index.json')
const MAX_CONTENT = 10_000

/**
 * MDX -> searchable plain text: prose and inline code stay; JSX tags,
 * imports/exports, comments, link targets and fenced code go.
 *
 * @param {string} body
 */
function toText(body) {
  return stripFences(body)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/^\s*(import|export)\s.*$/gm, ' ')
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>|]/g, ' ')
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const documents = []
for (const [route, file] of [...guidePages()].sort(([a], [b]) => a.localeCompare(b))) {
  const { data, content } = matter(readFileSync(file, 'utf-8'))
  const body = expandCodeSamples(content)
  documents.push({
    id: route,
    path: route,
    title: String(data.title ?? route),
    description: (data.description ?? data.subtitle ?? null) && String(data.description ?? data.subtitle),
    content: toText(body).slice(0, MAX_CONTENT),
    headings: headingsOf(body)
      .filter((h) => h.level >= 2 && h.level <= 3)
      .map(({ text, slug }) => ({ text, slug })),
  })
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(documents))
console.log(`search index: ${documents.length} pages -> ${OUT.slice(ROOT.length + 1)}`)
