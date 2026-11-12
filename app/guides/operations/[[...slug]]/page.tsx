import {
  getGuidesMarkdown,
  genGuideMeta,
  genGuidesStaticParams,
} from '~/features/docs/GuidesMdx.utils'
import { GuideTemplate } from '~/features/docs/GuidesMdx.template'

type Params = { slug?: string[] }

const OperationsGuidePage = async (props: { params: Promise<Params> }) => {
  const params = await props.params
  const slug = ['operations', ...(params.slug ?? [])]
  const data = await getGuidesMarkdown(slug)

  return <GuideTemplate {...data!} />
}

const generateStaticParams = genGuidesStaticParams('operations')
const generateMetadata = genGuideMeta((params: { slug?: string[] }) =>
  getGuidesMarkdown(['operations', ...(params.slug ?? [])])
)

export default OperationsGuidePage
export { generateStaticParams, generateMetadata }
