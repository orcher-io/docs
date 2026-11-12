import { type PropsWithChildren } from 'react'

import HomePageCover, { type HeroTab } from '~/components/HomePageCover'
import { CodeBlock } from '~/features/ui/CodeBlock/CodeBlock'
import { resolveSample } from '~/lib/samples.mjs'
import { SidebarSkeleton } from './MainSkeleton'

/**
 * The hero shows the quickstart's workflow: the `hero` region of the same
 * sample files the quickstart page includes, which CI compiles against the
 * published SDKs.
 */
const HERO_SAMPLES = [
  { id: 'rust', label: 'Rust', file: 'worker.rs', lang: 'rust', path: 'rust/quickstart/src/bin/worker.rs' },
  { id: 'python', label: 'Python', file: 'worker.py', lang: 'python', path: 'python/quickstart/worker.py' },
  { id: 'typescript', label: 'TypeScript', file: 'worker.ts', lang: 'typescript', path: 'typescript/src/quickstart/worker.ts' },
]

const HomeLayout = ({ children }: PropsWithChildren) => {
  const tabs: HeroTab[] = HERO_SAMPLES.map(({ path, lang, ...tab }) => ({
    ...tab,
    code: (
      <CodeBlock
        lang={lang}
        lineNumbers={false}
        contents={resolveSample({ path, region: 'hero' }).code}
        className="border-0 rounded-none bg-background"
      />
    ),
  }))

  return (
    <SidebarSkeleton hideSideNav>
      <article>
        <HomePageCover tabs={tabs} />
        <div className="relative transition-all ease-out duration-150">{children}</div>
      </article>
    </SidebarSkeleton>
  )
}

export default HomeLayout
