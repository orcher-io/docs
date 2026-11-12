// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
'use client'

import { debounce } from 'lodash'
import { useCallback, useMemo, useReducer, useRef } from 'react'

enum PageType {
  Markdown = 'markdown',
  Reference = 'reference',
  Integration = 'partner-integration',
  GithubDiscussion = 'github-discussions',
}

interface PageSection {
  heading: string
  slug: string
}

interface Page {
  id: number
  path: string
  type: PageType
  title: string
  subtitle: string | null
  description: string | null
  sections: PageSection[]
}

type SearchState =
  | {
      status: 'initial'
      key: number
    }
  | {
      status: 'loading'
      key: number
      staleResults: Page[]
    }
  | {
      status: 'partialResults'
      key: number
      results: Page[]
    }
  | {
      status: 'fullResults'
      key: number
      results: Page[]
    }
  | {
      status: 'noResults'
      key: number
    }
  | {
      status: 'error'
      key: number
      message: string
    }

type Action =
  | {
      type: 'resultsReturned'
      key: number
      results: Page[]
    }
  | {
      type: 'newSearchDispatched'
      key: number
    }
  | {
      type: 'reset'
      key: number
    }
  | {
      type: 'errored'
      key: number
      message: string
    }

// Search index types
interface SearchDocument {
  id: string
  path: string
  title: string
  description: string | null
  content: string
  headings: { text: string; slug: string }[]
}

// Cached search index
let searchIndex: SearchDocument[] | null = null
let indexLoading: Promise<SearchDocument[] | null> | null = null

async function loadSearchIndex(): Promise<SearchDocument[] | null> {
  if (searchIndex) return searchIndex
  if (indexLoading) return indexLoading

  indexLoading = (async () => {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      // Generated at build time by scripts/build-search-index.mjs.
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/docs'
      const response = await fetch(`${basePath}/search/index.json`)
      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`)
      }
      searchIndex = await response.json()
      return searchIndex
    } catch (error) {
      console.warn(
        'Search index not available. Run `pnpm build:search` to generate it.'
      )
      return null
    }
  })()

  return indexLoading
}

function searchDocuments(documents: SearchDocument[], query: string): Page[] {
  const queryLower = query.toLowerCase().trim()
  const queryTerms = queryLower.split(/\s+/).filter(Boolean)

  if (queryTerms.length === 0) {
    return []
  }

  // Score each document
  const scored = documents.map((doc) => {
    let score = 0
    const titleLower = doc.title.toLowerCase()
    const descLower = (doc.description || '').toLowerCase()
    const contentLower = doc.content.toLowerCase()

    for (const term of queryTerms) {
      // Title matches (highest weight)
      if (titleLower.includes(term)) {
        score += 100
        if (titleLower.startsWith(term)) {
          score += 50
        }
      }

      // Description matches
      if (descLower.includes(term)) {
        score += 30
      }

      // Heading matches
      for (const heading of doc.headings) {
        if (heading.text.toLowerCase().includes(term)) {
          score += 20
        }
      }

      // Content matches (count occurrences, cap at 10)
      const contentMatches = contentLower.split(term).length - 1
      score += Math.min(contentMatches, 10) * 2
    }

    return { doc, score }
  })

  // Filter and sort by score
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((item, index) => ({
      id: index,
      path: item.doc.path,
      type: PageType.Markdown,
      title: item.doc.title,
      subtitle: null,
      description: item.doc.description,
      sections: item.doc.headings.slice(0, 3).map((h) => ({
        heading: h.text,
        slug: h.slug,
      })),
    }))
}

function reducer(state: SearchState, action: Action): SearchState {
  if (state.key > action.key) {
    return state
  }
  switch (action.type) {
    case 'resultsReturned':
      if (!action.results.length) {
        return {
          status: 'noResults',
          key: action.key,
        }
      }
      return {
        status: 'fullResults',
        key: action.key,
        results: action.results,
      }
    case 'newSearchDispatched':
      return {
        status: 'loading',
        key: action.key,
        staleResults:
          'results' in state ? state.results : 'staleResults' in state ? state.staleResults : [],
      }
    case 'reset':
      return {
        status: 'initial',
        key: action.key,
      }
    case 'errored':
      return {
        status: 'error',
        key: action.key,
        message: action.message,
      }
    default:
      return state
  }
}

const useDocsSearch = () => {
  const [state, dispatch] = useReducer(reducer, { status: 'initial', key: 0 })
  const key = useRef(0)

  const handleSearch = useCallback(async (query: string) => {
    key.current += 1
    const localKey = key.current
    dispatch({ type: 'newSearchDispatched', key: localKey })

    try {
      const index = await loadSearchIndex()
      if (!index) {
        dispatch({
          type: 'errored',
          key: localKey,
          message: 'Search is not available',
        })
        return
      }

      const results = searchDocuments(index, query)

      dispatch({
        type: 'resultsReturned',
        key: localKey,
        results,
      })
    } catch (error) {
      console.error('Search error:', error)
      dispatch({
        type: 'errored',
        key: localKey,
        message: error instanceof Error ? error.message : 'Search failed',
      })
    }
  }, [])

  const debouncedSearch = useMemo(() => debounce(handleSearch, 150), [handleSearch])

  const resetSearch = useCallback(() => {
    key.current += 1
    dispatch({
      type: 'reset',
      key: key.current,
    })
  }, [])

  return {
    searchState: state,
    handleDocsSearch: handleSearch,
    handleDocsSearchDebounced: debouncedSearch,
    resetSearch,
  }
}

export { useDocsSearch, PageType as DocsSearchResultType }
export type { Page as DocsSearchResult, PageSection as DocsSearchResultSection }
