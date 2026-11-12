import {
  getGuidesMarkdown,
  genGuideMeta,
  genGuidesStaticParams,
} from '~/features/docs/GuidesMdx.utils'
import { GuideTemplate } from '~/features/docs/GuidesMdx.template'

type Params = { slug?: string[] }

const CoreGuidePage = async (props: { params: Promise<Params> }) => {
  const params = await props.params
  const slug = ['core', ...(params.slug ?? [])]
  const data = await getGuidesMarkdown(slug)

  return <GuideTemplate {...data!} />
}

const generateStaticParams = genGuidesStaticParams('core')
const generateMetadata = genGuideMeta((params: { slug?: string[] }) =>
  getGuidesMarkdown(['core', ...(params.slug ?? [])])
)

export default CoreGuidePage
export { generateStaticParams, generateMetadata }
