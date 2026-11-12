#!/usr/bin/env node
// @ts-check
/**
 * Check the code in the guides (content/guides/**\/*.mdx) without compiling it.
 * scripts/check-samples.sh runs this before it compiles samples/.
 *
 * Two checks, chosen by flag:
 *
 *   (default)  Code fences. A ```rust / ```ts / ```python block (and their
 *              aliases) must come from samples/ through <$CodeSample>, where it
 *              is compiled; a fence typed into the page is a violation unless
 *              the line above it (ignoring blank lines) opts it out with a
 *              reason:
 *
 *                {/* sample-check: skip — shows a compile error on purpose *\/}
 *
 *              Every <$CodeSample> directive must resolve to a file and region
 *              under samples/. That is enforced on every page, always.
 *              ```javascript / ```js fences are counted separately and never
 *              enforced: there is no JavaScript sample project to move them to.
 *
 *   --cli      CLI invocations. Every line of a ```bash / ```sh / ```shell /
 *              ```console block that runs `orcher ...` must name a subcommand
 *              path that exists (`orcher <path> --help` exits 0) and only
 *              flags that appear in that subcommand's help. The CLI is taken
 *              from $ORCHER_CLI (default `orcher`; may be several words, e.g.
 *              `uvx --from orcher==0.1.1 orcher`).
 *
 * Enforcement: findings on a page listed in content/verified-pages.txt fail the
 * run; findings elsewhere are counted and reported only. --strict enforces
 * every page. Once every page is listed, CI flips to --strict.
 *
 * Exit status: 0 when nothing enforced failed, 1 otherwise, 2 on a usage or
 * setup error.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findSampleDirectives, resolveSample } from '../lib/samples.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(ROOT, 'content', 'guides')
const SAMPLES = join(ROOT, 'samples')
const CHECKED_PAGES = join(ROOT, 'content', 'verified-pages.txt')

const args = process.argv.slice(2)
const known = new Set(['--strict', '--cli', '--verbose', '--help'])
for (const arg of args) {
  if (!known.has(arg)) {
    console.error(`check-fences: unknown argument ${arg}`)
    process.exit(2)
  }
}
if (args.includes('--help')) {
  console.log('usage: node scripts/check-fences.mjs [--cli] [--strict] [--verbose]')
  process.exit(0)
}
const STRICT = args.includes('--strict')
const CLI_MODE = args.includes('--cli')
const VERBOSE = args.includes('--verbose')

/** Fence languages that must come from samples/, by the toolchain that checks them. */
const CHECKED_LANGUAGES = {
  rust: 'rust',
  rs: 'rust',
  ts: 'typescript',
  typescript: 'typescript',
  tsx: 'typescript',
  python: 'python',
  py: 'python',
}
/** Counted, never enforced. */
const REPORTED_LANGUAGES = { javascript: 'javascript', js: 'javascript', jsx: 'javascript', mjs: 'javascript' }
const SHELL_LANGUAGES = new Set(['bash', 'sh', 'shell', 'console', 'zsh'])

const OPT_OUT = /^\s*\{\/\*\s*sample-check:\s*skip\s*(?:—|–|--|-|:)\s*(\S.*?)\s*\*\/\}\s*$/
const OPT_OUT_ANY = /sample-check:\s*skip/

// ---------------------------------------------------------------------------
// Pages

/** @param {string} directory @returns {string[]} */
function mdxFiles(directory) {
  /** @type {string[]} */
  const out = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) out.push(...mdxFiles(path))
    else if (entry.name.endsWith('.mdx')) out.push(path)
  }
  return out.sort()
}

/** Repo-relative, forward slashes. @param {string} path */
const rel = (path) => relative(ROOT, path).split(sep).join('/')

