import {
  getGuidesMarkdown,
  genGuideMeta,
  genGuidesStaticParams,
} from '~/features/docs/GuidesMdx.utils'
import { GuideTemplate } from '~/features/docs/GuidesMdx.template'

type Params = { slug?: string[] }

const SdkGuidePage = async (props: { params: Promise<Params> }) => {
  const params = await props.params
  const slug = ['sdk', ...(params.slug ?? [])]
  const data = await getGuidesMarkdown(slug)

  return <GuideTemplate {...data!} />
}

const generateStaticParams = genGuidesStaticParams('sdk')
const generateMetadata = genGuideMeta((params: { slug?: string[] }) =>
  getGuidesMarkdown(['sdk', ...(params.slug ?? [])])
)

export default SdkGuidePage
export { generateStaticParams, generateMetadata }
