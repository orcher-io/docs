import '../styles/main.scss'
import '../styles/new-docs.scss'

import type { Metadata, Viewport } from 'next'
import { Rubik, Manrope, JetBrains_Mono } from 'next/font/google'
import { GlobalProviders } from '~/features/app.providers'
import { TopNavSkeleton } from '~/layouts/MainSkeleton'
import { BASE_PATH, SITE_ORIGIN } from '~/lib/constants'

const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
})

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

const metadata: Metadata = {
  applicationName: 'Orcher Docs',
  title: {
    template: '%s — Orcher Docs',
    default: 'Orcher Documentation',
  },
  description:
    'Orcher is a durable workflow orchestration platform built with Rust, providing automatic journaling and multi-language SDK support.',
  metadataBase: new URL(SITE_ORIGIN),
  // Next does not apply basePath to metadata URLs, so prefix them here.
  icons: {
    icon: [
      { url: `${BASE_PATH}/favicon/favicon.ico`, sizes: 'any' },
      { url: `${BASE_PATH}/favicon/favicon.svg`, type: 'image/svg+xml' },
      { url: `${BASE_PATH}/favicon/favicon-96x96.png`, sizes: '96x96', type: 'image/png' },
    ],
    apple: `${BASE_PATH}/favicon/apple-touch-icon.png`,
  },
  manifest: `${BASE_PATH}/favicon/site.webmanifest`,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'article',
    authors: 'Orcher',
    url: BASE_PATH || '/',
    images: `${BASE_PATH}/img/orcher-og-image.png`,
  },
  twitter: {
    card: 'summary_large_image',
    images: `${BASE_PATH}/img/orcher-og-image.png`,
  },
}

const viewport: Viewport = {
  themeColor: '#1E1E1E',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${rubik.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
        <GlobalProviders>
          <TopNavSkeleton>{children}</TopNavSkeleton>
        </GlobalProviders>
      </body>
    </html>
  )
}

export { metadata, viewport }
export default RootLayout
