import {
  getGuidesMarkdown,
  genGuideMeta,
  genGuidesStaticParams,
} from '~/features/docs/GuidesMdx.utils'
import { GuideTemplate } from '~/features/docs/GuidesMdx.template'

type Params = { slug?: string[] }

const PatternsGuidePage = async (props: { params: Promise<Params> }) => {
  const params = await props.params
  const slug = ['patterns', ...(params.slug ?? [])]
  const data = await getGuidesMarkdown(slug)

  return <GuideTemplate {...data!} />
}

const generateStaticParams = genGuidesStaticParams('patterns')
const generateMetadata = genGuideMeta((params: { slug?: string[] }) =>
  getGuidesMarkdown(['patterns', ...(params.slug ?? [])])
)

export default PatternsGuidePage
export { generateStaticParams, generateMetadata }
