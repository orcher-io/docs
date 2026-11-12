import Layout from '~/layouts/guides'

export default async function SdkLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>
}
