import { type PropsWithChildren } from 'react'

import HomePageCover from '~/components/HomePageCover'
import { SidebarSkeleton } from './MainSkeleton'

const HomeLayout = ({ children }: PropsWithChildren) => {
  return (
    <SidebarSkeleton hideSideNav>
      <article>
        <HomePageCover />
        <div className="relative transition-all ease-out duration-150">
          {children}
        </div>
      </article>
    </SidebarSkeleton>
  )
}

export default HomeLayout
