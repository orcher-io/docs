import 'server-only'
import { type Metadata, type ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { readFile, readdir, stat } from 'node:fs/promises'
import { extname, join, relative, sep } from 'node:path'
import matter from 'gray-matter'

import { pluckPromise } from '~/features/helpers.fn'
import type { OrPromise } from '~/features/helpers.types'
import { BASE_PATH, GITHUB_DOCS_REPO } from '~/lib/constants'
import { DOCS_DIRECTORY, GUIDES_DIRECTORY, isValidGuideFrontmatter, type GuideFrontmatter } from '~/lib/docs'
import { newEditLink } from './GuidesMdx.template'

const PUBLISHED_SECTIONS = [
  'api',
  'core',
  'deployment',
  'getting-started',
  'learning',
  'local-development',
  'observability',
  'operations',
  'overview',
  'patterns',
  'resources',
  'sdk',
  'security',
  'use-cases',
] as const

async function existsFile(path: string): Promise<boolean> {
  try {
    const s = await stat(path)
    return s.isFile()
  } catch {
    return false
  }
}

const getGuidesMarkdown = async (slug: string[]) => {
  const relPath = slug.join(sep).replace(/\/$/, '')
  const fullPath = join(GUIDES_DIRECTORY, relPath + '.mdx')
  const indexPath = join(GUIDES_DIRECTORY, relPath, 'index.mdx')

  if (
    !fullPath.startsWith(GUIDES_DIRECTORY) ||
    !PUBLISHED_SECTIONS.some((section) => relPath.startsWith(section))
  ) {
    notFound()
  }

  try {
    const resolvedPath = (await existsFile(fullPath)) ? fullPath : indexPath
    const raw = await readFile(resolvedPath, 'utf-8')
    const { data: meta, content } = matter(raw)

    if (!isValidGuideFrontmatter(meta)) {
      throw Error(`Type of frontmatter is not valid for path: ${fullPath}`)
    }

    const editLink = newEditLink(
      `${GITHUB_DOCS_REPO}/edit/main/${relative(DOCS_DIRECTORY, resolvedPath).split(sep).join('/')}`
    )

    return {
      pathname: `/guides/${slug.join('/')}` satisfies `/${string}`,
      meta,
      content,
      editLink,
    }
  } catch (error: unknown) {
    console.log('Could not read Markdown at path: %s', fullPath)
    notFound()
  }
}

/**
 * Static params for every page of one section: `<section>.mdx` is the section
 * root, `<section>/a/b.mdx` is `[a, b]`, and `<section>/a/index.mdx` is `[a]`.
 */
const genGuidesStaticParams = (section: string) => async () => {
  // A section may be a single page (`<section>.mdx`) with no directory.
  const files = await readdir(join(GUIDES_DIRECTORY, section), { recursive: true }).catch(
    () => [] as string[]
  )
  const slugs = new Set<string>()
  for (const file of files) {
    if (extname(file) !== '.mdx' || file.split(sep).at(-1)?.startsWith('_')) continue
    const parts = file.replace(/\.mdx$/, '').split(sep)
    if (parts.at(-1) === 'index') parts.pop()
    slugs.add(parts.join('/'))
  }
  if (await existsFile(join(GUIDES_DIRECTORY, `${section}.mdx`))) slugs.add('')
  return [...slugs].map((slug) => ({ slug: slug ? slug.split('/') : [] }))
}

const genGuideMeta =
  <Params,>(
    generate: (params: Params) => OrPromise<{ meta: GuideFrontmatter; pathname: `/${string}` }>
  ) =>
  async (props: { params: Promise<Params> }, parent: ResolvingMetadata): Promise<Metadata> => {
    const params = await props.params
    const [parentAlternates, parentOg, { meta, pathname }] = await Promise.all([
      pluckPromise(parent, 'alternates'),
      pluckPromise(parent, 'openGraph'),
      generate(params),
    ])

    return {
      title: meta.title,
      description: meta.description || meta.subtitle,
      // @ts-ignore
      alternates: {
        ...parentAlternates,
        canonical: meta.canonical || `${BASE_PATH}${pathname}`,
      },
      openGraph: {
        ...parentOg,
        url: `${BASE_PATH}${pathname}`,
        images: `${BASE_PATH}/img/orcher-og-image.png`,
      },
    }
  }

export { genGuideMeta, genGuidesStaticParams, getGuidesMarkdown }
