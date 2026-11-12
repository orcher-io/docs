// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
import type { ReactNode } from 'react'

export interface TOCItemType {
  title: ReactNode
  url: string
  depth: number
}

export type TableOfContents = TOCItemType[]
