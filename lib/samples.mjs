// @ts-check
/**
 * Code-sample includes.
 *
 * Every Rust, TypeScript and Python sample shown in the guides lives as a real
 * source file under `samples/`, where `scripts/check-samples.sh` compiles it
 * against the published SDKs. A guide pulls code in with a directive on a line
 * of its own:
 *
 *   <$CodeSample path="rust/quickstart/src/main.rs" region="workflow" />
 *
 * `path` is relative to `samples/`. `region` is optional: without it the whole
 * file is shown. A region is delimited in the source by comment lines
 * containing `[start:NAME]` and `[end:NAME]`, e.g.
 *
 *   // [start:workflow]
 *   ...
 *   // [end:workflow]
 *
 * Regions may nest or overlap. Marker lines are never shown, and the region is
 * de-indented to its least-indented line. Optional `lang` overrides the
 * language inferred from the extension, and `title` is passed through as the
 * code fence's meta string.
 *
 * The directive is expanded to a plain fenced code block before MDX
 * compilation, so it works anywhere a fenced block does, including inside
 * <TabPanel>.
 */
import { readFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'

export const SAMPLES_DIRECTORY = join(process.cwd(), 'samples')

const DIRECTIVE = /^([ \t]*)<\$CodeSample\b([^>]*?)\/>[ \t]*$/gm
const ATTRIBUTE = /([a-zA-Z]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
const MARKER = /\[(start|end):([A-Za-z0-9_.-]+)\]/

const LANGUAGES = {
  rs: 'rust',
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  mjs: 'javascript',
  py: 'python',
  sh: 'bash',
  toml: 'toml',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
}

/** @param {string} raw */
function parseAttributes(raw) {
  /** @type {Record<string, string>} */
  const attributes = {}
  for (const match of raw.matchAll(ATTRIBUTE)) {
    attributes[match[1]] = match[2] ?? match[3]
  }
  return attributes
}

/**
 * Return the lines of `source` inside `region` (or the whole file), with all
 * marker lines removed and common indentation stripped.
 *
 * @param {string} source
 * @param {string | undefined} region
 * @param {string} where for error messages
 */
export function extractRegion(source, region, where) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  /** @type {string[]} */
  const kept = []
  let inside = region === undefined
  let found = region === undefined
  let closed = region === undefined
  for (const line of lines) {
    const marker = line.match(MARKER)
    if (marker) {
      if (marker[2] === region) {
        if (marker[1] === 'start') {
          inside = true
          found = true
        } else {
          inside = false
          closed = true
        }
      }
      continue
    }
    if (inside) kept.push(line)
  }
  if (!found) throw new Error(`${where}: region "${region}" not found`)
  if (!closed) throw new Error(`${where}: region "${region}" has no [end:${region}] marker`)

  while (kept.length && kept[0].trim() === '') kept.shift()
  while (kept.length && kept[kept.length - 1].trim() === '') kept.pop()
  const indent = Math.min(
    ...kept.filter((l) => l.trim() !== '').map((l) => l.match(/^[ \t]*/)?.[0].length ?? 0)
  )
  return kept.map((l) => l.slice(Number.isFinite(indent) ? indent : 0)).join('\n')
}

/**
 * Resolve one directive's attributes to `{ lang, meta, code }`.
 *
 * @param {Record<string, string>} attributes
 * @param {string} samplesDirectory
 */
export function resolveSample(attributes, samplesDirectory = SAMPLES_DIRECTORY) {
  const { path, region, lang, title } = attributes
  if (!path) throw new Error('<$CodeSample> needs a path attribute')
  const root = resolve(samplesDirectory)
  const file = resolve(root, path)
  if (!file.startsWith(root + sep)) {
    throw new Error(`<$CodeSample path="${path}">: path must stay inside samples/`)
  }
  let source
  try {
    source = readFileSync(file, 'utf-8')
  } catch {
    throw new Error(`<$CodeSample path="${path}">: file not found under samples/`)
  }
  const code = extractRegion(source, region, `samples/${path}`)
  const extension = path.split('.').pop() ?? ''
  return {
    lang: lang ?? LANGUAGES[extension] ?? '',
    meta: title ?? '',
    code,
  }
}

/**
 * List every directive in an MDX source.
 *
 * @param {string} mdx
 * @returns {Array<{ indent: string, attributes: Record<string, string>, line: number }>}
 */
export function findSampleDirectives(mdx) {
  const found = []
  for (const match of mdx.matchAll(DIRECTIVE)) {
    const line = mdx.slice(0, match.index).split('\n').length
    found.push({ indent: match[1], attributes: parseAttributes(match[2]), line })
  }
  return found
}

/**
 * Replace every `<$CodeSample ... />` line with the fenced code block it
 * names. Throws on a missing file or region, which fails the build.
 *
 * @param {string} mdx
 * @param {string} [samplesDirectory]
 */
export function expandCodeSamples(mdx, samplesDirectory = SAMPLES_DIRECTORY) {
  if (!mdx.includes('<$CodeSample')) return mdx
  return mdx.replace(DIRECTIVE, (_whole, indent, rawAttributes) => {
    const { lang, meta, code } = resolveSample(parseAttributes(rawAttributes), samplesDirectory)
    const longestRun = Math.max(2, ...(code.match(/`+/g) ?? []).map((run) => run.length))
    const fence = '`'.repeat(longestRun + 1)
    const body = code
      .split('\n')
      .map((line) => (line ? indent + line : line))
      .join('\n')
    return `${indent}${fence}${lang}${meta ? ` ${meta}` : ''}\n${body}\n${indent}${fence}`
  })
}
