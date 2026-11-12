import {
  getGuidesMarkdown,
  genGuideMeta,
  genGuidesStaticParams,
} from '~/features/docs/GuidesMdx.utils'
import { GuideTemplate } from '~/features/docs/GuidesMdx.template'

type Params = { slug?: string[] }

const LearningGuidePage = async (props: { params: Promise<Params> }) => {
  const params = await props.params
  const slug = ['learning', ...(params.slug ?? [])]
  const data = await getGuidesMarkdown(slug)

  return <GuideTemplate {...data!} />
}

const generateStaticParams = genGuidesStaticParams('learning')
const generateMetadata = genGuideMeta((params: { slug?: string[] }) =>
  getGuidesMarkdown(['learning', ...(params.slug ?? [])])
)

export default LearningGuidePage
export { generateStaticParams, generateMetadata }
