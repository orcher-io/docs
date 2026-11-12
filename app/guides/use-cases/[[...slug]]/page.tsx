import {
  getGuidesMarkdown,
  genGuideMeta,
  genGuidesStaticParams,
} from '~/features/docs/GuidesMdx.utils'
import { GuideTemplate } from '~/features/docs/GuidesMdx.template'

type Params = { slug?: string[] }

const UseCasesGuidePage = async (props: { params: Promise<Params> }) => {
  const params = await props.params
  const slug = ['use-cases', ...(params.slug ?? [])]
  const data = await getGuidesMarkdown(slug)

  return <GuideTemplate {...data!} />
}

const generateStaticParams = genGuidesStaticParams('use-cases')
const generateMetadata = genGuideMeta((params: { slug?: string[] }) =>
  getGuidesMarkdown(['use-cases', ...(params.slug ?? [])])
)

export default UseCasesGuidePage
export { generateStaticParams, generateMetadata }
