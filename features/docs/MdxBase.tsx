import { MDXRemote } from 'next-mdx-remote/rsc'
import { type ComponentProps } from 'react'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { components } from '~/features/docs/MdxBase.shared'
import { expandCodeSamples } from '~/lib/samples.mjs'
import { SerializeOptions } from '~/types/next-mdx-remote-serialize'

const mdxOptions: SerializeOptions = {
  mdxOptions: {
    useDynamicImport: true,
    remarkPlugins: [[remarkMath, { singleDollarTextMath: false }], remarkGfm],
    rehypePlugins: [rehypeKatex as any],
  },
}

const MDXRemoteBase = async ({
  source,
  options = {},
  ...props
}: ComponentProps<typeof MDXRemote> & {
  source: string
}) => {
  // Pull `<$CodeSample>` includes in from samples/ before compiling, so the
  // code shown is exactly the code scripts/check-samples.sh compiles.
  const preprocessedSource = expandCodeSamples(source)

  const { mdxOptions: { remarkPlugins, rehypePlugins, ...otherMdxOptions } = {}, ...otherOptions } =
    options
  const {
    mdxOptions: {
      remarkPlugins: originalRemarkPlugins,
      rehypePlugins: originalRehypePlugins,
      ...originalMdxOptions
    } = {},
  } = mdxOptions

  const finalOptions = {
    ...mdxOptions,
    ...otherOptions,
    mdxOptions: {
      ...originalMdxOptions,
      ...otherMdxOptions,
      remarkPlugins: [...(originalRemarkPlugins ?? []), ...(remarkPlugins ?? [])],
      rehypePlugins: [...(originalRehypePlugins ?? []), ...(rehypePlugins ?? [])],
    },
  } as SerializeOptions

  return (
    <MDXRemote
      source={preprocessedSource}
      components={components}
      options={finalOptions}
      {...props}
    />
  )
}

export { MDXRemoteBase }
