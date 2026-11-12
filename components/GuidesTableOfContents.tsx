'use client'

import { cn } from 'ui'
import { Toc, TOCItems, TOCScrollArea } from 'ui-patterns/Toc'
import { useTocAnchors } from '../features/docs/GuidesMdx.state'

interface TOCHeader {
  id?: string
  text: string
  link: string
  level: number
}

const GuidesTableOfContents = ({ className }: { className?: string }) => {
  const { toc } = useTocAnchors()

  return (
    <div className={cn('thin-scrollbar overflow-y-auto h-fit', 'px-px', className)}>
      <div className="w-full relative border-l flex flex-col gap-6 lg:gap-8 pl-5 pr-2 h-fit">
        {toc.length !== 0 && (
          <Toc className="toc-menu -ml-[calc(0.25rem+6px)]">
            <h3 className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-foreground pl-[calc(1.5rem+6px)]">
              On this page
            </h3>
            <TOCScrollArea>
              <TOCItems items={toc} showTrack />
            </TOCScrollArea>
          </Toc>
        )}
      </div>
    </div>
  )
}

export default GuidesTableOfContents
export type { TOCHeader }