function readCheckedPages() {
  if (!existsSync(CHECKED_PAGES)) return new Set()
  const pages = new Set()
  let bad = false
  for (const raw of readFileSync(CHECKED_PAGES, 'utf-8').split('\n')) {
    const line = raw.replace(/#.*/, '').trim()
    if (!line) continue
    if (!existsSync(join(ROOT, line))) {
      console.error(`content/verified-pages.txt: ${line} does not exist`)
      bad = true
    }
    pages.add(line)
  }
  if (bad) process.exit(2)
  return pages
}

/**
 * Every fenced block in an MDX source.
 *
 * @param {string} mdx
 * @returns {Array<{ lang: string, line: number, body: string[], previous: string }>}
 */
function findFences(mdx) {
  const lines = mdx.replace(/\r\n/g, '\n').split('\n')
  const fences = []
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^\s*(`{3,}|~{3,})\s*([^`\s]*)(.*)$/)
    if (!open) continue
    const marker = open[1]
    const lang = open[2].toLowerCase().replace(/^\{?\.?/, '').replace(/[{}].*$/, '')
    let previous = ''
    for (let j = i - 1; j >= 0; j--) {
      if (lines[j].trim() !== '') {
        previous = lines[j]
        break
      }
    }
    const body = []
    let j = i + 1
    const close = new RegExp(`^\\s*${marker[0] === '`' ? '`' : '~'}{${marker.length},}\\s*$`)
    for (; j < lines.length && !close.test(lines[j]); j++) body.push(lines[j])
    fences.push({ lang, line: i + 1, body, previous })
    i = j
  }
  return fences
}

const checkedPages = readCheckedPages()
const pages = mdxFiles(CONTENT)
/** @param {string} page */
const enforced = (page) => STRICT || checkedPages.has(page)

if (CLI_MODE) process.exit(checkCli())
process.exit(checkFences())

// ---------------------------------------------------------------------------
// Fences

function checkFences() {
  const totals = {
    included: { rust: 0, typescript: 0, python: 0, other: 0 },
    optedOut: { rust: 0, typescript: 0, python: 0 },
    unchecked: { rust: 0, typescript: 0, python: 0 },
    javascript: 0,
    brokenDirectives: 0,
    badOptOuts: 0,
  }
  let enforcedFailures = 0
  let pagesWithUnchecked = 0
  /** @type {string[]} */
  const reportOnly = []

  for (const file of pages) {
    const page = rel(file)
    const mdx = readFileSync(file, 'utf-8')
    const enforce = enforced(page)
    /** @type {string[]} */
    const problems = []
    /** @type {string[]} */
    const hardProblems = []

    for (const directive of findSampleDirectives(mdx)) {
      try {
        const { lang } = resolveSample(directive.attributes, SAMPLES)
        const language = CHECKED_LANGUAGES[/** @type {keyof typeof CHECKED_LANGUAGES} */ (lang)]
        if (language) totals.included[/** @type {'rust'|'typescript'|'python'} */ (language)]++
        else totals.included.other++
      } catch (error) {
        totals.brokenDirectives++
        hardProblems.push(`${page}:${directive.line}: ${/** @type {Error} */ (error).message}`)
      }
    }

    const counts = { rust: 0, typescript: 0, python: 0 }
    for (const fence of findFences(mdx)) {
      if (fence.lang in REPORTED_LANGUAGES) {
        totals.javascript++
        continue
      }
      const language = CHECKED_LANGUAGES[/** @type {keyof typeof CHECKED_LANGUAGES} */ (fence.lang)]
      if (!language) continue
      if (OPT_OUT.test(fence.previous)) {
        totals.optedOut[/** @type {'rust'|'typescript'|'python'} */ (language)]++
        continue
      }
      if (OPT_OUT_ANY.test(fence.previous)) {
        totals.badOptOuts++
        problems.push(
          `${page}:${fence.line}: sample-check opt-out needs a reason: {/* sample-check: skip — <reason> */}`
        )
      } else {
        problems.push(
          `${page}:${fence.line}: \`\`\`${fence.lang} block is not from samples/ (use <$CodeSample>, or opt out with a reason)`
        )
      }
      totals.unchecked[/** @type {'rust'|'typescript'|'python'} */ (language)]++
      counts[/** @type {'rust'|'typescript'|'python'} */ (language)]++
    }

    for (const problem of hardProblems) console.log(`ERROR    ${problem}`)
    enforcedFailures += hardProblems.length

    if (problems.length) {
      pagesWithUnchecked++
      if (enforce) {
        for (const problem of problems) console.log(`ERROR    ${problem}`)
        enforcedFailures += problems.length
      } else {
        reportOnly.push(
          `${page}: ${problems.length} unchecked (rust ${counts.rust}, typescript ${counts.typescript}, python ${counts.python})`
        )
        if (VERBOSE) for (const problem of problems) console.log(`report   ${problem}`)
      }
    }
  }

  if (reportOnly.length && !VERBOSE) {
    console.log(`report-only pages with unchecked fences (${reportOnly.length}; --verbose lists each fence):`)
    for (const line of reportOnly) console.log(`  ${line}`)
  }

  const sum = (/** @type {Record<string, number>} */ o) => Object.values(o).reduce((a, b) => a + b, 0)
  console.log('')
  console.log(`fence check: ${pages.length} pages, ${STRICT ? 'all enforced (--strict)' : `${checkedPages.size} enforced (content/verified-pages.txt)`}`)
  console.log(
    `  included from samples/: ${sum(totals.included)}  (rust ${totals.included.rust}, typescript ${totals.included.typescript}, python ${totals.included.python}, other ${totals.included.other})`
  )
  console.log(
    `  opted out:              ${sum(totals.optedOut)}  (rust ${totals.optedOut.rust}, typescript ${totals.optedOut.typescript}, python ${totals.optedOut.python})`
  )
  console.log(
    `  unchecked:              ${sum(totals.unchecked)}  (rust ${totals.unchecked.rust}, typescript ${totals.unchecked.typescript}, python ${totals.unchecked.python}) on ${pagesWithUnchecked} pages`
  )
  console.log(`  javascript (report only): ${totals.javascript}`)
  console.log(`  broken <$CodeSample> directives: ${totals.brokenDirectives}`)
  console.log(`  enforced failures: ${enforcedFailures}`)
  return enforcedFailures ? 1 : 0
}

