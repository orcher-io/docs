import Layout from '~/layouts/guides'

export default async function CoreLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>
}
