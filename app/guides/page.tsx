import {
  getGuidesMarkdown,
  genGuideMeta,
} from '~/features/docs/GuidesMdx.utils'
import { GuideTemplate } from '~/features/docs/GuidesMdx.template'
import Layout from '~/layouts/guides'

const GuidesOverviewPage = async () => {
  const data = await getGuidesMarkdown(['overview'])
  return (
    <Layout>
      <GuideTemplate {...data!} />
    </Layout>
  )
}

const generateMetadata = genGuideMeta(() => getGuidesMarkdown(['overview']))

export default GuidesOverviewPage
export { generateMetadata }