// ---------------------------------------------------------------------------
// CLI invocations

function checkCli() {
  const cli = (process.env.ORCHER_CLI ?? 'orcher').trim().split(/\s+/)
  const probe = spawnSync(cli[0], [...cli.slice(1), '--version'], { encoding: 'utf-8' })
  if (probe.error || probe.status !== 0) {
    console.error(`check-fences --cli: cannot run \`${cli.join(' ')} --version\`; install the orcher CLI or set ORCHER_CLI`)
    return 2
  }
  console.log(`cli check against ${probe.stdout.trim()}`)

  /** @type {Map<string, { ok: boolean, help: string }>} */
  const helpCache = new Map()
  /** @param {string[]} path */
  function help(path) {
    const key = path.join(' ')
    let cached = helpCache.get(key)
    if (!cached) {
      const run = spawnSync(cli[0], [...cli.slice(1), ...path, '--help'], { encoding: 'utf-8' })
      cached = { ok: run.status === 0, help: `${run.stdout ?? ''}\n${run.stderr ?? ''}` }
      helpCache.set(key, cached)
    }
    return cached
  }
  /** @type {Map<string, boolean>} */
  const flagCache = new Map()
  /** @param {string} text */
  const hasSubcommands = (text) => /^Commands:\s*$/m.test(text)
  /** @param {string} flag */
  const escape = (flag) => flag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  /** @param {string} text @param {string} flag */
  const flagIn = (text, flag) => new RegExp(`(^|[\\s,\\[])${escape(flag)}(?=[\\s,=\\]<]|$)`, 'm').test(text)
  /** @param {string} text @param {string} flag */
  const flagTakesValue = (text, flag) => new RegExp(`${escape(flag)}[ =]<`, 'm').test(text)

  /**
   * Check one `orcher ...` command (tokens after `orcher`).
   * @param {string[]} tokens
   * @returns {string | null} a problem, or null
   */
  function checkCommand(tokens) {
    /** @type {string[]} */
    const path = []
    let current = help(path)
    let descending = true
    /** @type {string[]} */
    const flags = []
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (token === '--') break
      if (token.startsWith('-')) {
        const flag = token.replace(/=.*$/, '')
        flags.push(flag)
        if (!token.includes('=') && flagTakesValue(current.help, flag)) i++
        continue
      }
      if (!descending || !hasSubcommands(current.help)) {
        descending = false
        continue
      }
      if (/^[<$"'{[]/.test(token)) return `\`orcher ${path.join(' ')}\` expects a subcommand, got ${token}`
      const next = help([...path, token])
      if (!next.ok) return `unknown subcommand \`orcher ${[...path, token].join(' ')}\``
      path.push(token)
      current = next
    }
    if (hasSubcommands(current.help) && path.length === 0 && !flags.some((f) => ['--help', '-h', '--version', '-V'].includes(f))) {
      return '`orcher` with no subcommand'
    }
    for (const flag of flags) {
      if (/^-[A-Za-z]{2,}$/.test(flag)) continue // combined short flags
      if (!flagAccepted(path, current.help, flag)) return `\`orcher ${path.join(' ')}\` has no flag ${flag}`
    }
    return null
  }

  /**
   * A flag is accepted when the help lists it or, for hidden flags and
   * aliases, when the CLI parses it: `orcher <path> <flag> --help` (or with a
   * dummy value) exits 0, and an unknown flag exits 2 before --help is seen.
   *
   * @param {string[]} path @param {string} text @param {string} flag
   */
  function flagAccepted(path, text, flag) {
    if (flagIn(text, flag)) return true
    const key = `${path.join(' ')}\u0000${flag}`
    let accepted = flagCache.get(key)
    if (accepted === undefined) {
      const run = (/** @type {string[]} */ extra) =>
        spawnSync(cli[0], [...cli.slice(1), ...path, ...extra, '--help'], { encoding: 'utf-8' }).status === 0
      accepted = run([flag]) || run([flag, 'x'])
      flagCache.set(key, accepted)
    }
    return accepted
  }

  /** @param {string} line @returns {string[]} */
  function tokenize(line) {
    const tokens = []
    for (const match of line.matchAll(/"[^"]*"|'[^']*'|\S+/g)) tokens.push(match[0])
    return tokens
  }

  let invocations = 0
  let enforcedFailures = 0
  let reportOnlyFailures = 0
  /** @type {Map<string, number>} */
  const perPage = new Map()

  for (const file of pages) {
    const page = rel(file)
    const enforce = enforced(page)
    for (const fence of findFences(readFileSync(file, 'utf-8'))) {
      if (!SHELL_LANGUAGES.has(fence.lang)) continue
      // Join continuation lines; for console blocks keep only prompted lines.
      const joined = fence.body.join('\n').replace(/\\\n\s*/g, ' ').split('\n')
      const prompted = joined.some((l) => /^\s*[$%] /.test(l))
      joined.forEach((raw, index) => {
        let line = raw
        if (fence.lang === 'console' || prompted) {
          if (!/^\s*[$%] /.test(line)) return
          line = line.replace(/^\s*[$%] /, '')
        }
        line = line.replace(/(^|\s)#.*$/, '')
        for (const segment of line.split(/&&|\|\||;|\||\$\(|`/)) {
          const tokens = tokenize(segment)
          while (tokens.length && (/^[A-Z_][A-Z0-9_]*=/.test(tokens[0]) || ['sudo', 'env', 'exec', 'time', 'then', 'do'].includes(tokens[0]))) tokens.shift()
          if (tokens[0] !== 'orcher') continue
          invocations++
          const problem = checkCommand(tokens.slice(1))
          if (!problem) continue
          const where = `${page}:${fence.line + 1 + index}`
          perPage.set(page, (perPage.get(page) ?? 0) + 1)
          if (enforce) {
            enforcedFailures++
            console.log(`ERROR    ${where}: ${problem}   [${tokens.join(' ')}]`)
          } else {
            reportOnlyFailures++
            if (VERBOSE) console.log(`report   ${where}: ${problem}   [${tokens.join(' ')}]`)
          }
        }
      })
    }
  }

  const reportPages = [...perPage].filter(([page]) => !enforced(page))
  if (reportPages.length && !VERBOSE) {
    console.log(`report-only pages with CLI mismatches (${reportPages.length}; --verbose lists each):`)
    for (const [page, count] of reportPages) console.log(`  ${page}: ${count}`)
  }
  console.log('')
  console.log(`cli check: ${invocations} \`orcher\` invocations in shell blocks across ${pages.length} pages`)
  console.log(`  mismatches on enforced pages: ${enforcedFailures}`)
  console.log(`  mismatches on report-only pages: ${reportOnlyFailures}`)
  return enforcedFailures ? 1 : 0
}
